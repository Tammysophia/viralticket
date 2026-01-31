import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase/supabaseClient';
import toast from 'react-hot-toast';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetchProfile(session.user.id, session.user.email);
      }
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        await fetchProfile(session.user.id, session.user.email);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (id, email) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code === 'PGRST116') {
        const newProfile = {
          id,
          email,
          name: email.split('@')[0],
          plan: 'PRATA',
          daily_offers_count: 0
        };
        await supabase.from('profiles').insert([newProfile]);
        setUser(newProfile);
      } else if (data) {
        setUser(data);
      }
    } catch (err) {
      console.error('Erro ao buscar perfil:', err);
    }
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error('Erro no login: ' + error.message);
      throw error;
    }
    toast.success('Bem-vindo de volta!');
    return data;
  };

  const register = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      toast.error('Erro no cadastro: ' + error.message);
      throw error;
    }
    toast.success('Cadastro realizado!');
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast.success('Até logo!');
  };

  const updateUser = async (updates) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);
    if (!error) setUser({ ...user, ...updates });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
