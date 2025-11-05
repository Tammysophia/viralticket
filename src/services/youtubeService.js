// Serviço para integração com YouTube Data API v3
import { getServiceAPIKey } from '../hooks/useAPIKeys';

/**
 * Extrai o ID do vídeo de uma URL do YouTube
 * @param {string} url - URL do YouTube
 * @returns {string|null} - ID do vídeo ou null
 */
const extractVideoId = (url) => {
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
 * Verifica se a conexão com a API do YouTube está funcionando
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const verifyAPIConnection = async (service = 'youtube') => {
  try {
    const apiKey = await getServiceAPIKey(service);
    
    if (!apiKey) {
      return {
        success: false,
        message: 'Chave não configurada no painel administrativo',
      };
    }

    // Fazer uma requisição simples para testar a chave
    const testUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=dQw4w9WgXcQ&key=${apiKey}`;
    const response = await fetch(testUrl);
    
    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        message: error.error?.message || 'Erro ao conectar com YouTube API',
      };
    }

    return {
      success: true,
      message: 'Conexão estabelecida com sucesso',
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Erro ao verificar conexão',
    };
  }
};

/**
 * Busca comentários de um vídeo do YouTube
 * @param {string} videoUrl - URL do vídeo
 * @param {number} maxResults - Número máximo de comentários (padrão: 100)
 * @returns {Promise<Array>} - Lista de comentários
 */
export const fetchVideoComments = async (videoUrl, maxResults = 100) => {
  try {
    // Buscar chave API
    const apiKey = await getServiceAPIKey('youtube');
    
    console.log('🔑 VT: Chave YouTube obtida:', apiKey ? 'SIM' : 'NÃO');
    console.log('🔑 VT: Tipo da chave:', typeof apiKey);
    console.log('🔑 VT: Primeira parte:', apiKey?.substring(0, 5));
    
    if (!apiKey) {
      throw new Error('Chave da API do YouTube não configurada no painel administrativo');
    }
    
    // Verificar se é uma chave mockada
    if (apiKey.includes('•') || apiKey.includes('*')) {
      throw new Error('A chave da API está mockada. Configure uma chave real no painel Admin → API Keys');
    }

    // Extrair ID do vídeo
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      throw new Error('URL do YouTube inválida');
    }

    // Fazer requisição para YouTube Data API
    const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=${maxResults}&order=relevance&key=${apiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Erro ao buscar comentários');
    }

    const data = await response.json();
    
    // Formatar comentários
    const comments = data.items.map((item, index) => ({
      id: item.id,
      author: item.snippet.topLevelComment.snippet.authorDisplayName,
      text: item.snippet.topLevelComment.snippet.textDisplay,
      likes: item.snippet.topLevelComment.snippet.likeCount,
      publishedAt: item.snippet.topLevelComment.snippet.publishedAt,
    }));

    return comments;
  } catch (error) {
    console.error('Erro ao buscar comentários:', error);
    throw error;
  }
};

/**
 * Busca informações de um vídeo do YouTube
 * @param {string} videoUrl - URL do vídeo
 * @returns {Promise<Object>} - Informações do vídeo
 */
export const fetchVideoInfo = async (videoUrl) => {
  try {
    const apiKey = await getServiceAPIKey('youtube');
    
    if (!apiKey) {
      throw new Error('Chave da API do YouTube não configurada');
    }

    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      throw new Error('URL do YouTube inválida');
    }

    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${apiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Erro ao buscar informações do vídeo');
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
      channelTitle: video.snippet.channelTitle,
      publishedAt: video.snippet.publishedAt,
      viewCount: video.statistics.viewCount,
      likeCount: video.statistics.likeCount,
      commentCount: video.statistics.commentCount,
    };
  } catch (error) {
    console.error('Erro ao buscar informações do vídeo:', error);
    throw error;
  }
};

/**
 * Busca comentários de múltiplos vídeos
 * @param {Array<string>} urls - Array de URLs
 * @param {number} maxPerVideo - Máximo de comentários por vídeo
 * @returns {Promise<Array>} - Lista consolidada de comentários
 */
export const fetchMultipleVideosComments = async (urls, maxPerVideo = 50) => {
  try {
    const allComments = [];
    
    for (const url of urls) {
      try {
        const comments = await fetchVideoComments(url, maxPerVideo);
        allComments.push(...comments);
      } catch (error) {
        console.error(`Erro ao buscar comentários de ${url}:`, error);
        // Continuar com os próximos vídeos mesmo se um falhar
      }
    }

    return allComments;
  } catch (error) {
    console.error('Erro ao buscar comentários de múltiplos vídeos:', error);
    throw error;
  }
};
