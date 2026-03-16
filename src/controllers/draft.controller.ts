import { Context } from "telegraf";
import { prisma } from "../prisma/client";
import { TransactionStatus } from "@prisma/client";
import { logger } from "../utils/logger";

export class DraftController {

  handleApprove = async (ctx: Context) => {
    const match = (ctx as any).match as RegExpExecArray;
    const txId = parseInt(match[1] || "0", 10);

    try {
      const tx = await prisma.transaction.update({
        where: { id: txId },
        data: { status: TransactionStatus.CONFIRMED },
      });

      await ctx.answerCbQuery("✅ Transaction confirmed!");
      await ctx.editMessageText(
        `✅ *Confirmed*\n\n` +
        `🏢 ${tx.description}\n` +
        `💰 ${tx.currency} ${tx.amount}\n` +
        `📂 ${tx.category}`,
        { parse_mode: "Markdown" }
      );
    } catch (err) {
      logger.error("approve_draft error", err);
      await ctx.answerCbQuery("❌ Error confirming — check logs");
    }
  };

  handleDiscard = async (ctx: Context) => {
    const match = (ctx as any).match as RegExpExecArray;
    const txId = parseInt(match[1] || "0", 10);

    try {
      await prisma.transaction.delete({ where: { id: txId } });

      await ctx.answerCbQuery("🗑️ Draft discarded");
      await ctx.editMessageText("❌ Auto-detected transaction discarded.");
    } catch (err) {
      logger.error("discard_draft error", err);
      await ctx.answerCbQuery("❌ Error discarding — check logs");
    }
  };
}
