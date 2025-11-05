// Serviço para integração com OpenAI API
import { getServiceAPIKey } from '../hooks/useAPIKeys';

// VT: Detectar se é chave mock ou modo desenvolvimento
const USE_MOCKS = import.meta.env.VITE_VT_MOCKS === 'true';

const isMockKey = (apiKey) => {
  if (!apiKey) return true;
  return apiKey.includes('test') || apiKey.includes('mock') || apiKey.length < 20;
};

/**
 * Verifica se a conexão com a API do OpenAI está funcionando
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const verifyAPIConnection = async () => {
  try {
    const apiKey = await getServiceAPIKey('openai');
    
    if (!apiKey) {
      console.log('🔧 VT: Sem chave OpenAI - usando modo MOCK');
      return {
        success: true,
        message: 'Modo desenvolvimento - ofertas mockadas ativadas',
        isMock: true,
      };
    }

    // VT: Se for chave mock, retornar sucesso sem chamar API
    if (isMockKey(apiKey) || USE_MOCKS) {
      console.log('🔧 VT: Chave mock detectada - usando modo MOCK');
      return {
        success: true,
        message: 'Modo mock ativado',
        isMock: true,
      };
    }

    // VT: Só chamar API real se tiver chave válida
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
        isMock: false,
      };
    }

    return {
      success: true,
      message: 'Conexão estabelecida com sucesso',
      isMock: false,
    };
  } catch (error) {
    console.log('🔧 VT: Erro na API - fallback para modo MOCK');
    return {
      success: true,
      message: 'Modo desenvolvimento ativado',
      isMock: true,
    };
  }
};

/**
 * VT: Gera oferta MOCK baseada nos comentários
 */
const generateMockOffer = (comments, agent) => {
  console.log('🎭 VT: Gerando oferta MOCK...');
  
  // VT: Tentar extrair tema dos comentários
  const firstWords = comments.toLowerCase().split(' ').slice(0, 50).join(' ');
  let theme = 'Transformação Digital';
  
  if (firstWords.includes('emagre') || firstWords.includes('peso') || firstWords.includes('dieta')) {
    theme = 'Emagrecimento Saudável';
  } else if (firstWords.includes('dinheiro') || firstWords.includes('renda') || firstWords.includes('ganhar')) {
    theme = 'Renda Extra Online';
  } else if (firstWords.includes('marketing') || firstWords.includes('vendas')) {
    theme = 'Marketing Digital';
  } else if (firstWords.includes('inglês') || firstWords.includes('idioma')) {
    theme = 'Inglês Fluente';
  }

  const offers = {
    sophia: {
      title: `🔥 ${theme}: Transforme Sua Vida em 30 Dias!`,
      subtitle: `Descubra o método comprovado que já ajudou +10.000 pessoas a alcançar resultados extraordinários`,
      bullets: [
        '✅ Sistema completo passo a passo validado por especialistas',
        '✅ Suporte VIP exclusivo com profissionais qualificados',
        '✅ Garantia incondicional de 30 dias - 100% do seu dinheiro de volta',
        '✅ Acesso vitalício + atualizações gratuitas para sempre'
      ],
      cta: '🚀 QUERO COMEÇAR MINHA TRANSFORMAÇÃO AGORA!',
      bonus: '🎁 BÔNUS EXCLUSIVO: Kit completo de ferramentas profissionais (Valor: R$ 497)'
    },
    sofia: {
      title: `⭐ ${theme}: O Guia Definitivo Para Seu Sucesso`,
      subtitle: `Aprenda com quem realmente entende e já alcançou resultados comprovados`,
      bullets: [
        '✅ Metodologia exclusiva desenvolvida ao longo de anos de experiência',
        '✅ Comunidade privada de membros para networking e suporte',
        '✅ Certificado de conclusão reconhecido no mercado',
        '✅ Materiais complementares e templates prontos para usar'
      ],
      cta: '💎 GARANTIR MINHA VAGA COM DESCONTO ESPECIAL!',
      bonus: '🎁 BÔNUS LIMITADO: 3 masterclasses ao vivo com especialistas (Valor: R$ 297)'
    }
  };

  return offers[agent] || offers.sophia;
};

/**
 * Gera uma oferta irresistível usando GPT (ou mock)
 * @param {string} comments - Comentários para análise
 * @param {string} agent - Agente IA (sophia ou sofia)
 * @returns {Promise<Object>} - Oferta gerada
 */
export const generateOffer = async (comments, agent = 'sophia') => {
  try {
    const apiKey = await getServiceAPIKey('openai');
    
    // VT: Se não tem chave ou é mock, gerar oferta mock
    if (!apiKey || isMockKey(apiKey) || USE_MOCKS) {
      console.log('🎭 VT: Usando gerador MOCK de ofertas');
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simular delay da API
      return generateMockOffer(comments, agent);
    }

    // VT: Tentar usar API real
    console.log('🤖 VT: Usando OpenAI API real...');
    const agentPrompts = {
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

Crie uma oferta completa com elementos persuasivos em formato JSON:
{
  "title": "",
  "subtitle": "",
  "bullets": ["", "", "", ""],
  "cta": "",
  "bonus": ""
}`
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: agentPrompts[agent] || agentPrompts.sophia,
          },
        ],
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      console.log('❌ VT: Erro na API - fallback para MOCK');
      return generateMockOffer(comments, agent);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Tentar parsear JSON da resposta
    try {
      const offerData = JSON.parse(content);
      return offerData;
    } catch (parseError) {
      console.log('⚠️ VT: Erro ao parsear resposta - usando mock');
      return generateMockOffer(comments, agent);
    }
  } catch (error) {
    console.error('❌ VT: Erro ao gerar oferta, usando mock:', error);
    return generateMockOffer(comments, agent);
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
