# my-blog 全栈开发计划

> 项目：个人全栈博客 · 制定日期：2026-05-21
> 资深工程师审定版 — 开发路线图 + 技术成长指导 一体化文档

---

## 目录

- [一、技术栈](#一技术栈)
- [二、数据库模型设计](#二数据库模型设计)
- [三、路由设计](#三路由设计)
- [四、组件策略](#四组件策略)
- [五、实施阶段](#五实施阶段)
- [六、依赖安装汇总](#六依赖安装汇总)
- [七、环境变量配置](#七环境变量配置)
- [八、待完成事项](#八待完成事项)
- [九、验证方式](#九验证方式)
- [十、技术提升路线图](#十技术提升路线图)
- [十一、代码规范与质量标准](#十一代码规范与质量标准)
- [十二、30 天实战任务表](#十二30-天实战任务表)
- [十三、推荐学习资源](#十三推荐学习资源)

---

## 一、技术栈

| 层       | 选型                            |
| -------- | ------------------------------- |
| 全栈框架 | Next.js 16 (App Router)         |
| 数据库   | PostgreSQL on Supabase          |
| ORM      | Prisma 7                        |
| UI       | shadcn/ui                       |
| 样式     | Tailwind CSS v4                 |
| 认证     | Auth.js v5                      |
| 部署     | Vercel                          |

**参考模板**：[Taxonomy](https://tx.shadcn.com) — shadcn/ui 官方博客模板，Next.js App Router + shadcn/ui + 暗黑模式 + SEO 完整。

**开发方式**：
```
shadcn/ui 组件 → AI 改样式/逻辑 → 接 Prisma 数据 → 完成页面
```
不再手写 UI 原语，直接用 `npx shadcn add` 拿组件。

---

## 二、数据库模型设计

6 个模型：

| 模型        | 用途      | 关键字段                                                                                    |
| ----------- | --------- | ------------------------------------------------------------------------------------------- |
| **User**    | 管理员    | id, name, email(@unique), passwordHash, **createdAt**, **updatedAt**                        |
| **Post**    | 文章      | +slug(@unique), +summary, +coverImage, +publishedAt, +views, +authorId, +categoryId, **published**, **updatedAt** |
| **Category**| 分类      | id, name(@unique), slug(@unique), **createdAt**, **updatedAt**                              |
| **Tag**     | 标签      | id, name(@unique), slug(@unique), **createdAt**, **updatedAt**                              |
| **PostTag** | 文章-标签 | postId + tagId（复合主键）                                                                  |
| **Comment** | 评论      | content, authorName, authorEmail?, approved, parentId, postId, **createdAt**, **updatedAt** |

关系：User 1→N Post → Category 1→N Post → Post N↔N Tag → Post 1→N Comment → Comment 1→N Comment(replies)

---

## 三、路由设计

```
# 公开路由
app/
├── page.tsx                          # 首页：分页文章列表
├── posts/[slug]/page.tsx             # 文章详情 + 评论区
├── categories/[slug]/page.tsx        # 按分类筛选
├── tags/[slug]/page.tsx              # 按标签筛选
├── search/page.tsx                   # 搜索结果
├── about/page.tsx                    # 关于页面
├── rss.xml/route.ts                  # RSS Feed

# 后台管理（受 AdminLayout auth() 保护，登录页独立于 /login）
app/admin/
├── layout.tsx                        # 后台框架（auth 检查 + 侧边栏 + sonner toaster）
├── page.tsx                          # 仪表盘
├── posts/page.tsx                    # 文章列表
├── posts/new/page.tsx                # 新建文章
├── posts/[id]/edit/page.tsx          # 编辑文章
├── categories/page.tsx               # 分类管理
├── tags/page.tsx                     # 标签管理
└── comments/page.tsx                 # 评论审核

app/login/
├── layout.tsx                        # 登录页独立布局（不使用 AdminLayout）
└── page.tsx                          # 登录页

# API
app/api/
├── auth/[...nextauth]/route.ts       # Auth.js
├── posts/route.ts                    # 文章 CRUD
├── comments/route.ts                 # 评论提交 & 审核
└── search/route.ts                   # 搜索
```

---

## 四、组件策略

**UI 层全部走 shadcn/ui**，通过 `npx shadcn add` 添加：

```bash
npx shadcn add button card input textarea label badge
npx shadcn add dropdown-menu avatar separator
npx shadcn add table dialog sheet tabs
npx shadcn add sidebar
```

业务组件放在 `components/`：

```
components/
├── layout/      # Header, Footer（用 shadcn + Tailwind 搭）
├── blog/        # PostCard, PostList, PostContent, MarkdownRenderer,
│                # CommentSection, CommentForm, TagBadge, SearchForm, Pagination
└── admin/       # PostEditor, PostForm, LoginForm,
                 # CategoryManager, TagManager, CommentManager
```

核心渲染链路：
```
post.content (Markdown) → react-markdown + remark-gfm + rehype-highlight
                         → @tailwindcss/typography prose 类
                         → 排版精美的 HTML
```

---

## 五、实施阶段

### Phase 0：shadcn/ui 初始化
- 运行 `npx shadcn init`（已确认支持 Tailwind v4 + Next.js 16）
- 添加第一批基础组件：button, card, input, textarea, label, badge
- 验证组件可用

### Phase 0.5：配置与验证 ✅（已完成）
- ✅ 创建 `.env.example` 模板
- ✅ 创建 `lib/env.ts` — Zod 环境变量校验
- ✅ 创建 `lib/validations.ts` — Zod 表单 schema（post/comment/category/tag）
- ✅ 修复 `prisma.config.ts` — Prisma 7 数据库连接配置
- ✅ 修复 `lib/prisma.ts` — Prisma 7 adapter + 单例写法

### Phase 1：数据库迁移 ✅（已完成）
- 6 个模型已写入 `prisma/schema.prisma`
- `prisma db push` 已完成
- 基础工具文件已创建：`lib/slug.ts`, `lib/utils.ts`, `lib/queries.ts`, `lib/markdown.ts`
- Phase 1 依赖已安装
- ✅ `prisma/seed.ts` 管理员播种脚本（bcrypt hash 12 rounds + upsert）

### Phase 2：认证系统 ✅（已完成）
- ✅ 安装 `next-auth` `@auth/prisma-adapter`
- ✅ 创建 `lib/auth.ts` + `app/api/auth/[...nextauth]/route.ts`
- ✅ 登录页独立于 `/login`（2026-05-21 重构：从 `/admin/login` 移出，避免 AdminLayout 重定向死循环）
- ✅ `middleware.ts` 已评估并移除（Auth.js middleware 依赖 Prisma，Edge Runtime 不兼容；auth 保护由 `AdminLayout` 的 `auth()` + `redirect` 实现）
- ✅ `runtime = "nodejs"` 已显式声明在 admin layout 和 auth API route
- ✅ 验证：访问 `/admin` 未登录自动跳转 `/login`

### Phase 3：Markdown 渲染 + 排版 ✅（已完成）
- ✅ 安装 `@tailwindcss/typography` `react-markdown` `remark-gfm` `rehype-highlight` `rehype-slug` `highlight.js`
- ✅ 创建 `MarkdownRenderer.tsx`
- ✅ 验证渲染效果

### Phase 4：后台文章 CRUD ✅（已完成）
- ✅ 添加 shadcn 组件：table, dialog, tabs, sidebar, dropdown-menu, avatar
- ✅ 搭建 `admin/layout.tsx`（侧边栏 + 用户信息 + 退出登录）
- ✅ 实现文章列表/新建/编辑页面 + DeletePostButton
- ✅ 实现 `app/api/posts/route.ts`（POST/PUT/DELETE）
- ✅ 实现分类管理（创建/删除）
- ✅ 实现标签管理（创建/删除）
- ✅ 评论审核页 `admin/comments/page.tsx`（批准/删除）
- ✅ API 路由接入 Zod 验证（POST 使用 `createPostSchema.safeParse`，PUT 使用 `.partial().safeParse`）

### Phase 5：公开博客页面 ✅（已完成）
- ✅ 开发 `components/blog/*` 组件：PostCard, Pagination, TagBadge, CategoryBadge, MarkdownRenderer
- ✅ 首页（分页 + PostCard 列表）
- ✅ 文章详情页（Markdown 渲染 + metadata + 评论区）
- ✅ 分类筛选页 `app/categories/[slug]/page.tsx`
- ✅ 标签筛选页 `app/tags/[slug]/page.tsx`
- ✅ 关于页面 `app/about/page.tsx`
- ✅ Header/Footer 集成到 `app/layout.tsx`
- ✅ SEO metadata 已配置

### Phase 6：评论系统 ✅（已完成）
- ✅ `app/api/comments/route.ts`（POST 提交 + GET 审核列表）
- ✅ CommentSection / CommentForm 组件（含回复嵌套展示）
- ✅ 管理端评论审核页（批准/删除）
- ✅ POST 接入 `createCommentSchema.safeParse` Zod 验证

### Phase 7：搜索 + RSS ✅（已完成）
- ✅ 安装 `feed`（后于 `f2390b4` 移除：RSS 功能取舍，保留搜索和 sitemap）
- ✅ `/api/search/route.ts` — 搜索 API
- ✅ `app/search/page.tsx` — 搜索页面（i18n 已接入）
- ✅ `app/rss.xml/route.ts` — 已移除
- ✅ `components/blog/SearchForm.tsx` — 搜索表单（i18n 已接入）

### Phase 8：打磨 ✅（已完成）
- ✅ SEO metadata（首页 + 文章详情 + About + Search 页已配置，generateMetadata 已接入 i18n）
- ✅ loading.tsx / error.tsx / not-found.tsx（全局错误边界已实现，全部接入 i18n 翻译）
- ✅ sitemap.ts（静态路由 + 动态文章路由）
- ✅ Toast 提示（sonner 已集成到 admin layout + PostForm success/error 反馈）
- ✅ `npm run build` — 公开页面添加 `force-dynamic` 解决 PgBouncer 连接池耗尽（24 workers vs 15 pool limit）
- ✅ 暗色模式（next-themes ThemeProvider + ThemeToggle，class 策略，system 默认，mounted 防 hydration 闪烁）
- ✅ i18n 国际化（next-intl，zh/en 双语，13 个命名空间 ~80 keys，cookie 驱动无 URL 前缀，accept-language 回退）

### Phase 9：测试 🔄（进行中）
- ✅ 单元测试框架搭建（Jest 30 + next/jest + @testing-library）
- ✅ `__tests__/lib/slug.test.ts` — 7 tests（generateSlug）
- ✅ `__tests__/lib/utils.test.ts` — 9 tests（formatDate, formatDateLong, cn）
- ✅ `__tests__/lib/validations.test.ts` — 11 tests（4 schemas safeParse 全覆盖），全部 30 tests 通过
- ⬜ 组件测试（@testing-library/react）
- ⬜ E2E 测试（Playwright）

---

## 六、依赖安装汇总

```bash
# Phase 1（已完成）
npm install bcryptjs clsx tailwind-merge date-fns github-slugger
npm install -D @types/bcryptjs tsx

# Phase 0.5：配置与验证
npm install zod
npm install -D eslint prettier eslint-config-prettier

# Phase 2
npm install next-auth @auth/prisma-adapter

# Phase 3
npm install @tailwindcss/typography react-markdown remark-gfm rehype-highlight rehype-slug highlight.js

# Phase 7
npm install feed

# Phase 8
npm install sonner next-themes

# i18n
npm install next-intl

# Phase 9：测试
npm install -D jest @jest/globals @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

---

## 七、环境变量配置

创建 `.env.example`：
```bash
# Database (Supabase — Prisma 7 配置方式)
# Supavisor session mode（port 5432），支持 prepared statements 和 advisory lock
DATABASE_URL="postgresql://..."          # Pooler 连接，运行时 + migrate 共用
# 直连数据库，仅在 pooler 不可用时作为 fallback
DIRECT_URL="postgresql://..."            # 直连，port 5432（可选）

# Auth.js
AUTH_SECRET="..."                        # 至少 32 位随机字符串（openssl rand -base64 32）
AUTH_URL="http://localhost:3000"

# Optional: Image upload (if using Cloudinary)
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
```

> **Prisma 7 注意**：`prisma.config.ts` 仅接受单一 `url`，不再有 `directUrl` 字段。migrate 和运行时共用 `DATABASE_URL`。

---

## 八、待完成事项

- [x] ~~Phase 0-7 全部完成~~
- [x] ~~`app/error.tsx`、`app/loading.tsx`、`app/not-found.tsx`~~
- [x] ~~`middleware.ts` 已评估并移除（Edge Runtime 不兼容，auth 走 layout 层）~~
- [x] ~~`app/sitemap.ts`（静态 + 文章 + 分类 + 标签 + RSS）~~
- [x] ~~Toast 提示（sonner）~~
- [x] ~~API 路由接入 Zod 验证~~ ✅
- [x] ~~文章可见性逻辑修复~~ ✅
- [x] ~~搜索逻辑抽取到 `lib/queries.ts`~~ ✅
- [x] ~~`force-dynamic` 修复构建时数据库连接池耗尽~~ ✅
- [x] ~~PostCard 空 `publishedAt` 时渲染空 `<time>` 元素~~ ✅
- [x] ~~`prisma/seed.ts` — 管理员播种脚本~~ ✅
- [x] ~~i18n 国际化（next-intl，zh/en 双语，13 个命名空间）~~ ✅
- [x] ~~暗色模式（next-themes ThemeProvider + ThemeToggle）~~ ✅
- [x] ~~middleware.ts 重新引入后又移除（改用 cookie 驱动，`i18n/request.ts` 读取 `NEXT_LOCALE` cookie + accept-language 回退，LanguageToggle 写 cookie + router.refresh()，无需 URL 前缀）~~ ✅
- [ ] Phase 9：单元测试 + E2E 测试

---

## 九、验证方式

- `npx prisma studio` — 检查数据库模型
- `npm run dev` — 浏览器测试各路由
- 完整体验：登录后台 → 创建文章 → 查看文章 → 评论 → 审核 → 首页展示
- 验证搜索
- 验证 sitemap `/sitemap.xml`
- `npm run build` — 确保生产构建成功

---

## 十、技术提升路线图

> 资深工程师指导 — 从工程基础到进阶实践

### 现状诊断

#### 已有的好习惯 ✅

| 维度 | 现状评价 |
|------|---------|
| 数据库设计 | 6 个模型关系清晰，复合主键、级联删除、索引设计合理 |
| 类型安全 | 使用 `Prisma.PostGetPayload` 推导类型，而非手写接口 |
| 工具函数 | `cn()` / `formatDate()` 封装正确，复用性好 |
| 查询层 | `lib/queries.ts` 抽象数据查询，不在页面直接写 Prisma |
| 项目规划 | 有完整阶段拆解，思路清晰 |

#### 需要提升的领域 🔺

| 优先级 | 问题 | 风险 | 状态 |
|--------|------|------|------|
| P2 | 组件测试 + E2E 测试待完善 | 重构风险中 | 进行中（lib 单元测试已完成，30 tests） |
| P3 | RSS feed 已移除（`f2390b4`），sitemap 保留 | 功能取舍 | 已决策 |

> ✅ 已修复：Zod 接入 API routes、文章可见性、搜索逻辑抽取、force-dynamic 构建修复、middleware 评估移除、PostCard 空 time、env.ts 全链路接入（prisma/sitemap/RSS）、error.tsx/not-found.tsx i18n。

---

### Level 1：工程基础（Week 1）

**目标：夯实工程根基，让项目"跑得起来、跑得稳"**

#### 1.1 环境变量管理（必做）

用 Zod 在启动时做强验证，而不是运行时才报 undefined：

```typescript
// lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),   // Prisma 7 不再强制要求
  AUTH_SECRET: z.string().min(32),
  AUTH_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

// Fail Fast：启动时校验，失败直接抛错
export const env = envSchema.parse(process.env);
```

**学到什么**：Fail Fast 原则 — 错误应该在最早的时机暴露。

---

#### 1.2 数据库连接（Prisma 7 配置方式）

Prisma 7 不再支持在 `schema.prisma` 中写 `url` / `directUrl`。连接配置移到 `prisma.config.ts`：

```typescript
// prisma.config.ts — Prisma 7 正确写法
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL!,  // 仅 url，无 directUrl（Prisma 7 已移除）
  },
});
```

```prisma
// prisma/schema.prisma — Prisma 7 只需声明 provider
datasource db {
  provider = "postgresql"
}
```

PrismaClient 构造函数需要传入 adapter（如 `@prisma/adapter-pg`），见下一节。

**学到什么**：Prisma 7 将连接配置从 schema 文件迁移到 TS 配置文件，运行时连接通过 adapter 注入——这是 Prisma 7 最大的 breaking change。

---

#### 1.3 Prisma Client 单例（避免连接泄露）

```typescript
// lib/prisma.ts — Prisma 7 正确写法（带 adapter）
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

**学到什么**：
- Prisma 7 **必须**传 `adapter`（如 `PrismaPg`）或 `accelerateUrl`，否则构造函数报错
- Next.js 开发模式热重载会重复执行模块顶层代码，`globalThis` 做单例缓存是业界标准方案
- 自定义输出路径（`../app/generated/prisma`）时，直接从生成路径导入，而非 `@prisma/client`

---

#### 1.4 表单验证层（Zod Schema）

```typescript
// lib/validations.ts
import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().min(1, "标题不能为空").max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/, "slug 只能包含小写字母、数字和连字符"),
  content: z.string().optional(),
  categoryId: z.string().cuid().optional(),
  tagIds: z.array(z.string().cuid()).default([]),
});

export const createCommentSchema = z.object({
  content: z.string().min(1).max(2000),
  authorName: z.string().min(1).max(50),
  authorEmail: z.string().email().optional().or(z.literal("")),
  postId: z.string().cuid(),
  parentId: z.string().cuid().optional(),
});

// API 路由中的用法：
// const result = createCommentSchema.safeParse(await req.json());
// if (!result.success) return Response.json({ error: result.error.flatten() }, { status: 400 });
```

**学到什么**：Never trust user input — 前端验证是用户体验，后端验证是安全防线，两者都要做。

---

### Level 2：架构能力（Week 2-3）

**目标：理解 Next.js App Router 的正确使用姿势**

#### 2.1 Server Component vs Client Component 分层

**核心规则**（很多初学者搞混）：

```
数据获取       → Server Component（直接 await，不需要 useEffect）
用户交互       → Client Component（需要 "use client"）
表单提交       → Server Actions（Next.js 16 推荐方式）
```

```typescript
// ❌ 错误：在 Client Component 里直接查数据库
"use client"
export default function PostList() {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    fetch("/api/posts").then(...) // 多了一次 HTTP 往返，性能差
  }, []);
}

// ✅ 正确：Server Component 直接查询
// app/page.tsx（无需 "use client"）
export default async function HomePage() {
  const { posts } = await getPublishedPosts({ page: 1 }); // 直接调用，无 fetch
  return <PostList posts={posts} />;
}
```

**学到什么**：App Router 下，能用 Server Component 就用，减少客户端 JS 体积，提升首屏性能。

---

#### 2.2 Server Actions（取代 API Routes 用于表单）

```typescript
// app/actions/comment.ts
"use server";

import { createCommentSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitComment(formData: FormData) {
  const result = createCommentSchema.safeParse({
    content: formData.get("content"),
    authorName: formData.get("authorName"),
    postId: formData.get("postId"),
  });

  if (!result.success) {
    return { error: result.error.flatten() };
  }

  await prisma.comment.create({ data: result.data });
  revalidatePath(`/posts/${postSlug}`); // 让页面缓存失效，重新渲染
  return { success: true };
}
```

**为什么比 API Routes 更好**：
- 无需手写 `fetch` 调用
- 自动处理 CSRF
- TypeScript 类型端到端安全
- 可以直接在 `<form action={submitComment}>` 中使用

---

#### 2.3 错误处理标准化

每个路由段都应该有错误边界：

```
app/
├── error.tsx          ← 全局错误边界（必须是 "use client"）
├── loading.tsx        ← 全局加载状态
├── not-found.tsx      ← 全局 404
└── posts/[slug]/
    ├── error.tsx      ← 该路由段专属错误边界
    └── loading.tsx    ← 该路由段专属加载状态
```

```typescript
// app/error.tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <h2 className="text-xl font-semibold">出了点问题</h2>
      <p className="text-muted-foreground">{error.message}</p>
      <button onClick={reset}>重试</button>
    </div>
  );
}
```

---

#### 2.4 缓存策略

| 场景 | 做法 |
|------|------|
| 文章列表（可以稍微过期）| `export const revalidate = 60` |
| 文章详情（需要最新）| `export const dynamic = "force-dynamic"` |
| 提交表单后刷新 | `revalidatePath("/posts")` 或 `revalidateTag("posts")` |

**学到什么**：Next.js 会默认缓存所有数据请求，不了解缓存机制会导致数据不更新的诡异 bug。

---

### Level 3：代码质量（持续进行）

#### 3.1 TypeScript 严格模式

保持 `tsconfig.json` 中 `"strict": true`，进阶可加：

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,     // 数组访问也要检查
    "exactOptionalPropertyTypes": true    // 可选属性更严格
  }
}
```

```typescript
// ❌ 避免：可能是 undefined，但 TS 不报警
const post = posts[0];
post.title; // 运行时 crash

// ✅ 开启 noUncheckedIndexedAccess 后会强制检查
const post = posts[0];
if (!post) return null;
post.title; // 安全
```

---

#### 3.2 API 路由响应标准化

```typescript
// lib/api-response.ts
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; details?: unknown };

export function ok<T>(data: T): Response {
  return Response.json({ success: true, data } satisfies ApiResponse<T>);
}

export function fail(error: string, status = 400): Response {
  return Response.json({ success: false, error } satisfies ApiResponse<never>, { status });
}

// 使用：
// return ok({ post });
// return fail("文章不存在", 404);
```

---

#### 3.3 自定义 Hook 封装复杂状态

当一个组件状态逻辑超过 20 行，就应该抽成 Hook：

```typescript
// hooks/use-pagination.ts
export function usePagination(totalPages: number) {
  const [page, setPage] = useState(1);
  const router = useRouter();
  const searchParams = useSearchParams();

  const goToPage = useCallback((newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    router.push(`?${params.toString()}`);
    setPage(newPage);
  }, [router, searchParams]);

  return { page, goToPage, hasPrev: page > 1, hasNext: page < totalPages };
}
```

---

### Level 4：性能与工程化（Week 4+）

#### 4.1 图片优化

```typescript
// ✅ 使用 Next.js Image 自动处理 WebP 转换、懒加载、防 CLS
import Image from "next/image";

<Image
  src={post.coverImage}
  alt={post.title}
  width={800}
  height={400}
  className="rounded-lg object-cover"
  priority={isAboveFold} // 首屏图片加 priority
/>
```

---

#### 4.2 数据库查询优化

```typescript
// ❌ N+1 查询问题（每篇文章都查一次作者）
const posts = await prisma.post.findMany();
for (const post of posts) {
  const author = await prisma.user.findUnique({ where: { id: post.authorId } });
}

// ✅ 用 include 一次性拿回来（lib/queries.ts 已经这么做了，保持住！）
const posts = await prisma.post.findMany({
  include: { author: { select: { id: true, name: true } } }
});
```

---

#### 4.3 测试策略

```
测试金字塔：
         /  E2E  \     ← 少量，覆盖核心用户流程（登录→发文→评论）
        / 集成测试 \    ← 中量，测试 API 路由 + 数据库操作
       /   单元测试  \  ← 大量，测试工具函数、Zod schema、纯函数
```

```typescript
// __tests__/lib/slug.test.ts —— 从单元测试开始
import { generateSlug } from "@/lib/slug";

describe("generateSlug", () => {
  it("移除特殊字符", () => {
    expect(generateSlug("Hello World!")).toBe("hello-world");
  });
});
```

---

### Level 5：进阶工程实践（持续学习）

#### 5.1 安全检查清单

| 风险点 | 防御措施 |
|--------|---------|
| XSS | 使用 `react-markdown` 的 sanitize 选项，禁止 raw HTML |
| SQL 注入 | Prisma ORM 自动参数化，无需手写 SQL |
| CSRF | Server Actions 内置 CSRF 防护 |
| 路径遍历 | 管理路由用 `middleware.ts` + Auth.js 会话检查 |
| 密码存储 | bcryptjs salt rounds ≥ 12 |
| 敏感变量 | 永远不要 `console.log(process.env)` |

---

## 十一、代码规范与质量标准

### 每次提交前自查清单

```
✅ TypeScript 编译无错误（strict 模式）
✅ ESLint 无警告
✅ npm run build 成功
✅ 所有用户输入已验证（Zod）
✅ 无 console.log 遗留（或明确标注 TODO）
✅ Server Component 和 Client Component 职责清晰
✅ 数据库多步操作在事务中
✅ API 路由有权限检查
```

### Git 提交规范（Conventional Commits）

```bash
feat: 添加文章评论功能
fix: 修复分页在最后一页时的越界问题
refactor: 将 PostCard 拆分为 Server/Client 两个组件
perf: 为评论查询添加 postId 复合索引
docs: 更新 README 部署说明
test: 添加 createComment Server Action 的单元测试
```

### 鼓励做到

```
⭐ 新增功能有测试
⭐ 复杂逻辑有注释说明"为什么"（而不是"做了什么"）
⭐ 组件职责单一，可独立测试
⭐ 有适当的 loading / error 状态处理
```

---

## 十二、30 天实战任务表

| 周次 | 任务 | 技能收获 |
|------|------|---------|
| **Week 1** | ① ~~修复 prisma.config.ts 数据库连接配置~~ ✅<br>② ~~修复 prisma.ts 单例写法 + Prisma 7 adapter~~ ✅<br>③ ~~创建 `lib/env.ts` 环境变量验证~~ ✅<br>④ ~~创建 `lib/validations.ts` Zod schema~~ ✅<br>⑤ ~~完成 shadcn/ui 初始化~~ ✅ | 工程基础、Fail Fast |
| **Week 2** | ⑥ ~~创建 `app/error.tsx`、`app/loading.tsx`、`app/not-found.tsx`~~ ✅<br>⑦ ~~实现 Auth.js 认证系统（Phase 2）~~ ✅<br>⑧ ~~middleware.ts 已评估移除（Edge Runtime 不兼容）~~ ✅<br>⑨ ~~创建 `prisma/seed.ts` 播种脚本~~ ✅ | Next.js App Router、认证 |
| **Week 3** | ⑩ ~~实现 MarkdownRenderer（Phase 3）~~ ✅<br>⑪ ~~搭建后台文章 CRUD（Phase 4）~~ ✅<br>⑫ ~~实现 Server Actions 表单提交~~ ✅<br>⑬ ~~添加 toast 反馈（sonner + PostForm 集成）~~ ✅ | Server Actions、UI 开发 |
| **Week 4** | ⑭ ~~开发博客公开页面（Phase 5）~~ ✅<br>⑮ ~~实现评论系统（Phase 6）~~ ✅<br>⑯ ~~搜索 + RSS + sitemap（Phase 7-8）~~ ✅<br>⑰ ~~写第一批单元测试~~ ✅（30 tests, lib/）<br>⑱ `npm run build` 零警告 | 完整功能、测试习惯 |

> **当前进度（2026-05-22）**：Phase 0-8 全部完成。Phase 9 进行中 — 单元测试框架已搭建（Jest 30 + next/jest），lib/ 工具函数和 Zod schema 30 tests 全部通过。组件测试和 E2E 待实现。

---

## 十三、推荐学习资源

### 必读文档

- **Next.js 16 官方文档**：`node_modules/next/dist/docs/`（就在项目里）
- **Prisma 文档**：https://www.prisma.io/docs
- **shadcn/ui**：https://ui.shadcn.com/docs
- **Auth.js v5**：https://authjs.dev/getting-started

### 进阶学习

- [Total TypeScript](https://www.totaltypescript.com/) — 系统提升 TS 能力
- [Next.js 官方 Learn 课程](https://nextjs.org/learn) — App Router 入门最佳路径
- [Prisma Data Guide](https://www.prisma.io/dataguide) — 数据库设计实战

### 参考代码库

- [Taxonomy (shadcn 官方博客模板)](https://github.com/shadcn-ui/taxonomy) — PLAN.md 中提到的参考
- [next-auth 官方示例](https://github.com/nextauthjs/next-auth/tree/main/apps/examples)

---

> **资深工程师寄语**
>
> 技术成长没有捷径，但有方向。上面这些不是规则，是前人踩坑总结出来的经验。
> 每完成一个阶段，回过头来看自己写的代码，如果会皱眉头——那说明你进步了。
>
> 代码质量 = 对未来自己的尊重。
