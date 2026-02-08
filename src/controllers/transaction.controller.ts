import { Context } from "telegraf";
import { TransactionAIService } from "../services/ai.service";
import { TransactionService } from "../services/transaction.service";
import { logger } from "../utils/logger";
import { config } from "../config/env";

export class BotController {
  constructor(
    private aiService: TransactionAIService,
    private transactionService: TransactionService,
  ) {}

  public handleMessage = async (ctx: Context) => {
    // 1. Auth Check
    if (!ctx.from || ctx.from.id !== config.MY_TELEGRAM_ID) {
      logger.warn(`Unauthorized access attempt from ID: ${ctx.from?.id}`);
      return await ctx.reply("Unauthorized"); // Silent ignore or reply "Unauthorized"
    }

    // 2. Text handling
    // Check if message exists and has text property (narrowing)
    if (!ctx.message || !("text" in ctx.message))
      return await ctx.reply("Invalid message");

    const text = ctx.message.text;

    // 3. Process
    try {
      await ctx.reply("🤖 Converting your message into a transaction...");

      // Call AI Service
      const parsedData = await this.aiService.parseTransaction(text);

      // Save to DB
      const savedTx = await this.transactionService.createTransaction(
        parsedData,
        ctx.message.message_id.toString(),
        text,
      );
      
      // 4. Formatted Reply (using LLM's friendly message + ID + Smart Context)
      let replyText = `${parsedData.userReply}\n\n(ID: ${savedTx.id})`;

      // If we did some smart math, show it
      if (savedTx.remainingBalance !== null && savedTx.remainingBalance !== undefined) {
        // Convert to number for check (Prisma Decimal to number)
        if (Number(savedTx.remainingBalance) === 0) {
          replyText += `\n🎉 **Debt Fully Settled!**`;
        } else {
          replyText += `\n📉 **Remaining Balance:** ${savedTx.currency} ${savedTx.remainingBalance}`;
        }
      }

      // We use plain reply to avoid Markdown parsing errors (error 400)
      await ctx.reply(replyText);
    } catch (error: any) {
      logger.error("Error processing message", error);
      await ctx.reply(`❌ Error: ${error.message}`);
    }
  };
  public handleStart = async (ctx: Context) => {
    if (!ctx.from || ctx.from.id !== config.MY_TELEGRAM_ID) return;
    await ctx.reply(
      "👋 Ready to track your finances! Send me a message like 'Spent 500 on lunch'.",
    );
  };
}
