import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Configuração do Firebase fornecida
const firebaseConfig = {
  apiKey: "AIzaSyBF5RAJ3C7Yy6dH_sWBXDo8cYd51c2QnVA",
  authDomain: "studio-6502227051-763bf.firebaseapp.com",
  projectId: "studio-6502227051-763bf",
  storageBucket: "studio-6502227051-763bf.firebasestorage.app",
  messagingSenderId: "151268195367",
  appId: "1:151268195367:web:be03df757470d10c64e202"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar serviços
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
