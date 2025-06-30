"use client";
import { Bar, BarChart, XAxis, YAxis, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { Transaction } from '@/types';
import { useMemo } from 'react';

type Props = {
  transactions: Transaction[];
};

const formatCurrencyForTooltip = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

// Define a color palette for the chart bars
const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "hsl(var(--accent))",
  ];

export function CategoryChart({ transactions }: Props) {
  const chartData = useMemo(() => {
    const categoryTotals = transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => {
        const existing = acc.find((item) => item.category === t.category);
        if (existing) {
          existing.total += t.amount;
        } else {
          acc.push({ category: t.category, total: t.amount });
        }
        return acc;
      }, [] as { category: string; total: number }[])
      .sort((a,b) => b.total - a.total);
      
    return categoryTotals.map((item, index) => ({
        ...item,
        fill: COLORS[index % COLORS.length]
    }));
  }, [transactions]);
  
  const chartConfig = {
    total: {
      label: "Total",
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
            <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 10, right: 30 }}>
                <XAxis type="number" hide />
                <YAxis 
                    dataKey="category" 
                    type="category" 
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickMargin={5}
                    width={100}
                />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel formatter={(value) => formatCurrencyForTooltip(Number(value))} />}
                />
                <Bar dataKey="total" radius={5}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                </Bar>
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
