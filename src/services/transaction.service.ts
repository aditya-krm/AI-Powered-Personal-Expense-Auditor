import { prisma } from "../prisma/client";
import type { ParsedTransaction } from "./ai.service";
import { Prisma } from "@prisma/client";

export class TransactionService {
  async createTransaction(
    data: ParsedTransaction,
    telegramMessageId: string,
    userId?: number // Placeholder if we extend to multi-user
  ) {
    try {
      // Prisma Decimal requires string or number, handled automatically usually but explicit is good
      return await prisma.transaction.create({
        data: {
          type: data.type,
          amount: new Prisma.Decimal(data.amount),
          currency: data.currency,
          category: data.category,
          description: data.description,
          relatedEntity: data.relatedEntity,
          paymentMethod: data.paymentMethod,
          telegramMessageId: telegramMessageId,
          isSettled: data.type === "EXPENSE" || data.type === "INCOME", // Default logic
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new Error("This transaction has already been recorded.");
      }
      throw error;
    }
  }

  async getRecentSummary(limit = 5) {
    const transactions = await prisma.transaction.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return transactions.map((t: any) =>
      `• ${t.type} ${t.currency} ${t.amount} (${t.category}): ${t.description}`
    ).join("\n");
  }
}