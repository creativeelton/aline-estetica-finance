"use server";

import { z } from "zod";
import { deleteTransaction } from "@/lib/data";
import { revalidatePath } from "next/cache";

const deleteSchema = z.string().min(1, { message: "ID da transação é obrigatório." });

type FormState = {
    success: boolean;
    error?: string;
}

export async function deleteTransactionAction(transactionId: string): Promise<FormState> {
    const validatedId = deleteSchema.safeParse(transactionId);

    if (!validatedId.success) {
        return { success: false, error: "ID da transação inválido." };
    }

    try {
        const result = await deleteTransaction(validatedId.data);

        if (!result.success) {
            return { success: false, error: "Transação não encontrada." };
        }

        revalidatePath('/');
        revalidatePath('/resumo');
        
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Falha ao excluir a transação." };
    }
}
