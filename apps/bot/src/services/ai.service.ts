import OpenAI from "openai";
import { logger } from "../utils/logger";
import { z } from "zod";
import { TransactionType, Category } from "@repo/database";

// --- Interfaces ---

export interface LLMProvider {
  generateCompletion(prompt: string): Promise<string>;
}

export interface ParsedTransaction {
  type: TransactionType;
  amount: number;
  currency: string;
  category: Category;
  description: string;
  relatedEntity?: string;
  paymentMethod?: string;
  userReply: string;
}

// --- Zod Schema for Validation ---
const TransactionSchema = z.object({
  type: z.nativeEnum(TransactionType),
  amount: z.number(),
  currency: z.string().length(3).default("INR"),
  category: z.nativeEnum(Category),
  description: z.string(),
  relatedEntity: z.string().optional().nullable(),
  paymentMethod: z.string().optional().nullable(),
  userReply: z.string(),
});

// --- OpenAI Implementation ---

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async generateCompletion(prompt: string): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-5.2",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful financial assistant. Output strictly valid JSON.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("No content from OpenAI");
      return content;
    } catch (error) {
      logger.error("OpenAI Error:", error);
      throw error;
    }
  }
}

// --- Main Service ---

export class TransactionAIService {
  constructor(private llmProvider: LLMProvider) {}

  async parseTransaction(rawText: string): Promise<ParsedTransaction> {
    const categories = Object.values(Category).join(", ");
    const types = Object.values(TransactionType).join(", ");

    const prompt = `
    You are a strict financial parser. Analyze the text and output ONLY valid JSON matching this schema. 
    Do NOT use markdown code blocks. Do not add conversational text.
    
    Text: "${rawText}"

    Schema:
    {
      "type": "EXPENSE" | "INCOME" | "LENT" | "BORROWED" | "REPAYMENT",
      "amount": number,
      "currency": "INR",
      "category": "Enum [${categories}]",
      "description": "string",
      "relatedEntity": "string (capitalized name) or null",
      "paymentMethod": "string or null",
      "userReply": "Short witty confirmation string"
    }

    Constraints:
    1. 'type' must be one of: [${types}].
    2. 'category' defaults to 'GENERAL' if unsure.
    3. 'amount' is a number.
    4. 'relatedEntity' is mandatory for LENT/BORROWED/REPAYMENT.
    `;

    const rawResponse = await this.llmProvider.generateCompletion(prompt);

    // Clean up markdown if present
    const cleanedJson = rawResponse
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    try {
      const parsed = JSON.parse(cleanedJson);
      // Validate with Zod
      const validated = TransactionSchema.parse(parsed);
      return validated as ParsedTransaction;
    } catch (e) {
      logger.error("Failed to parse AI response:", rawResponse);
      throw new Error("Could not parse transaction details from AI response.");
    }
  }
}
