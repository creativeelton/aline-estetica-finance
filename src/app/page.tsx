import { getTransactions } from '@/lib/data';
import { DashboardContainer } from '@/components/dashboard/dashboard-container';
import { AIInsights } from '@/components/dashboard/ai-insights';

export default async function DashboardPage() {
  const transactions = await getTransactions();

  return (
    <div className="flex flex-col gap-6">
      <DashboardContainer transactions={transactions} />
      <AIInsights />
    </div>
  );
}
