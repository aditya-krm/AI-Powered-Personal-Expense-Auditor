import { Markup } from "telegraf";
import { Category } from "@repo/database";

/**
 * Main action keyboard for a transaction
 * @param transactionId ID of the saved transaction
 */
export const getTransactionActions = (transactionId: number) => {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("✏️ Edit", `edit_${transactionId}`),
      Markup.button.callback("❌ Delete", `delete_${transactionId}`),
    ],
  ]);
};

/**
 * Grid of categories for editing
 * @param transactionId ID of the transaction to update
 */
export const getCategoryGrid = (transactionId: number) => {
  const categories = Object.values(Category);

  // Create usage-friendly labels (e.g., FOOD_DINING -> Food & Dining)
  // For now, we'll just use the enum values or simple transformation
  const buttons = categories.map((cat) => {
    const label = cat.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    return Markup.button.callback(label, `set_cat_${transactionId}_${cat}`);
  });

  // Group into rows of 3
  return Markup.inlineKeyboard(chunk(buttons, 2));
};

// Helper to chunk array
function chunk<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_v, i) =>
    arr.slice(i * size, i * size + size)
  );
}
