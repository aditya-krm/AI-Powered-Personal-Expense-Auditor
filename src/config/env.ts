import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  MY_TELEGRAM_ID: z.string().transform((val) => parseInt(val, 10)),
  OPENAI_API_KEY: z.string(),
  AUTH_USER: z.string(),
  AUTH_PASS: z.string(),
});

const processEnv = {
  DATABASE_URL: process.env.DATABASE_URL,
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  MY_TELEGRAM_ID: process.env.MY_TELEGRAM_ID,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  AUTH_USER: process.env.AUTH_USER,
  AUTH_PASS: process.env.AUTH_PASS,
};

// Validate and export
const parsed = envSchema.safeParse(processEnv);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.format());
  process.exit(1);
}

export const config = parsed.data;
