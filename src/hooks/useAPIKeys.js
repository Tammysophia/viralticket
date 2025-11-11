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
      console.log('🔍 VT: Chaves disponíveis:', allKeys.map(k => ({ 
        type: k.type, 
        status: k.status, 
        hasKey: !!k.key,
        keyLength: k.key?.length,
        encrypted: k.encrypted,
        isEncrypted: k.key ? isEncrypted(k.key) : false
      })));
      
      const key = allKeys.find(k => k.type === service && k.status === 'active');
      
      if (key && key.key) {
        console.log(`🔍 VT: Chave ${service} encontrada!`);
        console.log(`🔍 VT: Chave bruta comprimento:`, key.key.length);
        console.log(`🔍 VT: É criptografada?:`, isEncrypted(key.key));
        console.log(`🔍 VT: Primeiros 10 chars:`, key.key.substring(0, 10));
        
        // Descriptografar se necessário
        let actualKey = key.key;
        
        try {
          if (isEncrypted(key.key)) {
            console.log(`🔓 VT: Tentando descriptografar...`);
            actualKey = decrypt(key.key);
            console.log(`✅ VT: Descriptografada! Comprimento:`, actualKey.length);
          } else {
            console.log(`📝 VT: Chave não criptografada, usando diretamente`);
          }
        } catch (decryptError) {
          console.error(`❌ VT: Erro ao descriptografar:`, decryptError);
          // Se falhar, usar a chave diretamente (pode estar em plain text)
          actualKey = key.key;
        }
        
        console.log(`✅ VT: Chave ${service} pronta!`);
        console.log(`🔑 VT: Começa com:`, actualKey.substring(0, 10) + '...');
        console.log(`🔑 VT: Termina com:`, '...' + actualKey.substring(actualKey.length - 4));
        return actualKey;
      } else {
        console.warn(`⚠️ VT: Chave ${service} não encontrada ou inativa no localStorage`);
        console.warn(`⚠️ VT: Key object:`, key);
      }
    } else {
      console.warn(`⚠️ VT: localStorage vazio!`);
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

  const encryptAPIKey = (id, encryptedValue) => {
    if (!user?.isAdmin) return;

    const updates = {
      encrypted: true,
    };

    if (encryptedValue) {
      updates.key = encryptedValue;
    }

    updateAPIKey(id, updates);
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
