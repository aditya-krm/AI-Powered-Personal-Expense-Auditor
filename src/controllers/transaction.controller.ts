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
  ) {}

  public handleMessage = async (ctx: Context) => {
    // 1. Auth Check
    if (!ctx.from || ctx.from.id !== config.MY_TELEGRAM_ID) {
      logger.warn(`Unauthorized access attempt from ID: ${ctx.from?.id}`);
      return await ctx.reply("Unauthorized");
    }

    // 2. Text handling
    // @ts-ignore
    const message = ctx.message as any;
    if (!message || !message.text) return await ctx.reply("Invalid message");

    const text = message.text;

    // --- CHECK FOR EDIT REPLY ---
    // Look for reply to "📝 Editing Transaction #123..."
    if (message.reply_to_message && "text" in message.reply_to_message) {
      const replyText = message.reply_to_message.text;
      if (replyText && replyText.startsWith("📝 Editing Transaction #")) {
        // Extract ID
        const idMatch = replyText.match(/#(\d+)/);
        if (idMatch) {
          const txId = parseInt(idMatch[1]);
          await ctx.reply(`🔄 Updating Transaction #${txId}...`);

          try {
            // Parse new text
            const parsedData = await this.aiService.parseTransaction(text);
            // Update DB
            const updatedTx = await this.transactionService.updateTransaction(
              txId,
              parsedData,
              text,
            );

            // Reply Success
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
    // ----------------------------

    // 3. Normal Process (New Transaction)
    try {
      await ctx.reply("🤖 Converting your message into a transaction...");

      // Call AI Service
      const parsedData = await this.aiService.parseTransaction(text);

      // Save to DB
      const savedTx = await this.transactionService.createTransaction(
        parsedData,
        message.message_id.toString(),
        text,
      );

      // 4. Formatted Reply
      let replyText = `${parsedData.userReply}\n\n(ID: ${savedTx.id})`;

      if (
        savedTx.remainingBalance !== null &&
        savedTx.remainingBalance !== undefined
      ) {
        if (Number(savedTx.remainingBalance) === 0) {
          replyText += `\n🎉 **Debt Fully Settled!**`;
        } else {
          replyText += `\n📉 **Remaining Balance:** ${savedTx.currency} ${savedTx.remainingBalance}`;
        }
      }

      const actions = getTransactionActions(savedTx.id);
      await ctx.reply(replyText, actions);
    } catch (error: any) {
      logger.error("Error processing message", error);
      await ctx.reply(`❌ Error: ${error.message}`);
    }
  };

  public handleCallback = async (ctx: Context) => {
    if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) return;

    const data = ctx.callbackQuery.data as string;
    const parts = data.split("_");
    // const action = parts[0];

    // Safety check for ID
    // Parts: [action, id] OR [action, cat, id] (legacy)
    // New Edit: edit_{id}

    let rawId = parts[1];
    if (parts[1] === "cat") rawId = parts[2]; // Legacy support just in case

    if (!rawId) {
      await ctx.answerCbQuery("Invalid request");
      return;
    }

    const txId = parseInt(rawId);

    try {
      if (data.startsWith("delete_")) {
        await prisma.transaction.delete({ where: { id: txId } });
        await ctx.editMessageText(`🗑️ Transaction #${txId} deleted.`);
        await ctx.answerCbQuery("Deleted");
      } else if (data.startsWith("edit_")) {
        // Generic Edit - Trigger Reply Flow
        await ctx.reply(
          `📝 Editing Transaction #${txId}.\nReply to this message with the new details (e.g., "Lunch 400").`,
          Markup.forceReply(),
        );
        await ctx.answerCbQuery("Check reply");
      }
    } catch (e) {
      logger.error("Callback Error", e);
      await ctx.answerCbQuery("Error processing action");
    }
  };

  public handleStart = async (ctx: Context) => {
    if (!ctx.from || ctx.from.id !== config.MY_TELEGRAM_ID) return;
    await ctx.reply(
      "👋 Ready to track your finances! Send me a message like 'Spent 500 on lunch'.",
    );
  };
}
