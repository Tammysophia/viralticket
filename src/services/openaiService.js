// Serviço para integração com OpenAI API
import { getServiceAPIKey } from '../hooks/useAPIKeys';
import { getFullSystemPrompt } from './agentService';

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

    // Fazer uma requisição simples para testar a chave
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
 * Constrói system prompt COMPLETO do Firestore (com fallback MVP)
 * @param {string} agentId - ID da agente
 * @returns {Promise<string>} - System prompt COMPLETO
 */
async function buildSystemPrompt(agentId) {
  const systemPrompt = await getFullSystemPrompt(agentId);
  
  console.info(`[OPENAI] 🔍 systemPrompt chars=${systemPrompt.length}`);
  console.info(`[OPENAI] 🔍 systemPrompt preview: ${systemPrompt.substring(0, 150)}...`);
  
  // Warning se estiver usando hardcoded (MVP)
  if (systemPrompt.includes('SOPHIA FÊNIX 🔥') || systemPrompt.includes('SOPHIA UNIVERSAL ⭐')) {
    console.warn('[OPENAI][MVP] ⚠️ Usando prompts hardcoded. Configure Firestore para produção: npm run inject-agents');
  } else {
    console.info('[OPENAI] ✅ Usando prompt do Firestore');
  }
  
  // Debug: Verificar se tem instruções JSON
  if (systemPrompt.includes('FORMATO DE RESPOSTA OBRIGATÓRIO')) {
    console.info('[OPENAI] ✅ Instruções JSON encontradas no prompt');
  } else {
    console.error('[OPENAI] ❌ ERRO: Instruções JSON AUSENTES no prompt!');
  }
  
  return systemPrompt;
}

/**
 * Gera uma oferta irresistível usando GPT
 * @param {Object} params - Parâmetros
 * @param {string} params.agentId - ID da agente ('sophia-fenix' ou 'sophia-universal')
 * @param {string} params.userInput - Comentários para análise
 * @returns {Promise<Object>} - Oferta gerada
 */
export const generateOffer = async (commentsOrParams, legacyAgent) => {
  try {
    // Suporte a chamadas antigas: generateOffer(comments, agent)
    let agentId, userInput;
    if (typeof commentsOrParams === 'string') {
      const agentIdMap = { 'sophia': 'sophia-fenix', 'sofia': 'sophia-universal' };
      agentId = agentIdMap[legacyAgent] || 'sophia-fenix';
      userInput = commentsOrParams;
    } else {
      agentId = commentsOrParams.agentId;
      userInput = commentsOrParams.userInput;
    }

    console.info('[OPENAI] Starting offer generation...');
    console.info(`[OPENAI] agentId=${agentId}`);
    console.info(`[OPENAI] userInput length=${userInput.length} chars`);
    
    // 1. Buscar chave OpenAI
    const apiKey = await getServiceAPIKey('openai');
    if (!apiKey) {
      throw new Error('Chave da API do OpenAI não configurada no painel administrativo');
    }

    // 2. Buscar system prompt COMPLETO (SEM fallback - lança erro se falhar)
    const systemPrompt = await buildSystemPrompt(agentId);

    // 3. Preparar mensagens
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userInput }
    ];

    // 4. Chamar OpenAI

    console.info('[OPENAI] Calling OpenAI API...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: "json_object" }
      }),
    });

    console.info(`[OPENAI] Response status=${response.status}`);

    if (!response.ok) {
      const error = await response.json();
      console.error('[OPENAI][ERR] API error:', error);
      throw new Error(`OpenAI API Error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.info('[OPENAI] Response received:', {
      id: data.id,
      model: data.model,
      usage: data.usage
    });
    
    const content = data.choices[0].message.content;
    console.info(`[OPENAI] Response length: ${content.length} chars`);
    console.info(`[OPENAI] Response preview: ${content.substring(0, 200)}...`);
    
    // 5. Parsear resposta JSON
    console.info('[OPENAI] Parsing JSON response...');
    try {
      // Remover markdown code blocks se existir
      let jsonContent = content;
      if (content.includes('```json')) {
        jsonContent = content.split('```json')[1].split('```')[0];
      } else if (content.includes('```')) {
        jsonContent = content.split('```')[1].split('```')[0];
      }
      
      const fullResponse = JSON.parse(jsonContent.trim());
      console.info('[OPENAI] JSON parsed successfully');
      
      if (import.meta.env.VITE_VT_DEBUG) {
        console.info('[OPENAI][DEBUG] Full response structure:', Object.keys(fullResponse));
      }
      
      // Se vier com estrutura completa, extrair ofertaCampea
      if (fullResponse.ofertaCampea) {
        console.info('[OPENAI] Complete offer structure detected');
        return {
          ...fullResponse.ofertaCampea,
          _fullData: fullResponse
        };
      }
      
      console.info('[OPENAI] Offer generated successfully');
      return fullResponse;
    } catch (parseError) {
      console.error('[OPENAI][ERR] JSON parse failed:', parseError.message);
      if (import.meta.env.VITE_VT_DEBUG) {
        console.error('[OPENAI][DEBUG] Raw content:', content);
      }
      
      // Retornar o conteúdo bruto como fallback de parse apenas
      return {
        title: '🎯 Oferta Gerada',
        subtitle: content.substring(0, 200),
        bullets: ['✅ Ver console para conteúdo completo'],
        cta: '🚀 CONFERIR OFERTA',
        bonus: '🎁 Conteúdo disponível no console',
        _rawContent: content
      };
    }
  } catch (error) {
    console.error('[OPENAI][ERR] Fatal error:', error);
    if (import.meta.env.VITE_VT_DEBUG) {
      console.error('[OPENAI][DEBUG] Stack:', error.stack);
    }
    // Propagar erro com código preservado
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
