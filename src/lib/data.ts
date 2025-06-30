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
  getDoc
} from 'firebase/firestore';
import { auth } from './firebase';

const transactionsCollection = collection(db, 'transactions');

export async function getTransactions(options?: { from?: string; to?: string }): Promise<Transaction[]> {
  const user = auth.currentUser;
  if (!user) {
    console.warn("Nenhum usuário autenticado encontrado. Retornando lista de transações vazia.");
    return [];
  }

  const queryConstraints = [
    where('userId', '==', user.uid),
    orderBy('date', 'desc')
  ];
  
  if (options?.from) {
    queryConstraints.push(where('date', '>=', options.from));
  }
  if (options?.to) {
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
      userId: data.userId,
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

export async function addTransaction(transaction: Omit<Transaction, 'id' | 'userId'>): Promise<Transaction> {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuário não autenticado. Impossível adicionar transação.");

  const dataWithUser = { ...transaction, userId: user.uid };
  const docRef = await addDoc(transactionsCollection, dataWithUser);
  
  return {
    ...dataWithUser,
    id: docRef.id,
  };
}

export async function deleteTransaction(id: string): Promise<{ success: boolean; error?: string }> {
  const user = auth.currentUser;
  if (!user) {
    return { success: false, error: "Usuário não autenticado." };
  }

  try {
    const docRef = doc(db, 'transactions', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: false, error: "Transação não encontrada." };
    }

    if (docSnap.data().userId !== user.uid) {
      // Security check: user is trying to delete someone else's transaction.
      return { success: false, error: "Permissão negada." };
    }

    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir a transação:", error);
    return { success: false, error: "Falha ao excluir a transação." };
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
