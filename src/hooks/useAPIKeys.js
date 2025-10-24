import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export const useAPIKeys = () => {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keysLoaded, setKeysLoaded] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.isAdmin) {
      loadAPIKeys();
    } else {
      setLoading(false);
      setKeysLoaded(false);
    }
  }, [user]);

  const loadAPIKeys = async () => {
    setLoading(true);
    setKeysLoaded(false);
    
    // Simular carregamento de API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const saved = localStorage.getItem('viralticket_api_keys');
    if (saved) {
      setApiKeys(JSON.parse(saved));
    } else {
      // Mock data - apenas para admin
      const mockKeys = [
        {
          id: '1',
          name: 'YouTube Data API',
          key: 'AIza************************',
          type: 'youtube',
          status: 'active',
          quota: 85,
          lastUsed: new Date().toISOString(),
          encrypted: true,
        },
        {
          id: '2',
          name: 'OpenAI API',
          key: 'sk-••••••••••••••••••••••••',
          type: 'openai',
          status: 'active',
          quota: 60,
          lastUsed: new Date().toISOString(),
          encrypted: true,
        },
      ];
      setApiKeys(mockKeys);
      localStorage.setItem('viralticket_api_keys', JSON.stringify(mockKeys));
    }
    
    setLoading(false);
    setKeysLoaded(true);
  };

  const addAPIKey = (keyData) => {
    if (!user?.isAdmin) return;
    
    const newKey = {
      id: Date.now().toString(),
      ...keyData,
      status: 'active',
      quota: 0,
      lastUsed: new Date().toISOString(),
    };
    const updated = [...apiKeys, newKey];
    setApiKeys(updated);
    localStorage.setItem('viralticket_api_keys', JSON.stringify(updated));
  };

  const updateAPIKey = (id, updates) => {
    if (!user?.isAdmin) return;
    
    const updated = apiKeys.map(key => 
      key.id === id ? { ...key, ...updates } : key
    );
    setApiKeys(updated);
    localStorage.setItem('viralticket_api_keys', JSON.stringify(updated));
  };

  const deleteAPIKey = (id) => {
    if (!user?.isAdmin) return;
    
    const updated = apiKeys.filter(key => key.id !== id);
    setApiKeys(updated);
    localStorage.setItem('viralticket_api_keys', JSON.stringify(updated));
  };

  const rotateAPIKey = (id) => {
    if (!user?.isAdmin) return;
    
    // Estrutura para rotação automática de chaves
    updateAPIKey(id, {
      lastRotated: new Date().toISOString(),
      quota: 0,
    });
  };

  const encryptAPIKey = (id) => {
    if (!user?.isAdmin) return;
    
    updateAPIKey(id, {
      encrypted: true,
    });
  };

  return {
    apiKeys,
    loading,
    keysLoaded,
    addAPIKey,
    updateAPIKey,
    deleteAPIKey,
    rotateAPIKey,
    encryptAPIKey,
    reload: loadAPIKeys,
  };
};
