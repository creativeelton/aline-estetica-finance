import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import type { Summary } from '@/types';

type Props = {
  summary: Summary;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export function OverviewCards({ summary }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="rounded-2xl shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.balance)}</div>
          <p className="text-xs text-muted-foreground">Balanço total de receitas e despesas</p>
        </CardContent>
      </Card>
      <Card className="rounded-2xl shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Receitas</CardTitle>
          <TrendingUp className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.totalIncome)}</div>
           <p className="text-xs text-muted-foreground">Receitas no período</p>
        </CardContent>
      </Card>
      <Card className="rounded-2xl shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
          <TrendingDown className="h-4 w-4 text-rose-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.totalExpense)}</div>
          <p className="text-xs text-muted-foreground">Despesas no período</p>
        </CardContent>
      </Card>
    </div>
  );
}
