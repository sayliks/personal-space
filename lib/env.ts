import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),
  AUTH_SECRET: z.string().min(32),
  AUTH_URL: z.string().url().default("http://localhost:3000"),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  const missing = result.error.issues.map((i) => i.path.join("."));
  console.warn(
    `[env] Env validation failed for: ${missing.join(", ")}. ` +
    `Using fallback values.`
  );
}

const fallback = {
  DATABASE_URL: process.env.DATABASE_URL ?? "",
  DIRECT_URL: process.env.DIRECT_URL,
  AUTH_SECRET: process.env.AUTH_SECRET ?? "",
  AUTH_URL: process.env.AUTH_URL ?? "http://localhost:3000",
  NODE_ENV: (process.env.NODE_ENV as "development" | "test" | "production") ?? "development",
} as const;

export const env: z.infer<typeof envSchema> = result.success ? result.data : fallback;
