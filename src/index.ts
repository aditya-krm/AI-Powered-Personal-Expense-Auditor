import { Telegraf } from "telegraf";
import { config } from "./config/env";
import { OpenAIProvider, TransactionAIService } from "./services/ai.service";
import { TransactionService } from "./services/transaction.service";
import { BotController } from "./controllers/transaction.controller";
import { ReportController } from "./controllers/report.controller";
import { logger } from "./utils/logger";
import { startApiServer } from "./server";

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
  const reportController = new ReportController();

  // 2. Initialize Bot
  const bot = new Telegraf(config.TELEGRAM_BOT_TOKEN);

  // 3. Register Routes
  // Reporting Flow (Must be registered BEFORE text handler)
  bot.command("summary", reportController.handleDailySummary);
  bot.command("loans", reportController.handleLoans);

  // Transaction Flow
  bot.start(botController.handleStart);
  bot.on("text", botController.handleMessage);
  bot.on("callback_query", botController.handleCallback);

  // 4. Register Bot Commands for the auto-complete UI
  await bot.telegram.setMyCommands([
    { command: "start", description: "Start the bot" },
    { command: "summary", description: "Get today's summary" },
    { command: "loans", description: "Check outstanding loans/debts" }
  ]);
  logger.info("✅ Telegram bot commands registered");

  // 5. Start the REST API
  const apiServer = startApiServer();

  // 6. Start the Telegram Bot
  bot.launch(() => {
    logger.info("🤖 Bot is online!");
  });

  // Enable graceful stop
  process.once("SIGINT", () => {
    bot.stop("SIGINT");
    apiServer.stop(true);
  });
  process.once("SIGTERM", () => {
    bot.stop("SIGTERM");
    apiServer.stop(true);
  });
}

main().catch((err) => {
  logger.error("Fatal Error:", err);
  process.exit(1);
});
