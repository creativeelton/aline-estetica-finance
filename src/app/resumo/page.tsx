import { getTransactions } from "@/lib/data";
import { SummaryTable } from "@/components/resumo/summary-table";

export default async function SummaryPage() {
    const transactions = await getTransactions();

    return <SummaryTable transactions={transactions} />;
}
