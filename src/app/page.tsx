'use client';

import { useEffect, useState } from 'react';
import { getTransactions } from '@/lib/data';
import { DashboardContainer } from '@/components/dashboard/dashboard-container';
import { AIInsights } from '@/components/dashboard/ai-insights';
import { useAuth } from '@/contexts/auth-context';
import type { Transaction } from '@/types';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      getTransactions(user.uid)
        .then(data => {
          setTransactions(data);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="sr-only">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <DashboardContainer transactions={transactions} />
      <AIInsights />
    </div>
  );
}
