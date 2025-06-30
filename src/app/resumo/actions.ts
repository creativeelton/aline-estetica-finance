"use server";

import { z } from "zod";
import { deleteTransaction, getTransactions } from "@/lib/data";
import { revalidatePath } from "next/cache";
import { PDFDocument, rgb, StandardFonts, PageSizes, PDFFont, PDFPage } from "pdf-lib";
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
          const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
          const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
          // Define Colors (0-1 scale)
          const primaryColor = rgb(0.21, 0.08, 0.61);
          const whiteColor = rgb(1, 1, 1);
          const darkTextColor = rgb(0.1, 0.1, 0.1);
          const mutedTextColor = rgb(0.4, 0.4, 0.4);
          const incomeColor = rgb(0.06, 0.72, 0.51);
          const expenseColor = rgb(0.96, 0.25, 0.37);
          
          const incomeBgColor = rgb(0.9, 0.98, 0.94);
          const expenseBgColor = rgb(0.99, 0.92, 0.93);
          const balanceBgColor = rgb(0.93, 0.92, 0.99);

          const tableHeaderBg = rgb(0.95, 0.95, 0.97);
          const rowOddBg = rgb(0.98, 0.98, 0.99);

          let page = pdfDoc.addPage(PageSizes.A4);
          const { width, height } = page.getSize();
          const margin = 40;

          const drawLogo = (page: PDFPage, centerX: number, centerY: number, size: number, color: any) => {
            const scale = size / 24;
            const circles = [
                { cx: 12, cy: 12, r: 3 },
                { cx: 12, cy: 5, r: 2 },
                { cx: 12, cy: 19, r: 2 },
                { cx: 5, cy: 12, r: 2 },
                { cx: 19, cy: 12, r: 2 },
                { cx: 16.5, cy: 7.5, r: 2 },
                { cx: 7.5, cy: 16.5, r: 2 },
                { cx: 16.5, cy: 16.5, r: 2 },
                { cx: 7.5, cy: 7.5, r: 2 },
            ];
        
            circles.forEach(circle => {
                const pdfCx = centerX + (circle.cx - 12) * scale;
                const pdfCy = centerY + (12 - circle.cy) * scale; // pdf-lib y-axis is bottom-up
                const pdfR = circle.r * scale;
        
                page.drawCircle({
                    x: pdfCx,
                    y: pdfCy,
                    size: pdfR,
                    borderColor: color,
                    borderWidth: 1.5,
                });
            });
        };
  
          const drawPageContent = (currentPage: PDFPage, isFirstPage: boolean) => {
            let y = height;
            // === HEADER ===
            if(isFirstPage) {
              currentPage.drawRectangle({
                x: 0,
                y: height - 100,
                width,
                height: 100,
                color: primaryColor,
              });
              currentPage.drawText('Relatório Financeiro', {
                x: margin,
                y: height - 60,
                font: boldFont,
                size: 28,
                color: whiteColor,
              });
              currentPage.drawText(`Período: ${format(from, 'dd/MM/yyyy')} a ${format(to, 'dd/MM/yyyy')}`, {
                x: margin,
                y: height - 85,
                font,
                size: 12,
                color: whiteColor,
              });
              
              const logoSize = 50;
              const logoX = width - margin - (logoSize / 2);
              const logoY = height - 65;
              drawLogo(currentPage, logoX, logoY, logoSize, whiteColor);
              
              y = height - 130;
  
              // === SUMMARY CARDS ===
              const cardWidth = (width - margin * 2 - 20) / 3;
              const cardHeight = 70;
              
              // Income Card
              currentPage.drawRectangle({ x: margin, y: y - cardHeight, width: cardWidth, height: cardHeight, color: incomeBgColor, });
              currentPage.drawText('Receita Total', { x: margin + 10, y: y - 25, font, size: 12, color: darkTextColor });
              currentPage.drawText(formatCurrency(summary.totalIncome), { x: margin + 10, y: y - 50, font: boldFont, size: 20, color: incomeColor });
    
              // Expense Card
              currentPage.drawRectangle({ x: margin + cardWidth + 10, y: y - cardHeight, width: cardWidth, height: cardHeight, color: expenseBgColor, });
              currentPage.drawText('Despesa Total', { x: margin + cardWidth + 20, y: y - 25, font, size: 12, color: darkTextColor });
              currentPage.drawText(formatCurrency(summary.totalExpense), { x: margin + cardWidth + 20, y: y - 50, font: boldFont, size: 20, color: expenseColor });
    
              // Balance Card
              currentPage.drawRectangle({ x: margin + (cardWidth + 10) * 2, y: y - cardHeight, width: cardWidth, height: cardHeight, color: balanceBgColor, });
              currentPage.drawText('Saldo Final', { x: margin + (cardWidth + 10) * 2 + 10, y: y - 25, font, size: 12, color: darkTextColor });
              currentPage.drawText(formatCurrency(balance), { x: margin + (cardWidth + 10) * 2 + 10, y: y - 50, font: boldFont, size: 20, color: primaryColor });
              y -= (cardHeight + 30);
    
              // Table Title
              currentPage.drawText('Detalhes dos Lançamentos', { x: margin, y: y, font: boldFont, size: 16, color: darkTextColor });
              y -= 25;
            } else {
              y = height - margin;
            }

            return y;
          }

          let y = drawPageContent(page, true);

          // === TABLE ===
          const tableHeaders = ['Data', 'Descrição', 'Categoria', 'Pagamento', 'Valor'];
          const colStarts = [margin, margin + 80, margin + 270, margin + 370, margin + 450];
          const tableHeaderHeight = 25;

          const drawTableHeader = (currentPage: PDFPage, yPos: number) => {
            currentPage.drawRectangle({ x: margin, y: yPos - tableHeaderHeight, width: width - margin * 2, height: tableHeaderHeight, color: tableHeaderBg });
            colStarts.forEach((xPos, i) => {
                currentPage.drawText(tableHeaders[i], { x: xPos + 5, y: yPos - 17, font: boldFont, size: 10, color: mutedTextColor });
            });
            return yPos - tableHeaderHeight;
          };

          y = drawTableHeader(page, y);

          transactions.forEach((t, index) => {
              const rowHeight = 25;
              if (y - rowHeight < margin) {
                  page = pdfDoc.addPage(PageSizes.A4);
                  y = drawPageContent(page, false);
                  y = drawTableHeader(page, y);
              }
              
              if ((index + 1) % 2 !== 0) {
                  page.drawRectangle({ x: margin, y: y - rowHeight, width: width - margin * 2, height: rowHeight, color: rowOddBg });
              }

              const rowData = [
                  format(new Date(t.date), 'dd/MM/yy'),
                  t.description.length > 28 ? t.description.substring(0, 25) + '...' : t.description,
                  t.category.length > 15 ? t.category.substring(0, 12) + '...' : t.category,
                  t.paymentMethod,
                  formatCurrency(t.amount)
              ];
              const valueColor = t.type === 'income' ? incomeColor : expenseColor;

              page.drawText(rowData[0], { x: colStarts[0] + 5, y: y - 17, font, size: 10, color: darkTextColor });
              page.drawText(rowData[1], { x: colStarts[1] + 5, y: y - 17, font, size: 10, color: darkTextColor });
              page.drawText(rowData[2], { x: colStarts[2] + 5, y: y - 17, font, size: 10, color: darkTextColor });
              page.drawText(rowData[3], { x: colStarts[3] + 5, y: y - 17, font, size: 10, color: darkTextColor });
              page.drawText(rowData[4], { x: colStarts[4] + 5, y: y - 17, font: boldFont, size: 10, color: valueColor });
              
              y -= rowHeight;
          });
          
          // Footer with page numbers
          const pageCount = pdfDoc.getPageCount();
          for (let i = 0; i < pageCount; i++) {
              const currentPage = pdfDoc.getPage(i);
              currentPage.drawText(`Página ${i + 1} de ${pageCount}`, {
                  x: currentPage.getWidth() / 2 - 30,
                  y: margin / 2,
                  size: 8,
                  font: font,
                  color: mutedTextColor,
              });
          }
          
          const pdfBytes = await pdfDoc.save();
          const pdfBase64 = Buffer.from(pdfBytes).toString('base64');
  
          return { success: true, pdfData: pdfBase64 };
      } catch (error) {
          console.error("PDF Generation failed:", error);
          return { success: false, error: "Falha ao gerar o relatório PDF." };
      }
  }
