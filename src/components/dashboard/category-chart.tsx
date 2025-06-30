"use client";
import { Bar, BarChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { Transaction } from '@/types';
import { useMemo } from 'react';

type Props = {
  transactions: Transaction[];
};

export function CategoryChart({ transactions }: Props) {
  const chartData = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => {
        const existing = acc.find((item) => item.category === t.category);
        if (existing) {
          existing.total += t.amount;
        } else {
          acc.push({ category: t.category, total: t.amount });
        }
        return acc;
      }, [] as { category: string; total: number }[]);
  }, [transactions]);
  
  const chartConfig = {
    total: {
      label: "Total",
      color: "hsl(var(--primary))",
    },
    category: {
        label: "Categoria",
    }
  };

  return (
    <Card className="rounded-2xl shadow-lg h-full">
      <CardHeader>
        <CardTitle>Gastos por Categoria</CardTitle>
        <CardDescription>Análise das despesas do último período.</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 10 }}>
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="total" fill="var(--color-total)" radius={5} />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-muted-foreground">Não há dados de despesas para exibir.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
