import OpenAI from "openai";
import { logger } from "../utils/logger";
import { z } from "zod";
import { TransactionType, Category } from "@prisma/client/wasm";

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
  constructor(private llmProvider: LLMProvider) { }

  async parseTransaction(rawText: string): Promise<ParsedTransaction> {
    const categories = Object.values(Category).join(", ");
    const types = Object.values(TransactionType).join(", ");

    const prompt = `
    Analyze the following financial transaction text and extract the details into a JSON object.
    
    Text: "${rawText}"

    Constraints:
    1. 'type' must be one of: [${types}].
    2. 'category' must be one of: [${categories}]. If unsure, use 'GENERAL'.
    3. 'amount' must be a number.
    4. 'currency' should be the 3-letter code (default 'INR' if not specified).
    5. 'description' should be a brief summary.
    6. 'relatedEntity' is who paid/received (e.g., 'Uber', 'John').
    7. 'paymentMethod' (e.g., 'UPI', 'Cash', 'Credit Card').
    8. 'userReply': Generate a short, friendly, and witty confirmation message for the user strictly summarizing what was saved (e.g., "Got it! 🍔 Spent 500 INR on Food."). 
    
    Output STRICTLY JSON. No markdown code blocks.
    Example:
    {"type": "EXPENSE", "amount": 500, "currency": "INR", "category": "FOOD_DINING", "description": "Lunch at McD", "relatedEntity": "McDonalds", "paymentMethod": "UPI", "userReply": "Yum! 🍔 Recorded 500 INR for lunch."}
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
