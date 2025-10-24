import { useState, useEffect } from 'react';

export const useAPIKeys = () => {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAPIKeys();
  }, []);

  const loadAPIKeys = () => {
    setLoading(true);
    const saved = localStorage.getItem('viralticket_api_keys');
    if (saved) {
      setApiKeys(JSON.parse(saved));
    } else {
      // Mock data
      const mockKeys = [
        {
          id: '1',
          name: 'YouTube Data API',
          key: 'AIza************************',
          type: 'youtube',
          status: 'active',
          quota: 85,
          lastUsed: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'OpenAI API',
          key: 'sk-••••••••••••••••••••••••',
          type: 'openai',
          status: 'active',
          quota: 60,
          lastUsed: new Date().toISOString(),
        },
      ];
      setApiKeys(mockKeys);
      localStorage.setItem('viralticket_api_keys', JSON.stringify(mockKeys));
    }
    setLoading(false);
  };

  const addAPIKey = (keyData) => {
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
    const updated = apiKeys.map(key => 
      key.id === id ? { ...key, ...updates } : key
    );
    setApiKeys(updated);
    localStorage.setItem('viralticket_api_keys', JSON.stringify(updated));
  };

  const deleteAPIKey = (id) => {
    const updated = apiKeys.filter(key => key.id !== id);
    setApiKeys(updated);
    localStorage.setItem('viralticket_api_keys', JSON.stringify(updated));
  };

  const rotateAPIKey = (id) => {
    // Estrutura para rotação automática de chaves
    updateAPIKey(id, {
      lastRotated: new Date().toISOString(),
      quota: 0,
    });
  };

  return {
    apiKeys,
    loading,
    addAPIKey,
    updateAPIKey,
    deleteAPIKey,
    rotateAPIKey,
    reload: loadAPIKeys,
  };
};
