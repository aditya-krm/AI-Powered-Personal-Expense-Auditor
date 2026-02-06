import { Telegraf } from "telegraf";
import { config } from "./config/env";
import { OpenAIProvider, TransactionAIService } from "./services/ai.service";
import { TransactionService } from "./services/transaction.service";
import { BotController } from "./controllers/transaction.controller";
import { logger } from "./utils/logger";

async function main() {
  logger.info("🚀 Starting Finance-Bot-Bun...");

  // 1. Initialize Services
  // Check which API key is available
  let aiProvider;
  if (config.OPENAI_API_KEY) {
      aiProvider = new OpenAIProvider(config.OPENAI_API_KEY);
  } else {
      logger.error("❌ No AI API Key provided (OPENAI_API_KEY). Exiting.");
      process.exit(1);
  }

  const aiService = new TransactionAIService(aiProvider);
  const transactionService = new TransactionService();
  const botController = new BotController(aiService, transactionService);

  // 2. Initialize Bot
  const bot = new Telegraf(config.TELEGRAM_BOT_TOKEN);

  // 3. Register Routes
  bot.start(botController.handleStart);
  bot.on("text", botController.handleMessage);

  // 4. Start
  bot.launch(() => {
    logger.info("🤖 Bot is online!");
  });

  // Enable graceful stop
  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));
}

main().catch((err) => {
  logger.error("Fatal Error:", err);
  process.exit(1);
});
