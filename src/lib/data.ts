// MOCK DATA
import { type Transaction, type Summary } from '@/types';

let transactions: Transaction[] = [
  { id: '1', date: new Date('2024-05-01').toISOString(), type: 'income', category: 'Serviço de Estética', amount: 350, paymentMethod: 'Pix', description: 'Design de sobrancelha' },
  { id: '2', date: new Date('2024-05-03').toISOString(), type: 'expense', category: 'Aluguel', amount: 1200, paymentMethod: 'Boleto', description: 'Aluguel do estúdio' },
  { id: '3', date: new Date('2024-05-05').toISOString(), type: 'expense', category: 'Produtos', amount: 250, paymentMethod: 'Cartão de Crédito', description: 'Compra de ceras e cremes' },
  { id: '4', date: new Date('2024-05-10').toISOString(), type: 'income', category: 'Venda de Produto', amount: 120, paymentMethod: 'Dinheiro', description: 'Venda de creme hidratante' },
  { id: '5', date: new Date('2024-05-15').toISOString(), type: 'expense', category: 'Descartáveis', amount: 80, paymentMethod: 'Pix', description: 'Luvas, toucas, etc.' },
  { id: '6', date: new Date('2024-06-01').toISOString(), type: 'income', category: 'Serviço de Estética', amount: 450, paymentMethod: 'Pix', description: 'Limpeza de pele' },
  { id: '7', date: new Date('2024-06-03').toISOString(), type: 'expense', category: 'Aluguel', amount: 1200, paymentMethod: 'Boleto', description: 'Aluguel do estúdio' },
];

export async function getTransactions(options?: { from?: string; to?: string }): Promise<Transaction[]> {
  // In a real app, you'd fetch this from Firestore with where clauses
  let filteredTransactions = transactions;

  if (options?.from && options?.to) {
    const fromDate = new Date(options.from);
    fromDate.setHours(0, 0, 0, 0); // Start of the day
    const toDate = new Date(options.to);
    toDate.setHours(23, 59, 59, 999); // End of the day

    filteredTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate >= fromDate && tDate <= toDate;
    });
  }

  return Promise.resolve(filteredTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
}


export async function getTransactionById(id: string): Promise<Transaction | undefined> {
  return Promise.resolve(transactions.find(t => t.id === id));
}

export async function addTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
  const newTransaction: Transaction = {
    ...transaction,
    id: (transactions.length + 2).toString(),
  };
  transactions.unshift(newTransaction);
  return Promise.resolve(newTransaction);
}

export async function deleteTransaction(id: string): Promise<{ success: boolean }> {
    const initialLength = transactions.length;
    transactions = transactions.filter(t => t.id !== id);
    const success = transactions.length < initialLength;
    return Promise.resolve({ success });
}

export async function getSummary(): Promise<Summary> {
  const summary = transactions.reduce((acc, t) => {
    if (t.type === 'income') {
      acc.totalIncome += t.amount;
    } else {
      acc.totalExpense += t.amount;
    }
    return acc;
  }, { totalIncome: 0, totalExpense: 0, balance: 0 });

  return Promise.resolve({
    ...summary,
    balance: summary.totalIncome - summary.totalExpense,
  });
}

export const categories = [
  'Aluguel',
  'Produtos',
  'Descartáveis',
  'Marketing',
  'Salários',
  'Contas',
  'Serviço de Estética',
  'Venda de Produto',
  'Outros'
];

export const paymentMethods = [
  'Pix',
  'Dinheiro',
  'Cartão de Crédito',
  'Cartão de Débito',
  'Boleto'
];
