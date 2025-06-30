"use client";

import { useState, useMemo, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import type { Transaction } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2, Trash2 } from 'lucide-react';
import { deleteTransactionAction } from '@/app/resumo/actions';
import { useToast } from '@/hooks/use-toast';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export function SummaryTable({ transactions }: { transactions: Transaction[] }) {
    const [selectedMonth, setSelectedMonth] = useState<string>('all');
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const availableMonths = useMemo(() => {
        const months = new Set<string>();
        transactions.forEach(t => months.add(format(new Date(t.date), 'yyyy-MM')));
        return Array.from(months).sort().reverse();
    }, [transactions]);

    const filteredTransactions = useMemo(() => {
        if (selectedMonth === 'all') {
            return transactions;
        }
        return transactions.filter(t => format(new Date(t.date), 'yyyy-MM') === selectedMonth);
    }, [transactions, selectedMonth]);

    const summary = useMemo(() => {
        return filteredTransactions.reduce((acc, t) => {
            if (t.type === 'income') acc.totalIncome += t.amount;
            else acc.totalExpense += t.amount;
            return acc;
        }, { totalIncome: 0, totalExpense: 0 });
    }, [filteredTransactions]);

    const balance = summary.totalIncome - summary.totalExpense;

    const handleDelete = (transactionId: string) => {
        startTransition(async () => {
            const result = await deleteTransactionAction(transactionId);
            if (result.success) {
                toast({
                    title: "Sucesso!",
                    description: "Lançamento excluído.",
                });
            } else {
                toast({
                    variant: "destructive",
                    title: "Erro",
                    description: result.error || "Não foi possível excluir o lançamento.",
                });
            }
        });
    };

    return (
        <Card className="rounded-2xl shadow-lg">
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                    <CardTitle>Resumo de Lançamentos</CardTitle>
                    <CardDescription>Visualize, filtre e gerencie todas as suas transações.</CardDescription>
                </div>
                <div className="w-full md:w-auto md:min-w-[180px] mt-4 md:mt-0">
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filtrar por mês" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os Meses</SelectItem>
                            {availableMonths.map(month => (
                                <SelectItem key={month} value={month}>
                                    {format(new Date(`${month}-02T12:00:00Z`), 'MMMM yyyy', { locale: ptBR })}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
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
                            {filteredTransactions.length > 0 ? filteredTransactions.map((t) => (
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
                                                <Button variant="ghost" size="icon" disabled={isPending}>
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
                                                        disabled={isPending}
                                                    >
                                                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Excluir'}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">Nenhum lançamento encontrado.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
