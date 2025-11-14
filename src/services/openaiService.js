// Serviço para integração com OpenAI API
import { getServiceAPIKey } from '../hooks/useAPIKeys';
import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Busca o template da agente do Firestore
 * @param {string} agentId - ID da agente (sophia, sofia, sophia_lovable, etc)
 * @returns {Promise<string|null>} - Prompt da agente ou null
 */
const getAgentTemplate = async (agentId) => {
  try {
    console.log(`🔍 VT: Buscando template "${agentId}" no Firestore...`);
    
    const docRef = doc(db, 'agent_templates', agentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const prompt = data.prompt || data.systemPrompt || null;
      
      if (prompt && prompt.trim().length > 0) {
        console.log(`✅ VT: Template ${agentId} carregado (${prompt.length} caracteres)`);
        return prompt;
      } else {
        console.warn(`⚠️ VT: Template ${agentId} está vazio`);
        return null;
      }
    }
    
    console.warn(`⚠️ VT: Template ${agentId} não encontrado`);
    return null;
  } catch (error) {
    console.error(`❌ VT: Erro ao buscar template ${agentId}:`, error);
    return null;
  }
};

/**
 * Função genérica para chamar a IA
 * @param {string} agentId - ID do template no Firebase
 * @param {string} userMessage - Mensagem do usuário
 * @param {string} targetLanguage - Idioma alvo
 * @returns {Promise<string>} - Resposta da IA
 */
const callOpenAI = async (agentId, userMessage, targetLanguage = 'português brasileiro') => {
  try {
    const apiKey = await getServiceAPIKey('openai');
    
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('Configure uma chave OpenAI válida no painel administrativo');
    }

    // Buscar prompt do Firebase
    let systemPrompt = await getAgentTemplate(agentId);
    
    // Se não encontrar, usar fallback básico
    if (!systemPrompt) {
      console.log(`📝 VT: Usando prompt fallback para ${agentId}`);
      systemPrompt = `Você é uma IA especializada. Responda em ${targetLanguage} de forma profissional e focada em conversão.`;
    }

    // Chamar OpenAI - SEM adicionar instruções extras
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt, // Usa APENAS o prompt do Firebase
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ VT: Erro na API OpenAI:', error);
      throw new Error(error.error?.message || 'Erro ao gerar resposta');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('✅ VT: Resposta gerada com sucesso');
    
    return content;
  } catch (error) {
    console.error('❌ VT: Erro ao chamar OpenAI:', error);
    throw error;
  }
};

/**
 * Verifica se a conexão com a API do OpenAI está funcionando
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const verifyAPIConnection = async () => {
  try {
    const apiKey = await getServiceAPIKey('openai');
    
    if (!apiKey) {
      return {
        success: false,
        message: 'Chave não configurada no painel administrativo',
      };
    }

    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        message: error.error?.message || 'Erro ao conectar com OpenAI API',
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
 * Gera oferta principal (até seção 4)
 * @param {string} comments - Comentários para análise
 * @param {string} agent - Agente IA (sophia ou sofia)
 * @param {string} targetLanguage - Idioma alvo
 * @returns {Promise<Object>} - Oferta gerada
 */
export const generateOffer = async (comments, agent = 'sophia', targetLanguage = 'português brasileiro') => {
  try {
    console.log(`🚀 VT: Gerando oferta com agente "${agent}"...`);
    
    const userMessage = `Analise estes comentários e gere a oferta em ${targetLanguage}:\n\n${comments}`;
    const content = await callOpenAI(agent, userMessage, targetLanguage);
    
    return {
      title: `🔥 Oferta Completa Gerada por ${agent === 'sophia' ? 'Sophia Fênix' : 'Sofia Universal'}`,
      subtitle: 'Análise completa e estruturada da sua oferta',
      bullets: [
        '✅ Análise profunda do público-alvo e suas dores',
        '✅ Estrutura completa da oferta irresistível',
        '✅ Copy persuasiva e estratégica',
        '✅ Recomendações de implementação',
      ],
      cta: '📋 Veja a análise completa abaixo',
      bonus: '💡 Tudo pronto para você aplicar',
      fullResponse: content,
    };
  } catch (error) {
    console.error('❌ VT: Erro ao gerar oferta:', error);
    throw error;
  }
};

/**
 * Gera prompt para Lovable/IA Builder
 * @param {string} offerData - Dados da oferta campeã
 * @param {string} agent - Agente IA (sophia ou sofia)
 * @param {string} targetLanguage - Idioma alvo
 * @returns {Promise<string>} - Prompt para Lovable
 */
export const generateLovable = async (offerData, agent = 'sophia', targetLanguage = 'português brasileiro') => {
  try {
    console.log(`🎨 VT: Gerando prompt Lovable com ${agent}_lovable...`);
    
    const agentId = `${agent}_lovable`;
    const userMessage = `Com base nesta oferta, gere o prompt completo para Lovable em ${targetLanguage}:\n\n${offerData}`;
    
    return await callOpenAI(agentId, userMessage, targetLanguage);
  } catch (error) {
    console.error('❌ VT: Erro ao gerar Lovable:', error);
    throw error;
  }
};

/**
 * Gera quiz persuasivo
 * @param {string} offerData - Dados da oferta campeã
 * @param {string} agent - Agente IA (sophia ou sofia)
 * @param {string} targetLanguage - Idioma alvo
 * @returns {Promise<string>} - Quiz completo
 */
export const generateQuiz = async (offerData, agent = 'sophia', targetLanguage = 'português brasileiro') => {
  try {
    console.log(`📝 VT: Gerando quiz com ${agent}_quiz...`);
    
    const agentId = `${agent}_quiz`;
    const userMessage = `Com base nesta oferta, gere o quiz completo em ${targetLanguage}:\n\n${offerData}`;
    
    return await callOpenAI(agentId, userMessage, targetLanguage);
  } catch (error) {
    console.error('❌ VT: Erro ao gerar quiz:', error);
    throw error;
  }
};

/**
 * Gera estrutura WordPress/Elementor
 * @param {string} offerData - Dados da oferta campeã
 * @param {string} agent - Agente IA (sophia ou sofia)
 * @param {string} targetLanguage - Idioma alvo
 * @returns {Promise<string>} - Estrutura WordPress
 */
export const generateWordPress = async (offerData, agent = 'sophia', targetLanguage = 'português brasileiro') => {
  try {
    console.log(`🔧 VT: Gerando WordPress com ${agent}_wordpress...`);
    
    const agentId = `${agent}_wordpress`;
    const userMessage = `Com base nesta oferta, gere a estrutura WordPress completa em ${targetLanguage}:\n\n${offerData}`;
    
    return await callOpenAI(agentId, userMessage, targetLanguage);
  } catch (error) {
    console.error('❌ VT: Erro ao gerar WordPress:', error);
    throw error;
  }
};

/**
 * Gera ebook para Canva
 * @param {string} offerData - Dados da oferta campeã
 * @param {string} agent - Agente IA (sophia ou sofia)
 * @param {string} targetLanguage - Idioma alvo
 * @returns {Promise<string>} - Estrutura do ebook
 */
export const generateEbookCanva = async (offerData, agent = 'sophia', targetLanguage = 'português brasileiro') => {
  try {
    console.log(`📦 VT: Gerando ebook Canva com ${agent}_entregavel_canva...`);
    
    const agentId = `${agent}_entregavel_canva`;
    const userMessage = `Com base nesta oferta, gere a estrutura completa do ebook para Canva em ${targetLanguage}:\n\n${offerData}`;
    
    return await callOpenAI(agentId, userMessage, targetLanguage);
  } catch (error) {
    console.error('❌ VT: Erro ao gerar ebook Canva:', error);
    throw error;
  }
};

/**
 * Gera ebook para Gama
 * @param {string} offerData - Dados da oferta campeã
 * @param {string} agent - Agente IA (sophia ou sofia)
 * @param {string} targetLanguage - Idioma alvo
 * @returns {Promise<string>} - Estrutura do ebook
 */
export const generateEbookGama = async (offerData, agent = 'sophia', targetLanguage = 'português brasileiro') => {
  try {
    console.log(`📦 VT: Gerando ebook Gama com ${agent}_gama...`);
    
    const agentId = `${agent}_gama`;
    const userMessage = `Com base nesta oferta, gere a estrutura completa do ebook para Gama em ${targetLanguage}:\n\n${offerData}`;
    
    return await callOpenAI(agentId, userMessage, targetLanguage);
  } catch (error) {
    console.error('❌ VT: Erro ao gerar ebook Gama:', error);
    throw error;
  }
};

/**
 * Gera criativos para anúncios
 * @param {string} offerData - Dados da oferta campeã
 * @param {string} agent - Agente IA (sophia ou sofia)
 * @param {string} targetLanguage - Idioma alvo
 * @returns {Promise<string>} - Criativos completos
 */
export const generateCreatives = async (offerData, agent = 'sophia', targetLanguage = 'português brasileiro') => {
  try {
    console.log(`🎯 VT: Gerando criativos com ${agent}_criativos...`);
    
    const agentId = `${agent}_criativos`;
    const userMessage = `Com base nesta oferta, gere os criativos completos em ${targetLanguage}:\n\n${offerData}`;
    
    return await callOpenAI(agentId, userMessage, targetLanguage);
  } catch (error) {
    console.error('❌ VT: Erro ao gerar criativos:', error);
    throw error;
  }
};

/**
 * Analisa sentimento de comentários usando OpenAI
 * @param {Array<string>} comments - Array de comentários
 * @returns {Promise<Object>} - Análise de sentimento
 */
export const analyzeSentiment = async (comments) => {
  try {
    const apiKey = await getServiceAPIKey('openai');
    
    if (!apiKey) {
      throw new Error('Chave da API do OpenAI não configurada');
    }

    const commentsText = comments.join('\n');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Analise o sentimento destes comentários e retorne em JSON:
{
  "overall": "positivo|neutro|negativo",
  "positive": 0-100,
  "neutral": 0-100,
  "negative": 0-100,
  "keyPhrases": ["frase1", "frase2"],
  "mainThemes": ["tema1", "tema2"]
}`,
          },
          {
            role: 'user',
            content: commentsText,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error('Erro ao analisar sentimento');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      return JSON.parse(content);
    } catch (parseError) {
      return {
        overall: 'neutral',
        positive: 50,
        neutral: 30,
        negative: 20,
        keyPhrases: [],
        mainThemes: [],
      };
    }
  } catch (error) {
    console.error('Erro ao analisar sentimento:', error);
    throw error;
  }
};

/**
 * Gera sugestões de melhoria para a oferta
 * @param {Object} offer - Oferta atual
 * @returns {Promise<Array>} - Sugestões de melhoria
 */
export const generateOfferImprovements = async (offer) => {
  try {
    const apiKey = await getServiceAPIKey('openai');
    
    if (!apiKey) {
      throw new Error('Chave da API do OpenAI não configurada');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em copywriting e marketing. Analise a oferta e sugira melhorias específicas.',
          },
          {
            role: 'user',
            content: `Analise esta oferta e sugira 3-5 melhorias:\n\n${JSON.stringify(offer, null, 2)}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error('Erro ao gerar sugestões');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Extrair sugestões do texto
    const suggestions = content
      .split('\n')
      .filter(line => line.trim().length > 0)
      .slice(0, 5);

    return suggestions;
  } catch (error) {
    console.error('Erro ao gerar sugestões:', error);
    throw error;
  }
};
