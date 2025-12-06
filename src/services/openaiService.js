// Serviço para integração com OpenAI API
import { getServiceAPIKey } from '../hooks/useAPIKeys';
import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Busca o prompt do agente no Firestore
 * @param {string} agentId - ID do agente (sophia, sofia, sophia_lovable, etc)
 * @param {string} specificPrompt - Tipo específico de prompt (lovable, quiz, wordpress)
 * @returns {Promise<string|null>} - Prompt ou null se não encontrar
 */
const getAgentPromptFromFirestore = async (agentId, specificPrompt = null) => {
  try {
    // Se specificPrompt foi fornecido, buscar prompt específico
    const promptId = specificPrompt ? `${agentId}_${specificPrompt}` : agentId;
    
    // Removido log sensível: console.log(`🔍 VT: Buscando prompt "${promptId}" no Firestore...`);
    
    if (!db) {
      // Removido log sensível: console.warn('⚠️ VT: Firestore não configurado, usando prompt fallback');
      return null;
    }

    const docRef = doc(db, 'agent_templates', promptId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Removido log sensível: console.log(`✅ VT: Prompt encontrado para "${promptId}"`);
      return data.prompt || data.systemPrompt || null;
    } else {
      // Se não encontrou prompt específico, tentar buscar o prompt principal
      if (specificPrompt) {
        // Removido log sensível: console.log(`🔄 VT: Tentando buscar prompt principal "${agentId}"...`);
        const mainDocRef = doc(db, 'agent_templates', agentId);
        const mainDocSnap = await getDoc(mainDocRef);
        
        if (mainDocSnap.exists()) {
          const data = mainDocSnap.data();
          // Removido log sensível: console.log(`✅ VT: Usando prompt principal "${agentId}" como fallback`);
          return data.prompt || data.systemPrompt || null;
        }
      }
      
      return null;
    }
  } catch (error) {
    // Removido log sensível: console.error(`❌ VT: Erro ao buscar prompt do Firestore:`, error);
    return null;
  }
};

/**
 * Parse seguro de JSON (simplificado para uso geral)
 * @param {string} content - Conteúdo a parsear
 * @returns {Object|null} - JSON parseado ou null se falhar
 */
const safeJsonParse = (content) => {
  try {
    // Tentar parsear direto
    const parsed = JSON.parse(content);
    return parsed;
  } catch (e) {
    // Tentar extrair JSON de bloco ```json```
    const jsonBlockMatch = content.match(/```json\s*\n?([\s\S]*?)\n?```/i);
    if (jsonBlockMatch) {
      try {
        const parsed = JSON.parse(jsonBlockMatch[1].trim());
        return parsed;
      } catch (e2) {
        // Falha ao parsear bloco markdown
      }
    }
    return null;
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
 * Gera a estrutura do e-book do Gama usando GPT
 * @param {string} comments - Comentários para análise
 * @param {string} agent - Agente IA (sophia ou sofia)
 * @param {string} targetLanguage - Idioma alvo (pt-BR, en-US, es-ES)
 * @param {string} specificPrompt - Tipo específico de prompt (lovable, quiz, wordpress) - NOVO
 * @returns {Promise<Object>} - Estrutura do e-book gerada
 */
export const generateOffer = async (comments, agent = 'sophia', targetLanguage = 'pt-BR', specificPrompt = null, isTextOnly = false) => {
   
  try {
    const apiKey = await getServiceAPIKey('openai');
    
    // Removidos logs sensíveis de chave de API
    
    if (specificPrompt) {
      // Removido log sensível: console.log(`🎯 VT: Usando prompt específico: ${agent}_${specificPrompt}`);
    }
    
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

    // PASSO 1: Buscar prompt do Firestore (com suporte a prompts específicos)
    let systemPrompt = await getAgentPromptFromFirestore(agent, specificPrompt);
    
    // PASSO 2: Se não encontrou, usar fallback hardcoded
    if (!systemPrompt) {
      // Removido log sensível: console.log('⚠️ VT: Usando prompt fallback (hardcoded)');
      
      const fallbackPrompts = {
        sophia: `Você é Sophia Fênix, uma especialista em marketing e vendas. Sua função é analisar os comentários de um vídeo do YouTube e transformá-los em uma Oferta Principal de Alto Impacto.

    O resultado DEVE ser um objeto JSON estrito, contendo APENAS os seguintes campos:
    {
      "title": "Título da Oferta",
      "subtitle": "Subtítulo/Promessa Principal",
      "bullets": ["Benefício 1", "Benefício 2", "Benefício 3", "Benefício 4"],
      "cta": "Chamada para Ação",
      "bonus": "Bônus/Garantia"
    }

    Certifique-se de que a saída seja APENAS o objeto JSON, sem qualquer texto explicativo antes ou depois.`,
      };
      
      systemPrompt = fallbackPrompts[agent] || fallbackPrompts.sophia;
    }
    
    // Removido log sensível: console.log('📋 VT: System prompt preparado (tamanho:', systemPrompt.length, 'caracteres)');
    
    // PASSO 3: Estruturar mensagens corretamente
    const languageInstructions = {
      'pt-BR': 'Responda em português do Brasil.',
      'en-US': 'Respond in American English.',
      'es-ES': 'Responde en español de España.'
    };
    const languageInstruction = languageInstructions[targetLanguage] || languageInstructions['pt-BR'];
    const messages = [
      {
        role: 'system',
        content: `${systemPrompt}\n\n${languageInstruction}`
      },
      {
        role: 'user',
        content: comments  // Comentários vão direto como mensagem do usuário
      }
    ];
    
    // Removido log sensível: console.log('💬 VT: Mensagens estruturadas (system + user)');

    // PASSO 4: Chamar OpenAI API
    // Removido log sensível: console.log('📡 VT: Enviando requisição para OpenAI API...');
    
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
      const errorMessage = error.error?.message || 'Erro ao gerar estrutura do e-book';
      
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

    // Removido log sensível: console.log('📥 VT: Resposta recebida. Status:', response.status);
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Removido log sensível: console.log('📄 VT: Conteúdo recebido da IA (primeiros 300 chars):', content.substring(0, 300));
    
    // Se isTextOnly for true, retorna o conteúdo puro
    if (isTextOnly) {
      // Removido log sensível: console.log('📝 VT: Retornando como texto puro (isTextOnly=true)');
      return {
        fullResponse: content,
        title: 'Resultado Gerado',
        subtitle: 'Conteúdo de texto completo',
        bullets: [],
        cta: 'Copiar',
        bonus: 'Texto'
      };
    }
    
    // Lógica de JSON final apenas se for solicitado (isTextOnly=false e a IA retornar JSON)
    // A IA não é mais forçada a retornar JSON, mas se retornar, tentamos parsear.
    let resultData = safeJsonParse(content);
    
    // Se a IA retornou JSON e ele é válido, usamos ele.
    if (resultData) {
      // Removido log sensível: console.log('✅ VT: JSON válido encontrado na resposta.');
      // Retorna o JSON parseado, mas com a chave fullResponse contendo o JSON como string
      return {
        ...resultData,
        fullResponse: JSON.stringify(resultData, null, 2)
      };
    }
    
    // Se não for JSON, retorna o texto livre
    // Removido log sensível: console.log('📝 VT: Retornando texto livre (sem JSON obrigatório).');
    
    // A limpeza agressiva de respostas foi removida.
    // O fullResponse agora é o content puro.
    let cleanContent = content;
    
    // Ajuste 2: Remover qualquer exibição de JSON ou código
    // Elimine blocos visuais contendo: { }, [ ], e qualquer fragmento JG, JGIS, JS ou sintaxe parecida
    // O painel deve mostrar somente texto limpo.
    
    // 1. Remover blocos de código (```json ... ```, ``` ... ```)
    cleanContent = cleanContent.replace(/```[\s\S]*?```/gi, '');
    
    // 2. Remover JSON solto (qualquer coisa entre { e } que contenha "title", "subtitle", "bullets" ou "cta")
    // Esta regex é a última linha de defesa para JSONs não formatados
    cleanContent = cleanContent.replace(/\{[\s\S]*?("title"|"subtitle"|"bullets"|"cta")[\s\S]*?\}/gi, '');
    
    // 3. Remover fragmentos de código JG, JGIS, JS ou sintaxe parecida
    cleanContent = cleanContent.replace(/JG|JGIS|JS/gi, '');
    
    // 4. Remover chaves e colchetes soltos que possam ter sobrado
    cleanContent = cleanContent.replace(/\{|\}|\[|\]/g, '');
    
    // 5. Limpar linhas vazias extras
    cleanContent = cleanContent.replace(/\n{3,}/g, '\n\n').trim();
    
    const normalized = {
      title: 'Estrutura do E-book Gerada',
      subtitle: 'Análise completa e estruturada da sua oferta',
      bullets: [
        '✅ Análise profunda do público-alvo',
        '✅ 10 micro-ofertas personalizadas criadas',
        '✅ 3 ofertas campeãs selecionadas',
        '✅ Estrutura completa do produto'
      ],
      cta: 'Copiar',
      bonus: 'Texto',
      fullResponse: cleanContent // Retorna a resposta crua da IA
    };
    
    // Removido log sensível: console.log('✅ VT: Estrutura do e-book gerada com sucesso!');
    return normalized;
  } catch (error) {
    // Removido log sensível: console.error('Erro ao gerar estrutura do e-book:', error);
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
      // Usa o safeJsonParse simplificado
      const parsed = safeJsonParse(content);
      return parsed || {
        overall: 'neutral',
        positive: 50,
        neutral: 30,
        negative: 20,
        keyPhrases: [],
        mainThemes: [],
      };
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
    // Removido log sensível: console.error('Erro ao analisar sentimento:', error);
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
    // Removido log sensível: console.error('Erro ao gerar sugestões:', error);
    throw error;
  }
};
