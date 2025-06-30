// src/firebase/firebaseConfig.js

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; // Importe getAuth para a autenticação
import { getFirestore } from 'firebase/firestore'; // Importe getFirestore para o Banco de Dados Firestore

// Sua configuração do Firebase usando as variáveis de ambiente
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID // Se você tiver o Google Analytics habilitado
};

// Inicialize o Firebase
const app = initializeApp(firebaseConfig);

// Inicialize os serviços que você vai usar
const auth = getAuth(app); // Serviço de autenticação
const db = getFirestore(app); // Serviço de Banco de dados Firestore

// Exporte os serviços para usá-los em outros arquivos
export { app, auth, db };