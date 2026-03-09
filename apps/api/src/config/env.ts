import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  API_PREFIX: z.string().default("/api/v1"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(10, "JWT_SECRET must be at least 10 chars"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  COOKIE_NAME: z.string().default("nextsuit_session"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  PUBLIC_BASE_URL: z.string().url().default("http://localhost:4000"),
  DEFAULT_ORG_SLUG: z.string().default("nextsuit-demo"),
  ADMIN_EMAIL: z.string().email().default("admin@nextsuit.dev"),
  ADMIN_PASSWORD: z.string().min(8).default("Admin123!")
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error("Invalid environment variables", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
