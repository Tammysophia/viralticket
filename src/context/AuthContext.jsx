import { createContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { PLANS } from '../utils/plans';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const showSuccess = (message) => toast.success(message, { icon: null });
  const showError = (message) => toast.error(message, { icon: null });

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetchUserProfile(session.user);
      } else {
        const savedUser = localStorage.getItem('viralticket_user');
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch (error) {
            console.error('Error parsing saved user:', error);
          }
        }
      }
      setLoading(false);
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        await fetchUserProfile(session.user);
      } else {
        setUser(null);
        localStorage.removeItem('viralticket_user');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (supabaseUser) => {
    try {
      const isAdmin = supabaseUser.email === 'tamara14@gmail.com';
      
      let { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      // Se o usuário não existir na tabela 'users', cria ele agora
      if (error && error.code === 'PGRST116') {
        const newProfile = {
          id: supabaseUser.id,
          name: supabaseUser.email.split('@')[0],
          email: supabaseUser.email,
          plan: isAdmin ? 'ADMIN' : 'PRATA',
          daily_usage: { offers: 0, urls: 0 },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const { data: insertedData } = await supabase
          .from('users')
          .insert([newProfile])
          .select()
          .single();
        
        userData = insertedData;
      }

      const planKey = userData?.plan || (isAdmin ? 'ADMIN' : 'PRATA');
      const planData = PLANS[planKey];

      const userProfile = {
        id: supabaseUser.id,
        email: supabaseUser.email,
        name: userData?.name || supabaseUser.email.split('@')[0],
        plan: isAdmin ? 'ADMIN' : planKey,
        isAdmin,
        avatar: userData?.avatar || `https://ui-avatars.com/api/?name=${supabaseUser.email.split('@')[0]}&background=8B5CF6&color=fff`,
        dailyUsage: userData?.daily_usage || { offers: 0, urls: 0 },
        limits: isAdmin ? { 
          offers: 'unlimited', 
          urls: 'unlimited'
        } : {
          offers: planData?.offers || 3,
          urls: planData?.urls || 3,
        },
      };

      setUser(userProfile);
      localStorage.setItem('viralticket_user', JSON.stringify(userProfile));
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      // Fallback para evitar loop
      const isAdmin = supabaseUser.email === 'tamara14@gmail.com';
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email,
        name: supabaseUser.email.split('@')[0],
        plan: isAdmin ? 'ADMIN' : 'PRATA',
        isAdmin,
        dailyUsage: { offers: 0, urls: 0 },
        limits: { offers: 3, urls: 3 }
      });
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data.user;
    } catch (error) {
      setLoading(false);
      showError(`❌ ${error.message}`);
      throw error;
    }
  };

  const register = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      return data.user;
    } catch (error) {
      setLoading(false);
      showError(`❌ ${error.message}`);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      localStorage.removeItem('viralticket_user');
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      localStorage.removeItem('viralticket_user');
    }
  };

  const updateUser = async (updates) => {
    try {
      const updatedUser = { ...user, ...updates };
      
      if (user?.id) {
        await supabase
          .from('users')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);
      }
      
      setUser(updatedUser);
      localStorage.setItem('viralticket_user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Update user error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
