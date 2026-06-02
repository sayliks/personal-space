# Deployment Guide

**A Personal Knowledge Space** runs anywhere Node.js and PostgreSQL are available. Here are three common patterns.

---

## Option 1: Docker Compose (Local Development or Single Host)

Use Docker Compose to run both the app and PostgreSQL together on a single
machine.

### Prerequisites
- Docker and Docker Compose installed
- Node.js 20+ (for local dev only; Docker image provides Node)

### Setup

1. **Clone and configure:**
   ```bash
   git clone https://github.com/sayliks/my-blog.git
   cd my-blog
   cp .env.example .env
   ```

2. **Edit `.env` for production:**
   ```env
   # Use the Docker service name for the database
   DATABASE_URL="postgresql://user:password@postgres:5432/knowledge_space"
   DIRECT_URL="postgresql://user:password@postgres:5432/knowledge_space"
   
   # Auth setup (required for login)
   AUTH_SECRET="<generate with: node -e 'console.log(require(\"crypto\").randomBytes(32).toString(\"hex\"))'>"
   ADMIN_EMAIL="your-email@example.com"
   ADMIN_PASSWORD="strong-password-here"
   
   # Optional: GitHub OAuth
   AUTH_GITHUB_ID="your-github-oauth-id"
   AUTH_GITHUB_SECRET="your-github-oauth-secret"
   ```

3. **Create `docker-compose.yml`:**
   ```yaml
   version: '3.8'
   services:
     postgres:
       image: postgres:16-alpine
       environment:
         POSTGRES_USER: user
         POSTGRES_PASSWORD: password
         POSTGRES_DB: knowledge_space
       volumes:
         - postgres_data:/var/lib/postgresql/data
       ports:
         - "5432:5432"
       healthcheck:
         test: ["CMD-SHELL", "pg_isready -U user -d knowledge_space"]
         interval: 10s
         timeout: 5s
         retries: 5

     app:
       build: .
       depends_on:
         postgres:
           condition: service_healthy
       ports:
         - "3000:3000"
       environment:
         NODE_ENV: production
         DATABASE_URL: "postgresql://user:password@postgres:5432/knowledge_space"
         DIRECT_URL: "postgresql://user:password@postgres:5432/knowledge_space"
         AUTH_SECRET: ${AUTH_SECRET}
         ADMIN_EMAIL: ${ADMIN_EMAIL}
         ADMIN_PASSWORD: ${ADMIN_PASSWORD}
       volumes:
         - ./public:/app/public
       restart: unless-stopped

   volumes:
     postgres_data:
   ```

4. **Create a `Dockerfile`:**
   ```dockerfile
   FROM node:20-alpine
   WORKDIR /app
   
   # Install dependencies
   COPY package*.json ./
   RUN npm ci
   
   # Generate Prisma client
   RUN npm run postinstall
   
   # Copy source code
   COPY . .
   
   # Build Next.js
   RUN npm run build
   
   # Run migrations and seed
   CMD ["sh", "-c", "npx prisma db push --skip-generate && npm run seed && npm start"]
   
   EXPOSE 3000
   ```

5. **Deploy:**
   ```bash
   docker-compose up -d
   # View logs: docker-compose logs -f app
   ```

6. **Verify:**
   - Access http://localhost:3000
   - Login at `/login` with `ADMIN_EMAIL` and `ADMIN_PASSWORD`
   - Create a note from `/admin`

---

## Option 2: Systemd Service (Linux VPS)

Run the app as a systemd service on a Linux host. Assumes PostgreSQL is already
running on the same or networked machine.

### Prerequisites
- Linux with systemd
- Node.js 20+
- PostgreSQL 14+
- A dedicated user (e.g., `knowledge`)

### Setup

1. **Create app user:**
   ```bash
   sudo useradd -m -s /bin/bash knowledge
   ```

2. **Clone repo:**
   ```bash
   sudo -u knowledge git clone https://github.com/sayliks/my-blog.git /opt/knowledge-space
   cd /opt/knowledge-space
   ```

3. **Install dependencies:**
   ```bash
   sudo -u knowledge npm ci
   sudo -u knowledge npm run postinstall
   sudo -u knowledge npm run build
   ```

4. **Configure environment:**
   ```bash
   sudo -u knowledge cp .env.example /opt/knowledge-space/.env
   sudo nano /opt/knowledge-space/.env
   ```

   Example `.env`:
   ```env
   DATABASE_URL="postgresql://knowledge_user:password@localhost:5432/knowledge_space"
   DIRECT_URL="postgresql://knowledge_user:password@localhost:5432/knowledge_space"
   AUTH_SECRET="<strong-random-string>"
   ADMIN_EMAIL="admin@example.com"
   ADMIN_PASSWORD="strong-password"
   ```

5. **Create systemd service file:**
   ```bash
   sudo tee /etc/systemd/system/knowledge-space.service > /dev/null <<EOF
   [Unit]
   Description=A Personal Knowledge Space
   After=network.target postgresql.service
   Wants=postgresql.service
   
   [Service]
   Type=simple
   User=knowledge
   WorkingDirectory=/opt/knowledge-space
   Environment="NODE_ENV=production"
   EnvironmentFile=/opt/knowledge-space/.env
   ExecStart=/usr/bin/node /opt/knowledge-space/node_modules/.bin/next start
   Restart=on-failure
   RestartSec=10
   StandardOutput=journal
   StandardError=journal
   
   [Install]
   WantedBy=multi-user.target
   EOF
   ```

6. **Enable and start:**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable knowledge-space
   sudo systemctl start knowledge-space
   ```

7. **Check status:**
   ```bash
   sudo systemctl status knowledge-space
   # View logs: sudo journalctl -u knowledge-space -f
   ```

8. **Setup reverse proxy (Nginx):**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
           proxy_read_timeout 86400;
       }
   }
   ```

   Then:
   ```bash
   sudo systemctl restart nginx
   sudo certbot certonly -d your-domain.com
   # Update nginx config with SSL cert paths
   ```

---

## Option 3: Managed PostgreSQL (Supabase, Neon, Railway)

Use a managed PostgreSQL provider and deploy the app separately.

### Prerequisites
- A managed PostgreSQL account (Supabase, Neon, Railway, etc.)
- Environment for Node.js (Vercel, Railway, Render, etc.)

### Setup

1. **Create a PostgreSQL database** with your provider.
   - Note the connection string (usually provided in credentials).

2. **Configure environment:**
   ```env
   DATABASE_URL="<connection-string-from-provider>"
   DIRECT_URL="<direct-connection-if-provided>"
   AUTH_SECRET="<random-secret>"
   ADMIN_EMAIL="admin@example.com"
   ADMIN_PASSWORD="strong-password"
   ```

3. **Vercel (recommended):**
   - Push your repo to GitHub
   - Connect to Vercel, import the repo
   - Add environment variables in project settings
   - Deploy

4. **Alternative: Railway or Render:**
   - Create a new service from GitHub repo
   - Set environment variables
   - Ensure it runs `npm run build` and `npm start`

5. **Initialize database:**
   ```bash
   npx prisma db push
   npm run seed
   ```

---

## Post-Deployment Checklist

- [ ] Admin login works (`/login`)
- [ ] Can create and edit notes from `/admin`
- [ ] Wiki-links work (write `[[another-note]]` in content)
- [ ] Database backups are configured
- [ ] HTTPS is enabled (if public)
- [ ] Demo seed loaded: `npm run seed:demo` (optional)

---

## Troubleshooting

### "Can't connect to PostgreSQL"
- Verify `DATABASE_URL` is correct and includes credentials
- Check that PostgreSQL is running and accessible
- Ensure firewall rules allow the connection

### "Prisma client not generated"
- Run `npm run postinstall` (or just `npm install`)
- Check that `app/generated/prisma/client.ts` exists

### "Admin login fails"
- Verify `AUTH_SECRET` is set (must be a strong random string)
- Check `.env` has `ADMIN_EMAIL` and `ADMIN_PASSWORD`
- Ensure you ran `npm run seed` to create the admin user

### "Port 3000 already in use"
- Docker: update `docker-compose.yml` port mapping
- Systemd: change `ExecStart` to use a different port, update proxy config
- Standalone: use `PORT=3001 npm start`

---

## Further Reference

- **Repository:** https://github.com/sayliks/my-blog
- **Stack:** Next.js 16 + React 19 + Prisma 7 + PostgreSQL
- **Architecture:** See [CLAUDE.md](CLAUDE.md)
- **Local development:** See [README.md](README.md)
