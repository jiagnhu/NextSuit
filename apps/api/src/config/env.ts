import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(18640),
  API_PREFIX: z.string().default("/api/v1"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(10, "JWT_SECRET must be at least 10 chars"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  COOKIE_NAME: z.string().default("nextsuit_session"),
  CORS_ORIGIN: z.string().default("http://localhost:18631"),
  PUBLIC_BASE_URL: z.string().url().optional(),
  PUBLIC_BASE_PATH: z.string().default(""),
  DEFAULT_ORG_SLUG: z.string().default("nextsuit-demo"),
  ADMIN_EMAIL: z.string().email().default("admin@nextsuit.dev"),
  ADMIN_PASSWORD: z.string().min(8).default("Admin123!"),
  VIEWER_EMAIL: z.string().email().default("visitor@nextsuit.dev"),
  VIEWER_PASSWORD: z.string().min(8).default("Visitor123!"),
  BLOG_BASE_URL: z.string().url().default("http://localhost:18633"),
  RESEND_API_KEY: z.string().min(10).optional(),
  RESEND_FROM_EMAIL: z.string().email().default("onboarding@resend.dev"),
  RESEND_REPLY_TO: z.string().email().optional(),
  WEEKLY_DIGEST_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  WEEKLY_DIGEST_SEND_HOUR: z.coerce.number().int().min(0).max(23).default(9),
  WEEKLY_DIGEST_TIMEZONE: z.string().default("Asia/Shanghai"),
  WEEKLY_DIGEST_TEST_EMAIL: z.string().email().optional()
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error("Invalid environment variables", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
