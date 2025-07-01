"use client";

import { useState, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import type { Transaction } from '@/types';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2, Trash2, Calendar as CalendarIcon, FileDown } from 'lucide-react';
import { deleteTransaction } from '@/lib/data';
import { generatePdfReport } from '@/app/resumo/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export function SummaryTable({ transactions }: { transactions: Transaction[] }) {
    const [startDate, setStartDate] = useState<Date | undefined>(subDays(new Date(), 29));
    const [endDate, setEndDate] = useState<Date | undefined>(new Date());
    const [isDeleting, startDeleteTransition] = useTransition();
    const [isGeneratingPdf, startPdfTransition] = useTransition();
    const { toast } = useToast();
    const { user } = useAuth();
    const router = useRouter();

    const isInvalidDateRange = useMemo(() => {
      return startDate && endDate && startDate > endDate;
    }, [startDate, endDate]);

    const filteredTransactions = useMemo(() => {
        if (isInvalidDateRange) {
            return [];
        }

        if (startDate && endDate) {
            const from = new Date(startDate);
            from.setHours(0, 0, 0, 0);
            const to = new Date(endDate);
            to.setHours(23, 59, 59, 999);

            return transactions.filter(t => {
                const tDate = new Date(t.date);
                return tDate >= from && tDate <= to;
            });
        }
        
        return transactions;
    }, [transactions, startDate, endDate, isInvalidDateRange]);

    const summary = useMemo(() => {
        return filteredTransactions.reduce((acc, t) => {
            if (t.type === 'income') acc.totalIncome += t.amount;
            else acc.totalExpense += t.amount;
            return acc;
        }, { totalIncome: 0, totalExpense: 0 });
    }, [filteredTransactions]);

    const balance = summary.totalIncome - summary.totalExpense;

    const handleDelete = (transactionId: string) => {
        if (!user) {
            toast({ variant: "destructive", title: "Erro", description: "Usuário não autenticado." });
            return;
        }
        startDeleteTransition(async () => {
            const result = await deleteTransaction(transactionId, user.uid);
            if (result.success) {
                toast({
                    title: "Sucesso!",
                    description: "Lançamento excluído.",
                });
                router.refresh();
            } else {
                toast({
                    variant: "destructive",
                    title: "Erro",
                    description: result.error || "Não foi possível excluir o lançamento.",
                });
            }
        });
    };

    const handleGeneratePdf = () => {
      if (!user) {
        toast({ variant: "destructive", title: "Erro", description: "Usuário não autenticado." });
        return;
      }
      if (!startDate || !endDate) {
        toast({
            variant: "destructive",
            title: "Erro",
            description: "Por favor, selecione as datas de início e fim.",
        });
        return;
      }
      if (isInvalidDateRange) {
        toast({
            variant: "destructive",
            title: "Erro de data",
            description: "A data de início não pode ser posterior à data de fim.",
        });
        return;
      }

      startPdfTransition(async () => {
        if (filteredTransactions.length === 0) {
            toast({
                variant: "destructive",
                title: "Nenhum dado",
                description: "Nenhum lançamento encontrado para o período selecionado.",
            });
            return;
        }

        const result = await generatePdfReport(filteredTransactions, startDate, endDate);
        
        if (result.success && result.pdfData) {
            const link = document.createElement('a');
            link.href = `data:application/pdf;base64,${result.pdfData}`;
            link.download = `relatorio-financeiro-${format(startDate, 'yyyy-MM-dd')}-a-${format(endDate, 'yyyy-MM-dd')}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast({
                title: "Sucesso!",
                description: "Seu relatório em PDF está sendo baixado.",
            });
        } else {
            toast({
                variant: "destructive",
                title: "Erro ao gerar PDF",
                description: result.error || "Não foi possível gerar o relatório.",
            });
        }
      });
    };

    return (
        <Card className="rounded-2xl shadow-lg">
            <CardHeader className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                    <CardTitle>Resumo de Lançamentos</CardTitle>
                    <CardDescription>Visualize, filtre e gerencie todas as suas transações.</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full sm:w-[180px] justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? (
                            format(startDate, "P", { locale: ptBR })
                          ) : (
                            <span>Data de Início</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full sm:w-[180px] justify-start text-left font-normal",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? (
                            format(endDate, "P", { locale: ptBR })
                          ) : (
                            <span>Data de Fim</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                          initialFocus
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                    <Button onClick={handleGeneratePdf} disabled={isGeneratingPdf} className="w-full sm:w-auto">
                      {isGeneratingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                      Gerar PDF
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-3 mb-6">
                    <div className="rounded-lg p-4 bg-emerald-100/60 dark:bg-emerald-900/30">
                        <h3 className="text-sm font-medium text-emerald-800 dark:text-emerald-200">Receita Total</h3>
                        <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{formatCurrency(summary.totalIncome)}</p>
                    </div>
                    <div className="rounded-lg p-4 bg-rose-100/60 dark:bg-rose-900/30">
                        <h3 className="text-sm font-medium text-rose-800 dark:text-rose-200">Despesa Total</h3>
                        <p className="text-2xl font-bold text-rose-700 dark:text-rose-300">{formatCurrency(summary.totalExpense)}</p>
                    </div>
                    <div className="rounded-lg p-4 bg-muted">
                        <h3 className="text-sm font-medium text-muted-foreground">Saldo Final</h3>
                        <p className={`text-2xl font-bold ${balance >= 0 ? 'text-primary' : 'text-destructive'}`}>{formatCurrency(balance)}</p>
                    </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead>Categoria</TableHead>
                                <TableHead>Pagamento</TableHead>
                                <TableHead className="text-right">Valor</TableHead>
                                <TableHead className="w-[100px] text-center">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isInvalidDateRange ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24 text-destructive">
                                        A data de início não pode ser posterior à data de fim.
                                    </TableCell>
                                </TableRow>
                            ) : filteredTransactions.length > 0 ? filteredTransactions.map((t) => (
                                <TableRow key={t.id} className={t.type === 'income' ? 'bg-emerald-50/30 dark:bg-emerald-900/10' : 'bg-rose-50/30 dark:bg-rose-900/10'}>
                                    <TableCell>{format(new Date(t.date), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell className="font-medium">{t.description}</TableCell>
                                    <TableCell><Badge variant="outline">{t.category}</Badge></TableCell>
                                    <TableCell>{t.paymentMethod}</TableCell>
                                    <TableCell className={`text-right font-semibold ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                        {formatCurrency(t.amount)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                       <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" disabled={isDeleting}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                    <span className="sr-only">Excluir</span>
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Essa ação não pode ser desfeita. Isso excluirá permanentemente o lançamento.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDelete(t.id)}
                                                        className="bg-destructive hover:bg-destructive/90"
                                                        disabled={isDeleting}
                                                    >
                                                        {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Excluir'}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">Nenhum lançamento encontrado para o período selecionado.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
