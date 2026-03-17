import { prisma } from "../prisma/client";
import { TransactionAIService } from "./ai.service";
import { TransactionStatus } from "@prisma/client";
import { Telegraf } from "telegraf";
import { logger } from "../utils/logger";
import { Prisma } from "@prisma/client";
import type { GmailMessageDetail } from "./gmail.service";

const FINANCIAL_SENDERS = [
  "onlinesbicard@sbicard.com",
  "adkarmakar621@gmail.com"
];

function isFinancialEmail(from: string): boolean {
  const lower = from.toLowerCase();
  return FINANCIAL_SENDERS.some((sender) => lower.includes(sender));
}

export class EmailProcessorService {
  constructor(
    private aiService: TransactionAIService,
    private bot: Telegraf,
    private telegramChatId: number
  ) { }

  async processEmail(msg: GmailMessageDetail): Promise<void> {
    if (!isFinancialEmail(msg.from)) {
      return;
    }

    logger.info(`🧠 Financial email detected from ${msg.from} — parsing...`);

    const rawText = msg.snippet?.trim() || msg.body.slice(0, 300).trim();

    if (!rawText) {
      logger.warn(`⚠️  Empty content from ${msg.from}, skipping`);
      return;
    }

    let parsed;
    try {
      parsed = await this.aiService.parseTransaction(rawText);
    } catch (err) {
      logger.error(`❌ AI parse failed for email ${msg.id}:`, err);
      return;
    }

    let draft;
    try {
      draft = await prisma.transaction.create({
        data: {
          type: parsed.type,
          amount: new Prisma.Decimal(parsed.amount),
          currency: parsed.currency ?? "INR",
          category: parsed.category,
          description: parsed.description,
          relatedEntity: parsed.relatedEntity ?? null,
          paymentMethod: "SBI Credit Card",
          rawText: rawText,
          sourceId: msg.id,
          status: TransactionStatus.PENDING,
          isSettled: false,
        },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        logger.warn(`⚠️  Duplicate email ${msg.id} — already processed, skipping`);
        return;
      }
      throw err;
    }

    logger.info(`💾 Draft saved (id: ${draft.id}) — sending Telegram alert`);

    await this.bot.telegram.sendMessage(
      this.telegramChatId,
      `💳 *SBI Auto-Detect (Draft #${draft.id})*\n\n` +
      `🏢 *Merchant:* ${parsed.description}\n` +
      `💰 *Amount:* ${parsed.currency} ${parsed.amount}\n` +
      `📂 *Category:* ${parsed.category}\n` +
      `📝 *Raw:* _${rawText.slice(0, 120)}_\n\n` +
      `If details look wrong, tap ✏️ Edit and reply with corrections.
`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              { text: "✏️ Edit", callback_data: `edit_${draft.id}` },
              { text: "✅ Confirm", callback_data: `approve_draft_${draft.id}` },
              { text: "❌ Discard", callback_data: `discard_draft_${draft.id}` },
            ],
          ],
        },
      }
    );
  }
}
