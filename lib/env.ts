import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),
  AUTH_SECRET: z.string().min(32),
  AUTH_URL: z.string().url().default("http://localhost:3000"),
  AUTH_GITHUB_ID: z.string().min(1).optional(),
  AUTH_GITHUB_SECRET: z.string().min(1).optional(),
  MODERATION_API_KEY: z.string().min(1).optional(),
  MODERATION_BASE_URL: z.string().url().default("https://api.openai.com/v1"),
  MODERATION_MODEL: z.string().min(1).optional(),
  ANALYTICS_GEOLOOKUP: z.enum(["true", "false"]).default("true"),
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
  AUTH_GITHUB_ID: process.env.AUTH_GITHUB_ID,
  AUTH_GITHUB_SECRET: process.env.AUTH_GITHUB_SECRET,
  MODERATION_API_KEY: process.env.MODERATION_API_KEY,
  MODERATION_BASE_URL: process.env.MODERATION_BASE_URL ?? "https://api.openai.com/v1",
  MODERATION_MODEL: process.env.MODERATION_MODEL,
  ANALYTICS_GEOLOOKUP: process.env.ANALYTICS_GEOLOOKUP === "false" ? "false" : "true",
  NODE_ENV: (process.env.NODE_ENV as "development" | "test" | "production") ?? "development",
} as const;

export const env: z.infer<typeof envSchema> = result.success ? result.data : fallback;

if (env.NODE_ENV === "production") {
  const fatal: string[] = [];
  if (!env.DATABASE_URL) fatal.push("DATABASE_URL");
  if (!env.AUTH_SECRET || env.AUTH_SECRET.length < 32) fatal.push("AUTH_SECRET (min 32 chars)");
  if (fatal.length > 0) {
    throw new Error(
      `[env] Missing required production env vars: ${fatal.join(", ")}. ` +
      `Set them in your deployment environment and redeploy.`
    );
  }
}
