/**
 * Serviço real de integração com YouTube Data API v3
 */

import { decrypt } from '../utils/cryptoUtils';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

/**
 * Extrai o ID do vídeo de uma URL do YouTube
 * @param {string} url - URL do YouTube
 * @returns {string|null} - ID do vídeo ou null
 */
export const extractVideoId = (url) => {
  if (!url) return null;
  
  // Padrões de URL do YouTube
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

/**
 * Busca comentários reais de um vídeo do YouTube
 * @param {string} videoId - ID do vídeo
 * @param {string} apiKey - Chave da API (pode estar criptografada)
 * @param {number} maxResults - Número máximo de resultados (padrão: 50)
 * @returns {Promise<Array>} - Array de comentários
 */
export const fetchYouTubeComments = async (videoId, apiKey, maxResults = 50) => {
  try {
    // Tentar descriptografar a chave (se estiver criptografada)
    let decryptedKey = apiKey;
    try {
      if (apiKey.includes('=')) {
        // Parece ser base64/criptografado
        decryptedKey = decrypt(apiKey);
      }
    } catch (e) {
      // Se falhar, usa a chave como está
      decryptedKey = apiKey;
    }
    
    // Construir URL da API
    const url = `${YOUTUBE_API_BASE}/commentThreads?` + new URLSearchParams({
      part: 'snippet',
      videoId: videoId,
      maxResults: maxResults.toString(),
      order: 'relevance',
      textFormat: 'plainText',
      key: decryptedKey,
    });
    
    console.log('🔍 Buscando comentários do YouTube...', videoId);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Erro ao buscar comentários');
    }
    
    const data = await response.json();
    
    // Processar comentários
    const comments = data.items?.map((item) => {
      const snippet = item.snippet.topLevelComment.snippet;
      return {
        id: item.id,
        author: snippet.authorDisplayName,
        authorAvatar: snippet.authorProfileImageUrl,
        text: snippet.textDisplay,
        likeCount: snippet.likeCount,
        publishedAt: snippet.publishedAt,
        updatedAt: snippet.updatedAt,
      };
    }) || [];
    
    console.log('✅ Comentários extraídos:', comments.length);
    
    return comments;
    
  } catch (error) {
    console.error('❌ Erro ao buscar comentários:', error);
    throw error;
  }
};

/**
 * Busca informações do vídeo
 * @param {string} videoId - ID do vídeo
 * @param {string} apiKey - Chave da API
 * @returns {Promise<Object>} - Informações do vídeo
 */
export const fetchVideoInfo = async (videoId, apiKey) => {
  try {
    let decryptedKey = apiKey;
    try {
      if (apiKey.includes('=')) {
        decryptedKey = decrypt(apiKey);
      }
    } catch (e) {
      decryptedKey = apiKey;
    }
    
    const url = `${YOUTUBE_API_BASE}/videos?` + new URLSearchParams({
      part: 'snippet,statistics',
      id: videoId,
      key: decryptedKey,
    });
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Erro ao buscar informações do vídeo');
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      throw new Error('Vídeo não encontrado');
    }
    
    const video = data.items[0];
    
    return {
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnail: video.snippet.thumbnails.high.url,
      channelTitle: video.snippet.channelTitle,
      publishedAt: video.snippet.publishedAt,
      viewCount: video.statistics.viewCount,
      likeCount: video.statistics.likeCount,
      commentCount: video.statistics.commentCount,
    };
    
  } catch (error) {
    console.error('❌ Erro ao buscar info do vídeo:', error);
    throw error;
  }
};

/**
 * Valida se a chave da API do YouTube está funcionando
 * @param {string} apiKey - Chave da API
 * @returns {Promise<boolean>} - True se válida
 */
export const validateYouTubeKey = async (apiKey) => {
  try {
    let decryptedKey = apiKey;
    try {
      if (apiKey.includes('=')) {
        decryptedKey = decrypt(apiKey);
      }
    } catch (e) {
      decryptedKey = apiKey;
    }
    
    // Testar com um vídeo popular
    const testVideoId = 'dQw4w9WgXcQ'; // Never Gonna Give You Up
    
    const url = `${YOUTUBE_API_BASE}/videos?` + new URLSearchParams({
      part: 'snippet',
      id: testVideoId,
      key: decryptedKey,
    });
    
    const response = await fetch(url);
    return response.ok;
    
  } catch (error) {
    return false;
  }
};

export default {
  extractVideoId,
  fetchYouTubeComments,
  fetchVideoInfo,
  validateYouTubeKey,
};
