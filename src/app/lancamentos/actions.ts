"use server";

import { z } from "zod";
import { addTransaction } from "@/lib/data";
import { getSpendingInsights } from "@/ai/flows/spending-insights";
import { revalidatePath } from "next/cache";

const formSchema = z.object({
    type: z.enum(["income", "expense"]),
    date: z.date(),
    amount: z.coerce.number().positive(),
    category: z.string().min(1),
    paymentMethod: z.string().min(1),
    description: z.string().min(1),
});

type FormState = {
    success: boolean;
    data?: {
        transactionId: string;
        insight?: string;
    },
    error?: string;
}

export async function addTransactionAction(values: z.infer<typeof formSchema>): Promise<FormState> {
    const validatedFields = formSchema.safeParse(values);
    
    if (!validatedFields.success) {
        return { success: false, error: "Campos inválidos." };
    }
    
    try {
        const newTransaction = await addTransaction({
            ...validatedFields.data,
            date: validatedFields.data.date.toISOString(),
        });
        
        let insight: string | undefined = undefined;

        if (newTransaction.type === 'expense') {
            try {
                const insightResult = await getSpendingInsights({
                    expenseDescription: newTransaction.description,
                    expenseCategory: newTransaction.category,
                    expenseValue: newTransaction.amount,
                });
                insight = insightResult.spendingInsight;
            } catch (aiError) {
                console.error("AI insight failed:", aiError);
                // Don't fail the whole transaction if AI fails
            }
        }
        
        revalidatePath('/');
        revalidatePath('/resumo');
        
        return { success: true, data: { transactionId: newTransaction.id, insight } };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Falha ao salvar a transação no banco de dados." };
    }
}
