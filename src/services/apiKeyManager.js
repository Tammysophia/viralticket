/**
 * Gerenciador de Chaves API com Rotatividade Automática
 * 
 * Funcionalidades:
 * - Monitoramento de uso em tempo real
 * - Rotação automática ao atingir 70-80% do limite
 * - Pool de múltiplas chaves
 * - Reset diário automático
 */

import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Limite diário padrão da YouTube Data API v3
const YOUTUBE_DAILY_LIMIT = 10000;
const ROTATION_THRESHOLD = 0.75; // 75% de uso

/**
 * Estrutura de dados de uma chave:
 * {
 *   id: string,
 *   name: string,
 *   key: string (criptografada),
 *   type: 'youtube' | 'openai',
 *   status: 'active' | 'inactive',
 *   requestCount: number,
 *   dailyLimit: number,
 *   quota: number (0-100),
 *   lastUsed: ISO string,
 *   lastReset: ISO string,
 *   priority: number,
 *   encrypted: boolean
 * }
 */

/**
 * Busca a próxima chave disponível do pool
 * Prioriza chaves com menor uso
 */
export const getNextAvailableKey = async (type = 'youtube') => {
  try {
    // Buscar do localStorage (onde admin salvou)
    const saved = localStorage.getItem('viralticket_api_keys');
    if (!saved) {
      console.error('VT: Nenhuma chave API configurada');
      return null;
    }

    const allKeys = JSON.parse(saved);
    
    // Filtrar chaves do tipo especificado e ativas
    const keys = allKeys.filter(k => k.type === type && k.status === 'active');
    
    if (keys.length === 0) {
      console.error(`VT: Nenhuma chave ${type} ativa encontrada`);
      return null;
    }

    // Verificar e resetar chaves se necessário
    const now = new Date();
    keys.forEach(key => {
      const lastReset = key.lastReset ? new Date(key.lastReset) : new Date(0);
      const hoursSinceReset = (now - lastReset) / (1000 * 60 * 60);
      
      // Reset após 24h
      if (hoursSinceReset >= 24) {
        key.requestCount = 0;
        key.quota = 0;
        key.lastReset = now.toISOString();
      }
    });

    // Ordenar por menor uso (quota)
    keys.sort((a, b) => (a.quota || 0) - (b.quota || 0));

    // Pegar primeira chave com uso < 75%
    const availableKey = keys.find(k => (k.quota || 0) < (ROTATION_THRESHOLD * 100));
    
    if (!availableKey) {
      console.warn('VT: Todas as chaves acima de 75%, usando a de menor uso');
      return keys[0];
    }

    console.log(`VT: Chave selecionada: ${availableKey.name} (${availableKey.quota || 0}% de uso)`);
    return availableKey;
  } catch (error) {
    console.error('VT: Erro ao buscar chave disponível:', error);
    return null;
  }
};

/**
 * Incrementa o contador de uso de uma chave
 * Atualiza quota e verifica se precisa rotacionar
 */
export const incrementKeyUsage = async (keyId, cost = 1) => {
  try {
    const saved = localStorage.getItem('viralticket_api_keys');
    if (!saved) return;

    const allKeys = JSON.parse(saved);
    const keyIndex = allKeys.findIndex(k => k.id === keyId);
    
    if (keyIndex === -1) {
      console.error('VT: Chave não encontrada:', keyId);
      return;
    }

    const key = allKeys[keyIndex];
    
    // Incrementar contador
    key.requestCount = (key.requestCount || 0) + cost;
    key.lastUsed = new Date().toISOString();
    
    // Calcular quota (percentual de uso)
    const dailyLimit = key.dailyLimit || YOUTUBE_DAILY_LIMIT;
    key.quota = Math.min(100, Math.round((key.requestCount / dailyLimit) * 100));
    
    // Atualizar no localStorage
    allKeys[keyIndex] = key;
    localStorage.setItem('viralticket_api_keys', JSON.stringify(allKeys));
    
    // Tentar atualizar no Firestore (se disponível)
    if (db) {
      try {
        const keyDocRef = doc(db, 'apiKeys', keyId);
        await updateDoc(keyDocRef, {
          requestCount: key.requestCount,
          quota: key.quota,
          lastUsed: key.lastUsed,
        });
      } catch (err) {
        console.warn('VT: Erro ao atualizar no Firestore:', err);
      }
    }

    // Log de monitoramento
    console.log(`VT: Chave ${key.name} - ${key.quota}% usado (${key.requestCount}/${dailyLimit})`);
    
    // Alerta se atingiu threshold
    if (key.quota >= (ROTATION_THRESHOLD * 100)) {
      console.warn(`VT: ⚠️ Chave ${key.name} atingiu ${key.quota}% - Próxima requisição usará outra chave`);
    }
    
    return key;
  } catch (error) {
    console.error('VT: Erro ao incrementar uso da chave:', error);
  }
};

/**
 * Reseta o contador de todas as chaves
 * Deve ser chamado diariamente (Cloud Function)
 */
export const resetAllKeys = async () => {
  try {
    const saved = localStorage.getItem('viralticket_api_keys');
    if (!saved) return;

    const allKeys = JSON.parse(saved);
    const now = new Date().toISOString();
    
    allKeys.forEach(key => {
      key.requestCount = 0;
      key.quota = 0;
      key.lastReset = now;
    });

    localStorage.setItem('viralticket_api_keys', JSON.stringify(allKeys));
    
    // Atualizar no Firestore
    if (db) {
      for (const key of allKeys) {
        try {
          const keyDocRef = doc(db, 'apiKeys', key.id);
          await updateDoc(keyDocRef, {
            requestCount: 0,
            quota: 0,
            lastReset: now,
          });
        } catch (err) {
          console.warn(`VT: Erro ao resetar chave ${key.id} no Firestore:`, err);
        }
      }
    }

    console.log('VT: ✅ Todas as chaves foram resetadas');
    return allKeys;
  } catch (error) {
    console.error('VT: Erro ao resetar chaves:', error);
  }
};

/**
 * Obtém estatísticas de uso das chaves
 */
export const getKeyStats = () => {
  try {
    const saved = localStorage.getItem('viralticket_api_keys');
    if (!saved) return null;

    const allKeys = JSON.parse(saved);
    const youtubeKeys = allKeys.filter(k => k.type === 'youtube' && k.status === 'active');
    
    if (youtubeKeys.length === 0) return null;

    const totalRequests = youtubeKeys.reduce((sum, k) => sum + (k.requestCount || 0), 0);
    const avgQuota = youtubeKeys.reduce((sum, k) => sum + (k.quota || 0), 0) / youtubeKeys.length;
    const maxQuota = Math.max(...youtubeKeys.map(k => k.quota || 0));
    const keysAboveThreshold = youtubeKeys.filter(k => (k.quota || 0) >= (ROTATION_THRESHOLD * 100)).length;

    return {
      totalKeys: youtubeKeys.length,
      activeKeys: youtubeKeys.filter(k => (k.quota || 0) < 100).length,
      totalRequests,
      avgQuota: Math.round(avgQuota),
      maxQuota,
      keysAboveThreshold,
      needsRotation: keysAboveThreshold === youtubeKeys.length,
    };
  } catch (error) {
    console.error('VT: Erro ao obter estatísticas:', error);
    return null;
  }
};
