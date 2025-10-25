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

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Se Firebase não estiver configurado, usar localStorage
    if (!isFirebaseConfigured || !auth) {
      console.log('📝 Using localStorage authentication mode');
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
                
                const userProfile = {
                  id: firebaseUser.uid,
                  email: firebaseUser.email,
                  name: userData.name || firebaseUser.email.split('@')[0],
                  plan: isAdmin ? 'ADMIN' : userData.plan || 'FREE',
                  isAdmin,
                  avatar: userData.avatar || `https://ui-avatars.com/api/?name=${firebaseUser.email.split('@')[0]}&background=8B5CF6&color=fff`,
                  dailyUsage: userData.dailyUsage || { offers: 0, urls: 0 },
                  limits: isAdmin ? { offers: 'unlimited', urls: 'unlimited' } : (PLANS[userData.plan || 'FREE']?.limits || { offers: 3, urls: 3 }),
                };
                
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
        // Modo simulado (fallback)
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
        return mockUser;
      }

      // Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const isAdmin = email === 'tamara14@gmail.com';
        
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
        return userProfile;
      } else {
        throw new Error('User data not found');
      }
    } catch (error) {
      setLoading(false);
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email, password) => {
    setLoading(true);
    try {
      // Se Firebase não estiver configurado, usar modo local
      if (!isFirebaseConfigured || !auth) {
        // Modo simulado (fallback)
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
      
      // Save to Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);
      
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
      return fullUserProfile;
    } catch (error) {
      setLoading(false);
      console.error('Register error:', error);
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
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
