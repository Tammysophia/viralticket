import { createContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase/supabaseClient';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const showSuccess = (message) => toast.success(message, { icon: null });
  const showError = (message) => toast.error(message, { icon: null });

  useEffect(() => {
    // Verificar sessão atual do Supabase
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await fetchUserProfile(session.user.id, session.user.email);
        } else {
          setUser(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        setLoading(false);
      }
    };

    checkSession();

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        await fetchUserProfile(session.user.id, session.user.email);
      } else {
        setUser(null);
        localStorage.removeItem('viralticket_user');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId, email) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      const isAdmin = email === 'tamara14@gmail.com';
      
      const userProfile = {
        id: userId,
        email: email,
        name: profile?.name || email.split('@')[0],
        plan: isAdmin ? 'ADMIN' : profile?.plan || 'PRATA',
        isAdmin,
        avatar: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=8B5CF6&color=fff`,
        dailyUsage: { 
          offers: profile?.daily_offers_count || 0 
        },
        limits: isAdmin ? { offers: 'unlimited' } : { offers: 3 },
      };

      setUser(userProfile);
      localStorage.setItem('viralticket_user', JSON.stringify(userProfile));
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
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

      showSuccess('🎉 Login efetuado com sucesso!');
      return data.user;
    } catch (error) {
      setLoading(false);
      showError(error.message || 'Erro ao processar o login.');
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
    }
  };

  const updateUser = async (updates) => {
    try {
      const updatedUser = { ...user, ...updates };
      
      if (user?.id) {
        const { error } = await supabase
          .from('profiles')
          .update({
            name: updates.name,
            plan: updates.plan,
            daily_offers_count: updates.dailyUsage?.offers,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);
          
        if (error) console.warn('Erro ao atualizar perfil no Supabase:', error);
      }
      
      setUser(updatedUser);
      localStorage.setItem('viralticket_user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Update user error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
