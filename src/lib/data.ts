import { type Transaction } from '@/types';
import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  where,
  Timestamp
} from 'firebase/firestore';
import { auth } from './firebase';

// NOTE: For a real multi-user app, you must secure these Firestore operations.
// These functions currently operate on a single global 'transactions' collection.
// You should add security rules in your Firebase console to ensure
// users can only access their own data. This typically involves adding a `userId`
// field to each transaction and modifying the queries below to filter by the
// authenticated user's ID.

const transactionsCollection = collection(db, 'transactions');

export async function getTransactions(options?: { from?: string; to?: string }): Promise<Transaction[]> {
  // In a real multi-user app, you'd add another where('userId', '==', auth.currentUser.uid) clause.
  // This requires passing the user context or using Firebase Admin SDK for verification.
  const queryConstraints = [orderBy('date', 'desc')];
  
  if (options?.from) {
    queryConstraints.push(where('date', '>=', options.from));
  }
  if (options?.to) {
    // To make the 'to' date inclusive, we get the next day and use '<'
    const toDate = new Date(options.to);
    toDate.setDate(toDate.getDate() + 1);
    queryConstraints.push(where('date', '<', toDate.toISOString().split('T')[0]));
  }

  const q = query(transactionsCollection, ...queryConstraints);
  const querySnapshot = await getDocs(q);
  
  const transactions: Transaction[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    transactions.push({
      id: doc.id,
      date: data.date,
      type: data.type,
      category: data.category,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      description: data.description,
    });
  });

  return transactions;
}

export async function addTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
  // In a real multi-user app, you would add a `userId` field here.
  // const user = auth.currentUser;
  // if (!user) throw new Error("User not authenticated");
  // const dataWithUser = { ...transaction, userId: user.uid };
  const docRef = await addDoc(transactionsCollection, transaction);
  
  return {
    ...transaction,
    id: docRef.id,
  };
}

export async function deleteTransaction(id: string): Promise<{ success: boolean }> {
  try {
    const docRef = doc(db, 'transactions', id);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return { success: false };
  }
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
