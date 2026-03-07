import { prisma } from "../prisma/client";
import type { ParsedTransaction } from "./ai.service";
import { Prisma, TransactionType } from "@prisma/client";

export class TransactionService {
  async createTransaction(
    data: ParsedTransaction,
    telegramMessageId: string,
    rawText: string,
    userId?: number
  ) {
    // 1. Prepare base data
    const amount = new Prisma.Decimal(data.amount);
    let parentId: number | null = null;
    let settlementStatus = false;
    let remainingBalance: Prisma.Decimal | null = null;

    // 2. SMART SETTLEMENT LOGIC
    // Only trigger if it's a REPAYMENT and we know who it is
    if (data.type === TransactionType.REPAYMENT && data.relatedEntity) {

      // Determine what we are looking for:
      // If I received money (REPAYMENT + INCOME context), I am looking for money I LENT.
      // If I paid money (REPAYMENT + EXPENSE context), I am looking for money I BORROWED.
      // *Wait* - The AI usually just tags "REPAYMENT". We need to infer direction.
      // Assumption: 
      // "Returned to Ravi" -> I paid -> finding BORROWED.
      // "Ravi returned" -> I received -> finding LENT.

      // Simple Heuristic based on typical AI output or description:
      // For now, we search for BOTH LENT and BORROWED and see which one fits best, 
      // or we rely on the user to be specific.
      // Better approach: Let's look for the *oldest unsettled transaction* involving this entity.

      const openTx = await prisma.transaction.findFirst({
        where: {
          relatedEntity: { equals: data.relatedEntity, mode: "insensitive" },
          isSettled: false,
          type: { in: [TransactionType.LENT, TransactionType.BORROWED] }
        },
        orderBy: { transactionDate: "asc" } // FIFO
      });

      if (openTx) {
        parentId = openTx.id;

        // Calculate total repayments so far for this parent
        const previousRepayments = await prisma.transaction.aggregate({
          _sum: { amount: true },
          where: { parentId: openTx.id }
        });

        const totalRepaid = (previousRepayments._sum.amount || new Prisma.Decimal(0)).add(amount);

        // Check if fully settled (allow for small float differences)
        if (totalRepaid.greaterThanOrEqualTo(openTx.amount)) {
          // Mark Parent as Settled
          await prisma.transaction.update({
            where: { id: openTx.id },
            data: { isSettled: true }
          });
          remainingBalance = new Prisma.Decimal(0);
        } else {
          remainingBalance = openTx.amount.minus(totalRepaid);
        }
      }
    }

    // 3. Save the new Transaction
    try {
      const newTx = await prisma.transaction.create({
        data: {
          type: data.type,
          amount: amount,
          currency: data.currency,
          category: data.category,
          description: data.description,
          relatedEntity: data.relatedEntity,
          paymentMethod: data.paymentMethod,
          telegramMessageId: telegramMessageId,
          rawText: rawText,
          parentId: parentId,
          isSettled: data.type === "EXPENSE" || data.type === "INCOME",
        },
      });

      return { ...newTx, remainingBalance };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        // Unique constraint violation (duplicate telegramMessageId)
        return { isDuplicate: true };
      }
      throw error;
    }
  }

  async updateTransaction(id: number, data: ParsedTransaction, rawText: string) {
    const amount = new Prisma.Decimal(data.amount);

    // We simple update the fields. Smart settlement logic is complex to re-run on edit 
    // without reverting previous state. For Phase 1, we just update the basic fields.
    // If settlement logic is critical, we might need a more complex rollback system.
    // For now, assume the user is correcting the details of THIS specific transaction.

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        type: data.type,
        amount: amount,
        currency: data.currency,
        category: data.category,
        description: data.description,
        relatedEntity: data.relatedEntity,
        paymentMethod: data.paymentMethod,
        rawText: rawText, // Update raw text to reflect the correction
        isSettled: data.type === "EXPENSE" || data.type === "INCOME",
      }
    });

    return updated;
  }

  async getRecentSummary(limit = 5) {
    const transactions = await prisma.transaction.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return transactions.map(t =>
      `• ${t.type} ${t.currency} ${t.amount} (${t.category}): ${t.description}`
    ).join("\n");
  }
}