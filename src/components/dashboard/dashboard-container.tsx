'use client';

import { useState, useMemo } from 'react';
import { isToday, isThisWeek, isThisMonth, isThisYear } from 'date-fns';
import type { Transaction, Summary } from '@/types';
import { OverviewCards } from '@/components/dashboard/overview-cards';
import { CategoryChart } from '@/components/dashboard/category-chart';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { Button } from '@/components/ui/button';

type FilterType = 'day' | 'week' | 'month' | 'year';

export function DashboardContainer({ transactions }: { transactions: Transaction[] }) {
  const [filter, setFilter] = useState<FilterType>('month');

  const { filteredTransactions, summary } = useMemo(() => {
    const filtered = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      switch (filter) {
        case 'day':
          return isToday(transactionDate);
        case 'week':
          return isThisWeek(transactionDate);
        case 'month':
          return isThisMonth(transactionDate);
        case 'year':
          return isThisYear(transactionDate);
        default:
          return true;
      }
    });

    const calculatedSummary: Summary = filtered.reduce(
      (acc, t) => {
        if (t.type === 'income') {
          acc.totalIncome += t.amount;
        } else {
          acc.totalExpense += t.amount;
        }
        return acc;
      },
      { totalIncome: 0, totalExpense: 0, balance: 0 }
    );
    calculatedSummary.balance = calculatedSummary.totalIncome - calculatedSummary.totalExpense;

    return { filteredTransactions: filtered, summary: calculatedSummary };
  }, [filter, transactions]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-end gap-2">
        <Button variant={filter === 'day' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('day')}>Hoje</Button>
        <Button variant={filter === 'week' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('week')}>Esta Semana</Button>
        <Button variant={filter === 'month' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('month')}>Este Mês</Button>
        <Button variant={filter === 'year' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('year')}>Este Ano</Button>
      </div>

      <OverviewCards summary={summary} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <CategoryChart transactions={filteredTransactions} />
        </div>
        <div className="lg:col-span-3">
          <RecentTransactions transactions={filteredTransactions.slice(0, 5)} />
        </div>
      </div>
    </div>
  );
}
