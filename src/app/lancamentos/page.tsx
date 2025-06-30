import { NewTransactionForm } from '@/components/lancamentos/new-transaction-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewTransactionPage() {
    return (
        <div className="flex justify-center">
            <Card className="w-full max-w-2xl rounded-2xl shadow-lg">
                <CardHeader>
                    <CardTitle>Registrar Lançamento</CardTitle>
                    <CardDescription>Adicione uma nova receita ou despesa.</CardDescription>
                </CardHeader>
                <CardContent>
                    <NewTransactionForm />
                </CardContent>
            </Card>
        </div>
    )
}
