// Serviço para integração com OpenAI API
import { getServiceAPIKey } from '../hooks/useAPIKeys';
import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Busca o prompt do agente no Firestore
 * @param {string} agentId - ID do agente (sophia, sofia)
 * @returns {Promise<string|null>} - Prompt ou null se não encontrar
 */
const getAgentPromptFromFirestore = async (agentId) => {
  try {
    console.log(`🔍 VT: Buscando prompt do agente "${agentId}" no Firestore...`);
    
    if (!db) {
      console.warn('⚠️ VT: Firestore não configurado, usando prompt fallback');
      return null;
    }

    const docRef = doc(db, 'agent_templates', agentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log(`✅ VT: Prompt encontrado para "${agentId}"`);
      return data.prompt || data.systemPrompt || null;
    } else {
      console.warn(`⚠️ VT: Prompt não encontrado no Firestore para "${agentId}"`);
      return null;
    }
  } catch (error) {
    console.error(`❌ VT: Erro ao buscar prompt do Firestore:`, error);
    return null;
  }
};

/**
 * Parse seguro de JSON removendo markdown
 * @param {string} content - Conteúdo a parsear
 * @returns {Object} - JSON parseado
 */
const safeJsonParse = (content) => {
  try {
    console.log('📝 VT: Tentando parsear JSON da resposta da IA...');
    
    // Tentar parsear direto primeiro
    try {
      const parsed = JSON.parse(content);
      console.log('✅ VT: JSON parseado com sucesso (sem limpeza necessária)!');
      return parsed;
    } catch (e) {
      // Se falhar, tentar extrair JSON de resposta complexa
      console.log('🧹 VT: Resposta não é JSON puro, tentando extrair...');
      
      // Procurar por blocos JSON na resposta
      const jsonBlockMatch = content.match(/```json\s*\n?([\s\S]*?)\n?```/i);
      if (jsonBlockMatch) {
        console.log('🔍 VT: Encontrado bloco ```json```');
        try {
          const parsed = JSON.parse(jsonBlockMatch[1].trim());
          console.log('✅ VT: JSON extraído de bloco markdown!');
          return parsed;
        } catch (e2) {
          console.log('⚠️ VT: Bloco markdown não é JSON válido');
        }
      }
      
      // Procurar por objeto JSON em qualquer lugar da resposta
      const jsonMatch = content.match(/\{[\s\S]*"title"[\s\S]*"subtitle"[\s\S]*"bullets"[\s\S]*\}/);
      if (jsonMatch) {
        console.log('🔍 VT: Encontrado objeto JSON na resposta');
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          console.log('✅ VT: JSON extraído da resposta complexa!');
          return parsed;
        } catch (e3) {
          console.log('⚠️ VT: Objeto encontrado não é JSON válido');
        }
      }
      
      // Última tentativa: remover tudo antes do primeiro {
      const firstBrace = content.indexOf('{');
      const lastBrace = content.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        console.log('🔍 VT: Tentando extrair entre { e }');
        try {
          const extracted = content.substring(firstBrace, lastBrace + 1);
          const parsed = JSON.parse(extracted);
          console.log('✅ VT: JSON extraído com sucesso!');
          return parsed;
        } catch (e4) {
          console.log('⚠️ VT: Extração entre { } falhou');
        }
      }
      
      throw new Error('Não foi possível extrair JSON da resposta');
    }
  } catch (error) {
    console.error('❌ VT: Erro ao parsear JSON:', error);
    console.error('📄 VT: Primeiros 500 chars:', content.substring(0, 500));
    
    const err = new Error('PARSE_ERROR');
    err.adminMessage = 'Erro ao parsear resposta da IA. O prompt no Firestore deve retornar JSON válido com {title, subtitle, bullets, cta, bonus}';
    err.userMessage = '🔧 Sistema em manutenção. Tente novamente em instantes.';
    throw err;
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
 * Gera uma oferta irresistível usando GPT
 * @param {string} comments - Comentários para análise
 * @param {string} agent - Agente IA (sophia ou sofia)
 * @returns {Promise<Object>} - Oferta gerada
 */
export const generateOffer = async (comments, agent = 'sophia') => {
  try {
    const apiKey = await getServiceAPIKey('openai');
    
    console.log('🔑 VT: Chave OpenAI obtida:', apiKey ? 'SIM' : 'NÃO');
    console.log('🔑 VT: Comprimento da chave:', apiKey?.length);
    console.log('🔑 VT: Primeira parte:', apiKey?.substring(0, 7));
    console.log('🔑 VT: Última parte:', apiKey?.substring(apiKey?.length - 4));
    
    if (!apiKey) {
      const error = new Error('API_KEY_NOT_FOUND');
      error.adminMessage = 'Chave da API do OpenAI não configurada no painel administrativo';
      error.userMessage = '🔧 Sistema em manutenção. Tente novamente em instantes.';
      throw error;
    }
    
    // Verificar se é uma chave mockada
    if ((apiKey.includes('•') || apiKey.includes('*') || apiKey.includes('AIza************************'))) {
      const error = new Error('API_KEY_MOCKED');
      error.adminMessage = 'A chave da API está mockada. Configure uma chave real no painel Admin → API Keys';
      error.userMessage = '🔧 Sistema em manutenção. Tente novamente em instantes.';
      throw error;
    }

    // PASSO 1: Buscar prompt do Firestore
    let systemPrompt = await getAgentPromptFromFirestore(agent);
    
    // PASSO 2: Se não encontrou, usar fallback hardcoded
    if (!systemPrompt) {
      console.log('⚠️ VT: Usando prompt fallback (hardcoded)');
      
      const fallbackPrompts = {
        sophia: `Você é Sophia Fênix. Analise os comentários e crie uma oferta persuasiva em JSON com: title, subtitle, bullets (array de 4), cta, bonus.`,
        sofia: `Você é Sofia Universal. Analise os comentários e crie uma oferta em JSON com: title, subtitle, bullets (array de 4), cta, bonus.`
      };
      
      systemPrompt = fallbackPrompts[agent] || fallbackPrompts.sophia;
    }
    
    console.log('📋 VT: System prompt preparado (tamanho:', systemPrompt.length, 'caracteres)');
    
    // PASSO 3: Estruturar mensagens corretamente
    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: comments  // Comentários vão direto como mensagem do usuário
      }
    ];
    
    console.log('💬 VT: Mensagens estruturadas (system + user)');

    // PASSO 4: Chamar OpenAI API
    console.log('📡 VT: Enviando requisição para OpenAI API...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',  // Modelo mais recente
        messages: messages,
        temperature: 0.0,  // Mais determinístico
        max_tokens: 2500,  // Mais tokens para respostas completas
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      const errorMessage = error.error?.message || 'Erro ao gerar oferta';
      
      // Detectar erro de quota/créditos
      if (response.status === 429 || errorMessage.includes('quota') || errorMessage.includes('billing')) {
        const quotaError = new Error('QUOTA_EXCEEDED');
        quotaError.adminMessage = '💳 Conta OpenAI sem créditos! Adicione créditos em: https://platform.openai.com/account/billing';
        quotaError.userMessage = '🔧 Sistema temporariamente indisponível. Tente novamente em alguns minutos.';
        quotaError.originalError = errorMessage;
        throw quotaError;
      }
      
      // Detectar erro de autenticação
      if (response.status === 401) {
        const authError = new Error('AUTH_FAILED');
        authError.adminMessage = '🔑 Chave da API OpenAI inválida ou expirada. Gere uma nova em: https://platform.openai.com/api-keys';
        authError.userMessage = '🔧 Sistema em manutenção. Tente novamente em instantes.';
        throw authError;
      }
      
      throw new Error(errorMessage);
    }

    console.log('📥 VT: Resposta recebida. Status:', response.status);
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('📄 VT: Conteúdo recebido da IA (primeiros 300 chars):', content.substring(0, 300));
    
    // PASSO 5: Parse seguro do JSON
    const offerData = safeJsonParse(content);
    
    // PASSO 6: Validar estrutura
    if (!offerData.title || !offerData.subtitle || !offerData.bullets || !offerData.cta) {
      console.warn('⚠️ VT: JSON incompleto, verificando formato alternativo...');
      
      // Se for formato completo da Sophia (com sections, pains, etc), converter
      if (offerData.offer) {
        console.log('🔄 VT: Convertendo formato completo para formato simples...');
        return {
          title: offerData.offer.headline || '🎯 Oferta Especial',
          subtitle: offerData.offer.subheadline || 'Transforme sua realidade',
          bullets: offerData.offer.benefits?.map(b => `✅ ${b}`) || [
            '✅ Acesso completo',
            '✅ Suporte dedicado',
            '✅ Garantia total',
            '✅ Bônus exclusivos'
          ],
          cta: offerData.offer.cta || '🚀 QUERO AGORA!',
          bonus: offerData.offer.bonus || '🎁 Bônus especial incluído',
        };
      }
    }
    
    console.log('✅ VT: Oferta gerada com sucesso!');
    return offerData;
  } catch (error) {
    console.error('Erro ao gerar oferta:', error);
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
