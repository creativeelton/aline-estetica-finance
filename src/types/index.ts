export type Transaction = {
  id: string;
  userId: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  paymentMethod: string;
  description: string;
};

export type Summary = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
};
