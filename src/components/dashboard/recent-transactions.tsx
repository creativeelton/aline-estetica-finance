"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { Transaction } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Props = {
  transactions: Transaction[];
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

export function RecentTransactions({ transactions }: Props) {
  return (
    <Card className="rounded-2xl shadow-lg h-full">
      <CardHeader>
        <CardTitle>Lançamentos Recentes</CardTitle>
        <CardDescription>Clique em um lançamento para ver os detalhes.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t) => (
                <Dialog key={t.id}>
                  <DialogTrigger asChild>
                    <TableRow className="cursor-pointer">
                      <TableCell>
                        <div className="font-medium">{t.description}</div>
                        <div className="text-sm text-muted-foreground">{t.category}</div>
                      </TableCell>
                      <TableCell className={`text-right font-medium ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                      </TableCell>
                    </TableRow>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Detalhes do Lançamento</DialogTitle>
                        <DialogDescription>
                            Informações completas sobre a transação selecionada.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 text-sm">
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-muted-foreground">Data</span>
                            <span className="font-medium">{format(new Date(t.date), 'PPP', { locale: ptBR })}</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-muted-foreground">Descrição</span>
                            <span className="font-medium text-right">{t.description}</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-muted-foreground">Categoria</span>
                            <Badge variant="outline">{t.category}</Badge>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-muted-foreground">Forma de Pagamento</span>
                            <span className="font-medium">{t.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-muted-foreground">Tipo</span>
                            <Badge variant={t.type === 'income' ? 'default' : 'destructive'} className={t.type === 'income' ? 'bg-emerald-500/80' : 'bg-rose-500/80'}>
                                {t.type === 'income' ? 'Receita' : 'Despesa'}
                            </Badge>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="text-muted-foreground text-base">Valor</span>
                            <span className={`font-bold text-lg ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {formatCurrency(t.amount)}
                            </span>
                        </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
