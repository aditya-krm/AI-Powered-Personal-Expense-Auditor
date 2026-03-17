import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  MY_TELEGRAM_ID: z.string().transform((val) => parseInt(val, 10)),
  OPENAI_API_KEY: z.string(),
  ADMIN_KEY: z.string(),
  GOOGLE_CLIENT_ID: z.string().optional().default(""),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(""),
  GOOGLE_REDIRECT_URI: z.string().optional().default("http://localhost:3001/auth/google/callback"),
  GMAIL_TOPIC_NAME: z.string().optional().default(""),
});

const processEnv = {
  DATABASE_URL: process.env.DATABASE_URL,
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  MY_TELEGRAM_ID: process.env.MY_TELEGRAM_ID,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  ADMIN_KEY: process.env.ADMIN_KEY,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
  GMAIL_TOPIC_NAME: process.env.GMAIL_TOPIC_NAME,
};

// Validate and export
const parsed = envSchema.safeParse(processEnv);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.format());
  process.exit(1);
}

export const config = parsed.data;
