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
      console.log(`✅ VT: Prompt encontrado para "${agentId}"!`);
      console.log(`📝 VT: Tamanho do prompt:`, data.prompt?.length || 0);
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
    
    // MODO MOCK: Se não tiver chave válida, retornar oferta de exemplo
    const isValidKey = apiKey && apiKey.startsWith('sk-') && apiKey.length > 40;
    
    if (!isValidKey) {
      console.log('🎭 VT: MODO MOCK - Retornando oferta de exemplo (sem gastar tokens)');
      
      // Retornar oferta mockada baseada nos comentários
      const firstWords = comments.split(' ').slice(0, 5).join(' ');
      
      return {
        title: '🚀 Transforme Sua Vida Agora!',
        subtitle: `Descubra o método comprovado que já ajudou milhares de pessoas`,
        bullets: [
          '✅ Sistema completo e testado por especialistas',
          '✅ Resultados comprovados em até 30 dias',
          '✅ Suporte dedicado e comunidade exclusiva',
          '✅ Garantia incondicional de 7 dias'
        ],
        cta: '🎯 QUERO COMEÇAR AGORA!',
        bonus: '🎁 BÔNUS: Acesso vitalício + Material complementar grátis'
      };
    }

    // PASSO 1: Buscar prompt do Firestore
    let systemPrompt = await getAgentPromptFromFirestore(agent);
    
    // PASSO 2: Se não encontrou, usar fallback simples
    if (!systemPrompt) {
      console.log('⚠️ VT: Usando prompt fallback (hardcoded)');
      
      const fallbackPrompts = {
        sophia: `Você é Sophia Fênix, especialista em criar ofertas de alto impacto que convertem. 
Analise os seguintes comentários e crie uma oferta irresistível que atenda às dores e desejos do público.

Comentários:
${comments}

Crie uma oferta com:
1. Título impactante (emoji + frase poderosa)
2. Subtítulo persuasivo
3. 4 bullets de benefícios (começando com ✅)
4. Call-to-action convincente
5. Bônus irresistível

IMPORTANTE: Retorne APENAS um JSON válido, sem texto adicional antes ou depois.

Formato JSON:
{
  "title": "",
  "subtitle": "",
  "bullets": ["", "", "", ""],
  "cta": "",
  "bonus": ""
}`,
        sofia: `Você é Sofia Universal, IA versátil especializada em todos os nichos.
Analise os comentários abaixo e crie uma oferta personalizada e persuasiva.

Comentários:
${comments}

Crie uma oferta completa com elementos persuasivos.

IMPORTANTE: Retorne APENAS um JSON válido, sem texto adicional antes ou depois.

Formato JSON:
{
  "title": "",
  "subtitle": "",
  "bullets": ["", "", "", ""],
  "cta": "",
  "bonus": ""
}`
      };
      
      systemPrompt = fallbackPrompts[agent] || fallbackPrompts.sophia;
    }
    
    console.log('📋 VT: Usando prompt (tamanho:', systemPrompt.length, 'caracteres)');
    
    // PASSO 3: Estruturar mensagens
    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: comments
      }
    ];

    // PASSO 4: Chamar OpenAI API
    console.log('📡 VT: Enviando para OpenAI...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Erro ao gerar oferta');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('📄 VT: Resposta da IA:', content);
    
    // Tentar parsear JSON da resposta
    try {
      // Limpar possível markdown
      let jsonContent = content.trim();
      
      // Remover ```json e ``` se existir
      if (jsonContent.startsWith('```json')) {
        jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.replace(/```\n?/g, '');
      }
      
      const offerData = JSON.parse(jsonContent.trim());
      console.log('✅ VT: Oferta parseada com sucesso!', offerData);
      return offerData;
    } catch (parseError) {
      console.error('❌ VT: Erro ao parsear JSON:', parseError);
      console.error('📄 VT: Conteúdo recebido:', content);
      
      // Se não conseguir parsear, criar estrutura básica
      return {
        title: '🎯 Oferta Especial para Você!',
        subtitle: content.split('\n')[0] || 'Transforme sua realidade agora',
        bullets: [
          '✅ Acesso imediato ao conteúdo',
          '✅ Suporte dedicado',
          '✅ Garantia de satisfação',
          '✅ Bônus exclusivos',
        ],
        cta: '🚀 QUERO APROVEITAR AGORA!',
        bonus: '🎁 Bônus: Material complementar gratuito',
      };
    }
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
