'use client';

import { useEffect, useState } from 'react';
import { getTransactions } from '@/lib/data';
import { SummaryTable } from '@/components/resumo/summary-table';
import { useAuth } from '@/contexts/auth-context';
import type { Transaction } from '@/types';
import { Loader2 } from 'lucide-react';

export default function SummaryPage() {
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

  return <SummaryTable transactions={transactions} />;
}
