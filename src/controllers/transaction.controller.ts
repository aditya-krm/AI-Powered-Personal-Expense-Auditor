import { Context, Markup } from "telegraf";
import { TransactionAIService } from "../services/ai.service";
import { TransactionService } from "../services/transaction.service";
import { logger } from "../utils/logger";
import { config } from "../config/env";
import { getTransactionActions, getCategoryGrid } from "../utils/keyboards";
import { prisma } from "../prisma/client"; // Need prisma to updating

export class BotController {
  constructor(
    private aiService: TransactionAIService,
    private transactionService: TransactionService,
  ) { }

  public handleMessage = async (ctx: Context) => {
    if (!ctx.from || ctx.from.id !== config.MY_TELEGRAM_ID) {
      logger.warn(`Unauthorized access attempt from ID: ${ctx.from?.id}`);
      return await ctx.reply("Unauthorized");
    }

    const message = ctx.message as any;
    if (!message || !message.text) return await ctx.reply("Invalid message");

    const text = message.text;

    if (message.reply_to_message && "text" in message.reply_to_message) {
      const replyText = message.reply_to_message.text;
      if (replyText && replyText.startsWith("📝 Editing Transaction #")) {
        const idMatch = replyText.match(/#(\d+)/);
        if (idMatch) {
          const txId = parseInt(idMatch[1]);
          await ctx.reply(`🔄 Updating Transaction #${txId}...`);

          try {
            const parsedData = await this.aiService.parseTransaction(text);
            const updatedTx = await this.transactionService.updateTransaction(
              txId,
              parsedData,
              text,
            );

            let replyText = `✅ **Updated Transaction #${updatedTx.id}**\n${parsedData.userReply}`;
            const actions = getTransactionActions(updatedTx.id);
            await ctx.reply(replyText, actions);
            return;
          } catch (e: any) {
            logger.error("Update Error", e);
            await ctx.reply(`❌ Update Failed: ${e.message}`);
            return;
          }
        }
      }
    }

    try {
      await ctx.reply("🤖 Converting your message into a transaction...");

      const parsedData = await this.aiService.parseTransaction(text);

      const savedTx = await this.transactionService.createTransaction(
        parsedData,
        message.message_id.toString(),
        text,
      );

      if ('isDuplicate' in savedTx && savedTx.isDuplicate) {
        logger.warn(`Duplicate telegram message ignored: ${message.message_id}`);
        return;
      }
      const tx = savedTx as any;

      let replyText = `${parsedData.userReply}\n\n(ID: ${tx.id})`;

      if (
        tx.remainingBalance !== null &&
        tx.remainingBalance !== undefined
      ) {
        if (Number(tx.remainingBalance) === 0) {
          replyText += `\n🎉 **Debt Fully Settled!**`;
        } else {
          replyText += `\n📉 **Remaining Balance:** ${tx.currency} ${tx.remainingBalance}`;
        }
      }

      const actions = getTransactionActions(tx.id);
      await ctx.reply(replyText, actions);
    } catch (error: any) {
      logger.error("Error processing message", error);

      try {
        await prisma.failedTransaction.create({
          data: {
            rawText: text,
            errorReason: error.message,
            telegramMessageId: message.message_id?.toString()
          }
        });
        logger.info(`Failed transaction saved to DB for message: ${text}`);
      } catch (dbError) {
        logger.error("Failed to save FailedTransaction to DB", dbError);
      }

      await ctx.reply(`❌ Error: ${error.message}\n\nDon't worry, your message was saved to the failed records.`);
    }
  };

  public handleEdit = async (ctx: Context) => {
    const match = (ctx as any).match as RegExpExecArray;
    const txId = parseInt(match[1] ?? "0", 10);
    if (!txId) return ctx.answerCbQuery("Invalid ID");
    try {
      await ctx.reply(
        `📝 Editing Transaction #${txId}.\nReply to this message with the new details (e.g., "Lunch 400").`,
        Markup.forceReply(),
      );
      await ctx.answerCbQuery("Reply to edit");
    } catch (e) {
      logger.error("Edit Error", e);
      await ctx.answerCbQuery("Error");
    }
  };

  public handleDelete = async (ctx: Context) => {
    const match = (ctx as any).match as RegExpExecArray;
    const txId = parseInt(match[1] ?? "0", 10);
    if (!txId) return ctx.answerCbQuery("Invalid ID");
    try {
      await prisma.transaction.delete({ where: { id: txId } });
      await ctx.editMessageText(`🗑️ Transaction #${txId} deleted.`);
      await ctx.answerCbQuery("Deleted");
    } catch (e) {
      logger.error("Delete Error", e);
      await ctx.answerCbQuery("Error deleting");
    }
  };

  public handleCallback = async (ctx: Context) => {
    if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) return;
  };

  public handleStart = async (ctx: Context) => {
    if (!ctx.from || ctx.from.id !== config.MY_TELEGRAM_ID) return;
    await ctx.reply(
      "👋 Ready to track your finances! Send me a message like 'Spent 500 on lunch'.",
    );
  };
}
