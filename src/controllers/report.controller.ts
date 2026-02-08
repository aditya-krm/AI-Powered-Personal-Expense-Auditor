import { Context } from "telegraf";
import { prisma } from "../prisma/client";
import { TransactionType } from "@prisma/client";
import { startOfDay, endOfDay } from "../utils/date";
import { logger } from "../utils/logger";
import { config } from "../config/env";

export class ReportController {

  public handleDailySummary = async (ctx: Context) => {
    if (!ctx.from || ctx.from.id !== config.MY_TELEGRAM_ID) return;

    try {
      const now = new Date();
      const start = startOfDay(now);
      const end = endOfDay(now);

      const txs = await prisma.transaction.findMany({
        where: {
          transactionDate: { gte: start, lte: end },
        },
      });

      if (txs.length === 0) {
        return await ctx.reply("📅 **Today's Activity:** No transactions recorded.");
      }

      let income = 0;
      let expense = 0;
      let lent = 0;
      let borrowed = 0;
      let repaid = 0;
      const expenseCats: Record<string, number> = {};

      for (const t of txs) {
        const amt = Number(t.amount);
        switch (t.type) {
          case TransactionType.INCOME:
            income += amt;
            break;
          case TransactionType.EXPENSE:
            expense += amt;
            expenseCats[t.category] = (expenseCats[t.category] || 0) + amt;
            break;
          case TransactionType.LENT:
            lent += amt;
            break;
          case TransactionType.BORROWED:
            borrowed += amt;
            break;
          case TransactionType.REPAYMENT:
            repaid += amt;
            break;
        }
      }

      let reply = `📅 **Today's Summary**\n`;
      reply += `────────────────\n`;
      if (income > 0) reply += `💰 **Income:** ₹${income.toFixed(2)}\n`;
      if (expense > 0) reply += `💸 **Expense:** ₹${expense.toFixed(2)}\n`;
      if (lent > 0) reply += `🤝 **Lent:** ₹${lent.toFixed(2)}\n`;
      if (borrowed > 0) reply += `🤲 **Borrowed:** ₹${borrowed.toFixed(2)}\n`;
      if (repaid > 0) reply += `🔄 **Repayments:** ₹${repaid.toFixed(2)}\n`;

      if (Object.keys(expenseCats).length > 0) {
        reply += `\n**Expense Breakdown:**\n`;
        for (const [cat, amt] of Object.entries(expenseCats)) {
          const catName = cat.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
          reply += `• ${catName}: ₹${amt.toFixed(2)}\n`;
        }
      }

      await ctx.reply(reply);

    } catch (error) {
      logger.error("Error generating daily summary", error);
      await ctx.reply("❌ Failed to generate summary.");
    }
  };

  public handleLoans = async (ctx: Context) => {
    if (!ctx.from || ctx.from.id !== config.MY_TELEGRAM_ID) return;

    try {
      // Fetch all transactions involving a related entity
      const txs = await prisma.transaction.findMany({
        where: { relatedEntity: { not: null } },
      });

      const balances: Record<string, { lent: number; borrowed: number; repaid: number }> = {};

      for (const t of txs) {
        let name = t.relatedEntity!;
        // Normalize name to Title Case to group "bob", "Bob", "BOB" together
        name = name.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

        balances[name] ??= { lent: 0, borrowed: 0, repaid: 0 };

        const amt = Number(t.amount);
        if (t.type === TransactionType.LENT) balances[name]!.lent += amt;
        else if (t.type === TransactionType.BORROWED) balances[name]!.borrowed += amt;
        else if (t.type === TransactionType.REPAYMENT) balances[name]!.repaid += amt;
      }

      let oweMeText = "";
      let iOweText = "";
      let hasData = false;

      for (const [name, bal] of Object.entries(balances)) {
        const netLent = bal.lent - bal.borrowed;

        // Logic: Repayments reduce the absolute magnitude of the net position
        if (netLent > 0) {
          // I lent more -> They owe me
          const outstanding = netLent - bal.repaid;
          if (outstanding > 1) {
            oweMeText += `• **${name}**: ₹${outstanding.toFixed(2)}\n`;
            hasData = true;
          }
        } else if (netLent < 0) {
          // I borrowed more -> I owe them
          const outstanding = Math.abs(netLent) - bal.repaid;
          if (outstanding > 1) {
            iOweText += `• **${name}**: ₹${outstanding.toFixed(2)}\n`;
            hasData = true;
          }
        }
      }

      if (!hasData) {
        await ctx.reply("🎉 No outstanding debts!");
        return;
      }

      let finalReply = "";
      if (oweMeText) finalReply += `👤 **People Owe You:**\n${oweMeText}\n`;
      if (iOweText) finalReply += `🏠 **You Owe:**\n${iOweText}`;

      await ctx.reply(finalReply);

    } catch (error) {
      logger.error("Error generating loan report", error);
      await ctx.reply("❌ Failed to generate loan report.");
    }
  };
}
