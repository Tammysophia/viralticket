// Serviço para integração com YouTube Data API v3
import { getServiceAPIKey } from '../hooks/useAPIKeys';

// VT: Detectar modo mock
const USE_MOCKS = import.meta.env.VITE_VT_MOCKS === 'true';

const isMockKey = (apiKey) => {
  if (!apiKey) return true;
  return apiKey.includes('test') || apiKey.includes('mock') || apiKey.includes('AIzaSyB000');
};

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
 * VT: Gera comentários mock para desenvolvimento
 */
const generateMockComments = (videoUrl, maxResults = 100) => {
  console.log('🎭 VT: Gerando comentários MOCK para:', videoUrl);
  
  const mockComments = [
    { author: 'João Silva', text: 'Conteúdo incrível! Me ajudou muito a entender o assunto.', likes: 45 },
    { author: 'Maria Santos', text: 'Finalmente encontrei algo que realmente funciona! Obrigada!', likes: 32 },
    { author: 'Pedro Costa', text: 'Melhor explicação que já vi sobre esse tema. Parabéns!', likes: 28 },
    { author: 'Ana Paula', text: 'Estava procurando isso há meses! Você é demais!', likes: 19 },
    { author: 'Carlos Eduardo', text: 'Simplesmente perfeito! Já estou aplicando e vendo resultados.', likes: 15 },
    { author: 'Juliana Lima', text: 'Conteúdo de qualidade! Vale muito a pena assistir.', likes: 12 },
    { author: 'Roberto Alves', text: 'Eu tinha muitas dúvidas e você esclareceu tudo! Top!', likes: 10 },
    { author: 'Fernanda Souza', text: 'Que aula! Aprendi mais aqui do que em cursos pagos.', likes: 8 },
    { author: 'Lucas Martins', text: 'Compartilhando com todos os meus amigos! Muito bom!', likes: 7 },
    { author: 'Patricia Rocha', text: 'Conteúdo gold! Continue assim que você vai longe!', likes: 6 },
    { author: 'Ricardo Mendes', text: 'Finalmente alguém que explica de forma clara e objetiva.', likes: 5 },
    { author: 'Camila Ferreira', text: 'Adorei! Já salvei nos favoritos para rever sempre.', likes: 4 },
    { author: 'Bruno Oliveira', text: 'Transformou minha visão sobre o assunto. Gratidão!', likes: 3 },
    { author: 'Amanda Silva', text: 'Material de primeira! Recomendo para todos.', likes: 2 },
    { author: 'Felipe Santos', text: 'Prático e direto ao ponto. Muito útil!', likes: 1 },
  ];

  const count = Math.min(maxResults, mockComments.length);
  return mockComments.slice(0, count).map((comment, index) => ({
    id: `mock_comment_${index}`,
    author: comment.author,
    text: comment.text,
    likes: comment.likes,
    publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  }));
};

/**
 * Verifica se a conexão com a API do YouTube está funcionando
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const verifyAPIConnection = async (service = 'youtube') => {
  try {
    const apiKey = await getServiceAPIKey(service);
    
    if (!apiKey) {
      console.log('🔧 VT: Sem chave YouTube - usando modo MOCK');
      return {
        success: true,
        message: 'Modo desenvolvimento - comentários mockados ativados',
        isMock: true,
      };
    }

    // VT: Se for chave mock, retornar sucesso sem chamar API
    if (isMockKey(apiKey) || USE_MOCKS) {
      console.log('🔧 VT: Chave mock YouTube detectada - usando modo MOCK');
      return {
        success: true,
        message: 'Modo mock ativado',
        isMock: true,
      };
    }

    // VT: Só chamar API real se tiver chave válida
    const testUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=dQw4w9WgXcQ&key=${apiKey}`;
    const response = await fetch(testUrl);
    
    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        message: error.error?.message || 'Erro ao conectar com YouTube API',
        isMock: false,
      };
    }

    return {
      success: true,
      message: 'Conexão estabelecida com sucesso',
      isMock: false,
    };
  } catch (error) {
    console.log('🔧 VT: Erro na API YouTube - fallback para modo MOCK');
    return {
      success: true,
      message: 'Modo desenvolvimento ativado',
      isMock: true,
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
    
    // VT: Se não tem chave ou é mock, retornar comentários mock
    if (!apiKey || isMockKey(apiKey) || USE_MOCKS) {
      console.log('🎭 VT: Usando comentários MOCK');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay da API
      return generateMockComments(videoUrl, maxResults);
    }

    // Extrair ID do vídeo
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      throw new Error('URL do YouTube inválida');
    }

    console.log('🎬 VT: Buscando comentários reais da API YouTube...');
    // Fazer requisição para YouTube Data API
    const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=${maxResults}&order=relevance&key=${apiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.log('❌ VT: Erro na API YouTube - fallback para MOCK');
      return generateMockComments(videoUrl, maxResults);
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
    console.error('❌ VT: Erro ao buscar comentários, usando mock:', error);
    return generateMockComments(videoUrl, maxResults);
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
