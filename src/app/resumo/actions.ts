"use server";

import { z } from "zod";
import { deleteTransaction, getTransactions } from "@/lib/data";
import { revalidatePath } from "next/cache";
import { PDFDocument, rgb, StandardFonts, PageSizes } from "pdf-lib";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

const pdfReportSchema = z.object({
    from: z.date(),
    to: z.date(),
  });
  
  type PdfReportState = {
    success: boolean;
    pdfData?: string;
    error?: string;
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };
  
  export async function generatePdfReportAction(
    values: z.infer<typeof pdfReportSchema>
  ): Promise<PdfReportState> {
      const validatedFields = pdfReportSchema.safeParse(values);
  
      if (!validatedFields.success) {
          return { success: false, error: "Datas inválidas." };
      }
      
      try {
          const { from, to } = validatedFields.data;
          const transactions = await getTransactions({ from: from.toISOString(), to: to.toISOString() });
  
          if (transactions.length === 0) {
            return { success: false, error: "Nenhum lançamento encontrado para o período selecionado." };
          }
  
          const summary = transactions.reduce((acc, t) => {
              if (t.type === 'income') acc.totalIncome += t.amount;
              else acc.totalExpense += t.amount;
              return acc;
          }, { totalIncome: 0, totalExpense: 0 });
          const balance = summary.totalIncome - summary.totalExpense;
  
          // Create PDF
          const pdfDoc = await PDFDocument.create();
          const page = pdfDoc.addPage(PageSizes.A4);
          const { width, height } = page.getSize();
          const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
          const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
          let y = height - 50;
  
          // Header
          page.drawText('Relatório Financeiro', { x: 50, y, font: boldFont, size: 24, color: rgb(0.25, 0.25, 0.35) });
          y -= 20;
          const period = `Período: ${format(from, 'dd/MM/yyyy')} a ${format(to, 'dd/MM/yyyy')}`;
          page.drawText(period, { x: 50, y, font, size: 12, color: rgb(0.5, 0.5, 0.5) });
          y -= 30;
  
          // Summary
          page.drawText('Resumo do Período', { x: 50, y, font: boldFont, size: 16 });
          y -= 25;
          page.drawText(`Receita Total: ${formatCurrency(summary.totalIncome)}`, { x: 60, y, font, size: 12 });
          page.drawText(`Despesa Total: ${formatCurrency(summary.totalExpense)}`, { x: 220, y, font, size: 12 });
          page.drawText(`Saldo: ${formatCurrency(balance)}`, { x: 400, y, font: balance >= 0 ? boldFont : font, size: 12, color: balance >= 0 ? rgb(0.1, 0.5, 0.1) : rgb(0.8, 0.1, 0.1) });
          y -= 40;
  
          // Table Header
          const tableTop = y;
          const tableHeaders = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor'];
          const colWidths = [80, 200, 100, 60, 80];
          let x = 50;
  
          tableHeaders.forEach((header, i) => {
              page.drawText(header, { x, y: tableTop - 15, font: boldFont, size: 10 });
              x += colWidths[i];
          });
          page.drawLine({ start: { x: 45, y: tableTop - 25 }, end: { x: width - 50, y: tableTop - 25 }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
          y = tableTop - 40;
  
          // Table Rows
          transactions.forEach(t => {
              if (y < 60) {
                  // Add new page if content overflows
                  const newPage = pdfDoc.addPage(PageSizes.A4);
                  page.moveTo(50, height - 50); // reset position on new page
                  y = height - 50;
              }
              x = 50;
              const rowData = [
                  format(new Date(t.date), 'dd/MM/yyyy'),
                  t.description.length > 30 ? t.description.substring(0, 27) + '...' : t.description,
                  t.category,
                  t.type === 'income' ? 'Receita' : 'Despesa',
                  formatCurrency(t.amount)
              ];
              rowData.forEach((cell, i) => {
                  page.drawText(cell, { x, y, font, size: 10, color: t.type === 'income' ? rgb(0.1, 0.4, 0.1) : rgb(0.7, 0.1, 0.1) });
                  x += colWidths[i];
              });
              y -= 20;
          });
          
          const pdfBytes = await pdfDoc.save();
          const pdfBase64 = Buffer.from(pdfBytes).toString('base64');
  
          return { success: true, pdfData: pdfBase64 };
      } catch (error) {
          console.error("PDF Generation failed:", error);
          return { success: false, error: "Falha ao gerar o relatório PDF." };
      }
  }
