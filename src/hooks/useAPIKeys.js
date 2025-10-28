import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { getAllAPIKeys, getAPIKey } from '../services/firebaseService';
import { decrypt, isEncrypted } from '../utils/cryptoUtils';

/**
 * Busca todas as chaves API ativas e descriptografadas
 * Função global que pode ser importada em qualquer lugar
 */
export const getActiveAPIKeys = async () => {
  try {
    const keys = await getAllAPIKeys();
    const decryptedKeys = {};
    
    for (const [service, keyData] of Object.entries(keys)) {
      if (keyData.status === 'active' && keyData.key) {
        // Descriptografar se necessário
        const actualKey = isEncrypted(keyData.key) 
          ? decrypt(keyData.key) 
          : keyData.key;
        
        decryptedKeys[service] = {
          ...keyData,
          key: actualKey,
        };
      }
    }
    
    return decryptedKeys;
  } catch (error) {
    console.error('Erro ao buscar chaves ativas:', error);
    return {};
  }
};

/**
 * Busca uma chave API específica por serviço
 * @param {string} service - Nome do serviço (youtube, openai, firebase)
 */
export const getServiceAPIKey = async (service) => {
  try {
    // PRIMEIRO: Buscar do localStorage (onde admin salvou)
    const saved = localStorage.getItem('viralticket_api_keys');
    console.log('🔍 VT: Buscando chave para:', service);
    console.log('🔍 VT: localStorage keys:', saved ? 'existe' : 'vazio');
    
    if (saved) {
      const allKeys = JSON.parse(saved);
      console.log('🔍 VT: Total de chaves:', allKeys.length);
      console.log('🔍 VT: Chaves disponíveis:', allKeys.map(k => ({ type: k.type, status: k.status, hasKey: !!k.key })));
      
      const key = allKeys.find(k => k.type === service && k.status === 'active');
      
      if (key && key.key) {
        console.log(`🔍 VT: Chave encontrada. Criptografada:`, key.encrypted ? 'SIM' : 'NÃO');
        console.log(`🔍 VT: Chave raw:`, key.key.substring(0, 15) + '...');
        
        // Descriptografar se necessário
        const actualKey = isEncrypted(key.key) 
          ? decrypt(key.key) 
          : key.key;
        
        console.log(`✅ VT: Chave ${service} encontrada no localStorage`);
        console.log(`🔑 VT: Chave descriptografada começa com:`, actualKey ? actualKey.substring(0, 10) + '...' : 'ERRO NA DESCRIPTOGRAFIA');
        
        // Validar que a descriptografia funcionou
        if (!actualKey || actualKey.length < 10) {
          console.error('❌ VT: Erro na descriptografia da chave!');
          return null;
        }
        
        return actualKey;
      } else {
        console.warn(`⚠️ VT: Chave ${service} não encontrada ou inativa no localStorage`);
      }
    }
    
    // SEGUNDO: Tentar buscar do Firestore (fallback)
    const keyData = await getAPIKey(service);
    if (!keyData || keyData.status !== 'active') {
      console.warn(`⚠️ Chave ${service} não encontrada`);
      return null;
    }
    
    // Descriptografar se necessário
    const actualKey = isEncrypted(keyData.key) 
      ? decrypt(keyData.key) 
      : keyData.key;
    
    return actualKey;
  } catch (error) {
    console.error(`Erro ao buscar chave ${service}:`, error);
    return null;
  }
};

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
      const keys = JSON.parse(saved);
      
      // Limpar chaves mock (que começam com caracteres mascarados)
      const realKeys = keys.filter(k => {
        // Se a chave (descriptografada se necessário) não começar com caracteres válidos, é mock
        const actualKey = isEncrypted(k.key) ? decrypt(k.key) : k.key;
        
        // Verificar se é uma chave válida
        const isValidYouTube = k.type === 'youtube' && actualKey && actualKey.startsWith('AIza');
        const isValidOpenAI = k.type === 'openai' && actualKey && actualKey.startsWith('sk-');
        const isMockKey = actualKey && (actualKey.includes('*') || actualKey.includes('•'));
        
        return !isMockKey && (isValidYouTube || isValidOpenAI);
      });
      
      // Se filtrou alguma chave mock, atualizar localStorage
      if (realKeys.length !== keys.length) {
        console.log('🧹 VT: Removendo', keys.length - realKeys.length, 'chaves mock...');
        localStorage.setItem('viralticket_api_keys', JSON.stringify(realKeys));
      }
      
      setApiKeys(realKeys);
    } else {
      // Não criar mais chaves mock - deixar vazio
      console.log('📝 VT: Nenhuma chave encontrada. Adicione chaves reais no painel admin.');
      setApiKeys([]);
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
