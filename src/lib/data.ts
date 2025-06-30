// MOCK DATA
import { type Transaction, type Summary } from '@/types';

let transactions: Transaction[] = [
  { id: '1', date: new Date('2024-05-01'), type: 'income', category: 'Serviço de Estética', amount: 350, paymentMethod: 'Pix', description: 'Design de sobrancelha' },
  { id: '2', date: new Date('2024-05-03'), type: 'expense', category: 'Aluguel', amount: 1200, paymentMethod: 'Boleto', description: 'Aluguel do estúdio' },
  { id: '3', date: new Date('2024-05-05'), type: 'expense', category: 'Produtos', amount: 250, paymentMethod: 'Cartão de Crédito', description: 'Compra de ceras e cremes' },
  { id: '4', date: new Date('2024-05-10'), type: 'income', category: 'Venda de Produto', amount: 120, paymentMethod: 'Dinheiro', description: 'Venda de creme hidratante' },
  { id: '5', date: new Date('2024-05-15'), type: 'expense', category: 'Descartáveis', amount: 80, paymentMethod: 'Pix', description: 'Luvas, toucas, etc.' },
  { id: '6', date: new Date('2024-06-01'), type: 'income', category: 'Serviço de Estética', amount: 450, paymentMethod: 'Pix', description: 'Limpeza de pele' },
  { id: '7', date: new Date('2024-06-03'), type: 'expense', category: 'Aluguel', amount: 1200, paymentMethod: 'Boleto', description: 'Aluguel do estúdio' },
];

export async function getTransactions(): Promise<Transaction[]> {
  // In a real app, you'd fetch this from Firestore
  return Promise.resolve(transactions.sort((a, b) => b.date.getTime() - a.date.getTime()));
}

export async function getTransactionById(id: string): Promise<Transaction | undefined> {
  return Promise.resolve(transactions.find(t => t.id === id));
}

export async function addTransaction(transaction: Omit<Transaction, 'id' | 'date'> & { date: string }): Promise<Transaction> {
  const newTransaction: Transaction = {
    ...transaction,
    id: (transactions.length + 1).toString(),
    date: new Date(transaction.date),
  };
  transactions.unshift(newTransaction);
  return Promise.resolve(newTransaction);
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
