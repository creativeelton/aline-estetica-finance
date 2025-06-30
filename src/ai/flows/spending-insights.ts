'use server';

/**
 * @fileOverview An AI agent that provides spending insights by analyzing expense descriptions and categorizing spending patterns.
 *
 * - getSpendingInsights - A function that handles the spending insights process.
 * - SpendingInsightsInput - The input type for the getSpendingInsights function.
 * - SpendingInsightsOutput - The return type for the getSpendingInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SpendingInsightsInputSchema = z.object({
  expenseDescription: z
    .string()
    .describe('The description of the expense, e.g., \'Rent for studio space\'.'),
  expenseCategory: z.string().describe('The category of the expense, e.g., \'Rent\'.'),
  expenseValue: z.number().describe('The value of the expense.'),
});
export type SpendingInsightsInput = z.infer<typeof SpendingInsightsInputSchema>;

const SpendingInsightsOutputSchema = z.object({
  spendingInsight: z
    .string()
    .describe(
      'An insight about the spending pattern based on the expense description and category.'
    ),
});
export type SpendingInsightsOutput = z.infer<typeof SpendingInsightsOutputSchema>;

export async function getSpendingInsights(input: SpendingInsightsInput): Promise<SpendingInsightsOutput> {
  return spendingInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'spendingInsightsPrompt',
  input: {schema: SpendingInsightsInputSchema},
  output: {schema: SpendingInsightsOutputSchema},
  prompt: `You are a financial advisor specializing in providing spending insights for small businesses.

  Analyze the following expense description, category, and value to provide a concise and actionable insight.

  Description: {{{expenseDescription}}}
  Category: {{{expenseCategory}}}
  Value: {{{expenseValue}}}

  Insight:`,
});

const spendingInsightsFlow = ai.defineFlow(
  {
    name: 'spendingInsightsFlow',
    inputSchema: SpendingInsightsInputSchema,
    outputSchema: SpendingInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
