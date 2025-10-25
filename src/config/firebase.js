// Firebase Configuration and Initialization
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration from environment variables
// Com valores padrão para evitar quebra da aplicação
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBF5RAJ3C7Yy6dH_sWBXDo8cYd51c2QnVA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "studio-6502227051-763bf.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "studio-6502227051-763bf",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "studio-6502227051-763bf.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "151268195367",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:151268195367:web:be03df757470d10c64e202",
};

// Check if Firebase is properly configured
export const isFirebaseConfigured = firebaseConfig.apiKey && firebaseConfig.projectId;

let app = null;
let auth = null;
let db = null;

// Initialize Firebase with error handling
try {
  if (isFirebaseConfigured) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('✅ Firebase initialized successfully');
  } else {
    console.warn('⚠️ Firebase not configured, using fallback mode');
  }
} catch (error) {
  console.error('❌ Error initializing Firebase:', error);
  console.log('📝 Using fallback authentication mode');
}

// Export with null checks
export { auth, db };
export default app;
