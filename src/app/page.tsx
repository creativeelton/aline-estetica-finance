import { OverviewCards } from '@/components/dashboard/overview-cards';
import { CategoryChart } from '@/components/dashboard/category-chart';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { AIInsights } from '@/components/dashboard/ai-insights';
import { getSummary, getTransactions } from '@/lib/data';

export default async function DashboardPage() {
  const summary = await getSummary();
  const transactions = await getTransactions();

  return (
    <div className="flex flex-col gap-6">
      <OverviewCards summary={summary} />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <CategoryChart transactions={transactions} />
        </div>
        <div className="lg:col-span-3">
          <RecentTransactions transactions={transactions.slice(0, 5)} />
        </div>
      </div>
       <AIInsights />
    </div>
  );
}
