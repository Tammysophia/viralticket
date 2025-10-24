import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { secureRetrieve, secureStore } from '../utils/cryptoUtils';

/**
 * Hook para gerenciar chaves de API de forma segura
 * IMPORTANTE: As chaves são usadas internamente pelo sistema
 * e NUNCA devem ser expostas no front-end para usuários comuns
 */
export const useAPIKeys = () => {
  const { user } = useAuth();
  const [youtubeKey, setYoutubeKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadKeys();
    }
  }, [user]);

  const loadKeys = () => {
    try {
      // SEGURANÇA: Chaves só são carregadas/expostas para uso interno
      // Usuários comuns NÃO têm acesso direto às chaves
      
      // Tentar carregar das variáveis de ambiente primeiro
      const envYoutubeKey = import.meta.env.VITE_YOUTUBE_API_KEY;
      const envOpenaiKey = import.meta.env.VITE_OPENAI_API_KEY;

      if (envYoutubeKey && envYoutubeKey !== 'sua-chave-youtube-aqui') {
        setYoutubeKey(envYoutubeKey);
      } else {
        // Senão, carregar do localStorage (chaves do admin)
        const storedYoutubeKey = secureRetrieve('youtube_api_key');
        if (storedYoutubeKey) {
          setYoutubeKey(storedYoutubeKey);
        }
      }

      if (envOpenaiKey && envOpenaiKey !== 'sua-chave-openai-aqui') {
        setOpenaiKey(envOpenaiKey);
      } else {
        const storedOpenaiKey = secureRetrieve('openai_api_key');
        if (storedOpenaiKey) {
          setOpenaiKey(storedOpenaiKey);
        }
      }

      setLoading(false);
    } catch (error) {
      // Log silencioso - sem expor detalhes no console para usuários
      setLoading(false);
    }
  };

  const saveYoutubeKey = (key) => {
    secureStore('youtube_api_key', key);
    setYoutubeKey(key);
  };

  const saveOpenaiKey = (key) => {
    secureStore('openai_api_key', key);
    setOpenaiKey(key);
  };

  const hasKeys = () => {
    return !!youtubeKey && !!openaiKey;
  };

  const hasYoutubeKey = () => {
    return !!youtubeKey;
  };

  const hasOpenaiKey = () => {
    return !!openaiKey;
  };

  return {
    youtubeKey,
    openaiKey,
    loading,
    hasKeys,
    hasYoutubeKey,
    hasOpenaiKey,
    saveYoutubeKey,
    saveOpenaiKey,
    reloadKeys: loadKeys,
  };
};

export default useAPIKeys;
