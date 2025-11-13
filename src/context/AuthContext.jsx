import { createContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../config/firebase';
import { PLANS } from '../utils/plans';
import toast from 'react-hot-toast';
import { checkAndResetUsage } from '../services/dailyResetService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Se Firebase não estiver configurado, usar localStorage
    if (!isFirebaseConfigured || !auth) {
      const savedUser = localStorage.getItem('viralticket_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error('Error parsing saved user:', error);
        }
      }
      setLoading(false);
      return;
    }

    // Listen to Firebase auth state changes
    try {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          // User is signed in, get additional data from Firestore
          try {
            if (db) {
              const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
              
              if (userDoc.exists()) {
                const userData = userDoc.data();
                const isAdmin = firebaseUser.email === 'tamara14@gmail.com';
                
                const planData = PLANS[userData.plan || 'FREE'];
                
                let userProfile = {
                  id: firebaseUser.uid,
                  email: firebaseUser.email,
                  name: userData.name || firebaseUser.email.split('@')[0],
                  plan: isAdmin ? 'ADMIN' : userData.plan || 'PRATA',
                  isAdmin,
                  avatar: userData.avatar || `https://ui-avatars.com/api/?name=${firebaseUser.email.split('@')[0]}&background=8B5CF6&color=fff`,
                  dailyUsage: userData.dailyUsage || { offers: 0, urls: 0 },
                  monthlyUsage: userData.monthlyUsage || { offers: 0, urls: 0, month: new Date().getMonth() },
                  lastResetDate: userData.lastResetDate || null,
                  limits: isAdmin ? { 
                    offers: 'unlimited', 
                    urls: 'unlimited',
                    offersMonthly: 'unlimited',
                    urlsMonthly: 'unlimited'
                  } : {
                    offers: planData?.offers || 3,
                    urls: planData?.urls || 'unlimited',
                    offersMonthly: planData?.offersMonthly || 90,
                    urlsMonthly: planData?.urlsMonthly || 'unlimited',
                  },
                };
                
                // ✅ VT: Verificar e resetar uso diário/mensal automaticamente
                userProfile = await checkAndResetUsage(userProfile);
                
                setUser(userProfile);
                localStorage.setItem('viralticket_user', JSON.stringify(userProfile));
              }
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
        } else {
          // User is signed out
          setUser(null);
          localStorage.removeItem('viralticket_user');
        }
        setLoading(false);
      });

      // Cleanup subscription
      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up auth listener:', error);
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      // Se Firebase não estiver configurado, usar modo local
      if (!isFirebaseConfigured || !auth) {
        await new Promise(resolve => setTimeout(resolve, 800));
        const isAdmin = email === 'tamara14@gmail.com';
        const mockUser = {
          id: Date.now().toString(),
          email,
          name: email.split('@')[0],
          plan: isAdmin ? 'ADMIN' : 'FREE',
          isAdmin,
          avatar: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=8B5CF6&color=fff`,
          dailyUsage: { offers: 0, urls: 0 },
          limits: isAdmin ? { offers: 'unlimited', urls: 'unlimited' } : { offers: 3, urls: 3 },
        };
        
        setUser(mockUser);
        localStorage.setItem('viralticket_user', JSON.stringify(mockUser));
        setLoading(false);
        toast.success('Login efetuado com sucesso!', { icon: '🎉' });
        return mockUser;
      }

      // Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const isAdmin = email === 'tamara14@gmail.com';
      
      let userData = {
        name: email.split('@')[0],
        email: firebaseUser.email,
        plan: isAdmin ? 'ADMIN' : 'FREE',
        avatar: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=8B5CF6&color=fff`,
        dailyUsage: { offers: 0, urls: 0 },
        createdAt: new Date().toISOString(),
      };
      
      // Tentar buscar/salvar no Firestore (se falhar, continua com dados padrão)
      try {
        if (db) {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            userData = { ...userData, ...userDoc.data() };
          } else {
            // Tentar salvar, mas não falhar se der erro de permissão
            try {
              await setDoc(userDocRef, userData);
            } catch (saveError) {
              console.warn('Firestore permission warning (ignored):', saveError.code);
            }
          }
        }
      } catch (firestoreError) {
        console.warn('Firestore access warning (ignored):', firestoreError.code);
      }
      
      const userProfile = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        name: userData.name || email.split('@')[0],
        plan: isAdmin ? 'ADMIN' : userData.plan || 'FREE',
        isAdmin,
        avatar: userData.avatar || `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=8B5CF6&color=fff`,
        dailyUsage: userData.dailyUsage || { offers: 0, urls: 0 },
        limits: isAdmin ? { offers: 'unlimited', urls: 'unlimited' } : (PLANS[userData.plan || 'FREE']?.limits || { offers: 3, urls: 3 }),
      };
      
      setUser(userProfile);
      localStorage.setItem('viralticket_user', JSON.stringify(userProfile));
      setLoading(false);
      toast.success('Login efetuado com sucesso!', { icon: '🎉' });
      return userProfile;
    } catch (error) {
      setLoading(false);
      
      // Tratamento específico de erros Firebase
      if (error.code === 'auth/user-not-found') {
        toast.error('❌ Usuário não encontrado. Crie uma conta primeiro!');
      } else if (error.code === 'auth/wrong-password') {
        toast.error('🔐 Senha incorreta. Tente novamente.');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('📧 E-mail inválido. Verifique o formato.');
      } else if (error.code === 'auth/invalid-credential') {
        toast.error('❌ E-mail ou senha incorretos.');
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('⚠️ Muitas tentativas. Aguarde alguns minutos.');
      } else if (error.code === 'auth/network-request-failed') {
        toast.error('📡 Sem conexão com a internet.');
      } else {
        toast.error('⚠️ Erro ao processar o login. Tente novamente.');
      }
      
      throw error;
    }
  };

  const register = async (email, password) => {
    setLoading(true);
    try {
      // Se Firebase não estiver configurado, usar modo local
      if (!isFirebaseConfigured || !auth) {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const isAdmin = email === 'tamara14@gmail.com';
        const mockUser = {
          id: Date.now().toString(),
          email,
          name: email.split('@')[0],
          plan: isAdmin ? 'ADMIN' : 'FREE',
          isAdmin,
          avatar: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=8B5CF6&color=fff`,
          dailyUsage: { offers: 0, urls: 0 },
          limits: isAdmin ? { offers: 'unlimited', urls: 'unlimited' } : { offers: 3, urls: 3 },
        };
        
        setUser(mockUser);
        localStorage.setItem('viralticket_user', JSON.stringify(mockUser));
        setLoading(false);
        toast.success('Cadastro realizado com sucesso!', { icon: '✅' });
        return mockUser;
      }

      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const isAdmin = email === 'tamara14@gmail.com';
      
      // Create user profile in Firestore
      const userProfile = {
        name: email.split('@')[0],
        email: firebaseUser.email,
        plan: isAdmin ? 'ADMIN' : 'FREE',
        avatar: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=8B5CF6&color=fff`,
        dailyUsage: { offers: 0, urls: 0 },
        createdAt: new Date().toISOString(),
      };
      
      // Tentar salvar no Firestore (se falhar, continua mesmo assim)
      try {
        if (db) {
          await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);
        }
      } catch (firestoreError) {
        console.warn('Firestore permission warning (ignored):', firestoreError.code);
      }
      
      // Set local user state
      const fullUserProfile = {
        id: firebaseUser.uid,
        ...userProfile,
        isAdmin,
        limits: isAdmin ? { offers: 'unlimited', urls: 'unlimited' } : { offers: 3, urls: 3 },
      };
      
      setUser(fullUserProfile);
      localStorage.setItem('viralticket_user', JSON.stringify(fullUserProfile));
      setLoading(false);
      toast.success('Cadastro realizado com sucesso!', { icon: '✅' });
      return fullUserProfile;
    } catch (error) {
      setLoading(false);
      
      // Tratamento específico de erros Firebase
      if (error.code === 'auth/email-already-in-use') {
        toast.error('❌ Este e-mail já está em uso. Faça login!');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('📧 E-mail inválido. Verifique o formato.');
      } else if (error.code === 'auth/weak-password') {
        toast.error('🔐 Senha muito fraca. Use pelo menos 6 caracteres.');
      } else if (error.code === 'auth/operation-not-allowed') {
        toast.error('⚠️ Cadastro desabilitado. Contate o suporte.');
      } else if (error.code === 'auth/network-request-failed') {
        toast.error('📡 Sem conexão com a internet.');
      } else {
        toast.error('⚠️ Erro ao cadastrar. Tente novamente.');
      }
      
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (isFirebaseConfigured && auth) {
        await firebaseSignOut(auth);
      }
      setUser(null);
      localStorage.removeItem('viralticket_user');
    } catch (error) {
      console.error('Logout error:', error);
      // Sempre limpar localmente mesmo se Firebase falhar
      setUser(null);
      localStorage.removeItem('viralticket_user');
    }
  };

  const updateUser = async (updates) => {
    try {
      const updatedUser = { ...user, ...updates };
      
      // Update Firestore if user is authenticated and Firebase is configured
      if (isFirebaseConfigured && db && user?.id) {
        try {
          await setDoc(doc(db, 'users', user.id), {
            ...updatedUser,
            updatedAt: new Date().toISOString(),
          }, { merge: true });
        } catch (error) {
          console.warn('Error updating Firestore, using local only:', error);
        }
      }
      
      setUser(updatedUser);
      localStorage.setItem('viralticket_user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Update user error:', error);
      // Continuar mesmo se houver erro
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('viralticket_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
