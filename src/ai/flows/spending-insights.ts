'use server';

/**
 * @fileOverview Um agente de IA que fornece insights de gastos analisando descrições de despesas e categorizando padrões de gastos.
 *
 * - getSpendingInsights - A função que lida com o processo de insights de gastos.
 * - SpendingInsightsInput - O tipo de entrada para a função getSpendingInsights.
 * - SpendingInsightsOutput - O tipo de retorno para a função getSpendingInsights.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SpendingInsightsInputSchema = z.object({
  expenseDescription: z
    .string()
    .describe("A descrição da despesa, ex: 'Aluguel do espaço do estúdio'."),
  expenseCategory: z.string().describe("A categoria da despesa, ex: 'Aluguel'."),
  expenseValue: z.number().describe('O valor da despesa.'),
});
export type SpendingInsightsInput = z.infer<typeof SpendingInsightsInputSchema>;

const SpendingInsightsOutputSchema = z.object({
  spendingInsight: z
    .string()
    .describe(
      'Um insight sobre o padrão de gastos com base na descrição e categoria da despesa.'
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
  prompt: `Você é um consultor financeiro especializado em fornecer insights de gastos para pequenas empresas do ramo de estética.

  Analise a descrição, categoria e valor da despesa a seguir para fornecer um insight conciso e prático. A resposta DEVE ser em português do Brasil.

  Descrição: {{{expenseDescription}}}
  Categoria: {{{expenseCategory}}}
  Valor: {{{expenseValue}}}

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
