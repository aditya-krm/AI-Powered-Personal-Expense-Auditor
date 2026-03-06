import { prisma } from "../prisma/client";
import { startOfDay, endOfDay } from "../utils/date";
import { TransactionType } from "@prisma/client"

export class ApiController {
  public async getSummary() {
    const now = new Date();
    const start = startOfDay(now);
    const end = endOfDay(now);

    const txs = await prisma.transaction.findMany({
      where: {
        transactionDate: { gte: start, lte: end },
      },
    });

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

    return {
      income,
      expense,
      lent,
      borrowed,
      repaid,
      expenseCats,
      totalTransactions: txs.length
    };
  }

  public async getLoans() {
    const txs = await prisma.transaction.findMany({
      where: { relatedEntity: { not: null } },
    });

    const balances: Record<string, { lent: number; borrowed: number; repaid: number }> = {};

    for (const t of txs) {
      if (!t.relatedEntity) continue;

      let name = t.relatedEntity;
      name = name.toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase());

      balances[name] ??= { lent: 0, borrowed: 0, repaid: 0 };
      const amt = Number(t.amount);

      if (t.type === TransactionType.LENT) balances[name]!.lent += amt;
      else if (t.type === TransactionType.BORROWED) balances[name]!.borrowed += amt;
      else if (t.type === TransactionType.REPAYMENT) balances[name]!.repaid += amt;
    }

    const oweMe: { name: string, amount: number }[] = [];
    const iOwe: { name: string, amount: number }[] = [];

    for (const [name, bal] of Object.entries(balances)) {
      const netLent = bal.lent - bal.borrowed;
      if (netLent > 0) {
        const outstanding = netLent - bal.repaid;
        if (outstanding > 1) oweMe.push({ name, amount: outstanding });
      } else if (netLent < 0) {
        const outstanding = Math.abs(netLent) - bal.repaid;
        if (outstanding > 1) iOwe.push({ name, amount: outstanding });
      }
    }

    return { oweMe, iOwe };
  }

  public async getRecentTransactions(limit: number = 20) {
    const txs = await prisma.transaction.findMany({
      take: limit,
      orderBy: { createdAt: "desc" }
    });
    return txs;
  }
}
