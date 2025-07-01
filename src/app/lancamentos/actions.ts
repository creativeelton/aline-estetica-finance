"use server";

import { getSpendingInsights, type SpendingInsightsInput } from "@/ai/flows/spending-insights";

/**
 * Server action to generate a financial insight for a given expense.
 * This is called from the client after a transaction has been successfully saved.
 * @param input The details of the expense.
 * @returns An object containing the insight string or an error message.
 */
export async function generateInsightForExpense(input: SpendingInsightsInput): Promise<{ insight?: string; error?: string }> {
    try {
        const result = await getSpendingInsights(input);
        return { insight: result.spendingInsight };
    } catch (aiError) {
        console.error("AI insight failed:", aiError);
        return { error: "Falha ao gerar o insight de IA." };
    }
}
