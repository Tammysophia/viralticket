import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('viralticket_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    // Simulação de login - substituir por Firebase Auth
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser = {
          id: '1',
          email,
          name: email.split('@')[0],
          plan: 'FREE',
          avatar: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=8B5CF6&color=fff`,
          dailyUsage: {
            offers: 1,
            urls: 2,
          },
          limits: {
            offers: 3,
            urls: 3,
          },
        };
        setUser(mockUser);
        localStorage.setItem('viralticket_user', JSON.stringify(mockUser));
        setLoading(false);
        resolve(mockUser);
      }, 1500);
    });
  };

  const register = async (email, password) => {
    setLoading(true);
    // Simulação de registro - substituir por Firebase Auth
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser = {
          id: Date.now().toString(),
          email,
          name: email.split('@')[0],
          plan: 'FREE',
          avatar: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=8B5CF6&color=fff`,
          dailyUsage: {
            offers: 0,
            urls: 0,
          },
          limits: {
            offers: 3,
            urls: 3,
          },
        };
        setUser(mockUser);
        localStorage.setItem('viralticket_user', JSON.stringify(mockUser));
        setLoading(false);
        resolve(mockUser);
      }, 1500);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('viralticket_user');
  };

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('viralticket_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
