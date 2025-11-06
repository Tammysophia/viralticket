// Serviço para integração com OpenAI API
import { getServiceAPIKey } from '../hooks/useAPIKeys';

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
    
    // Verificar se é uma chave mockada (mas permitir chaves curtas se forem criptografadas)
    if ((apiKey.includes('•') || apiKey.includes('*') || apiKey.includes('AIza************************'))) {
      const error = new Error('API_KEY_MOCKED');
      error.adminMessage = 'A chave da API está mockada. Configure uma chave real no painel Admin → API Keys';
      error.userMessage = '🔧 Sistema em manutenção. Tente novamente em instantes.';
      throw error;
    }

    const systemPrompts = {
      sophia: `Você é Sophia Fênix, especialista em criar ofertas de alto impacto que convertem vendas.

INSTRUÇÕES:
1. Analise PROFUNDAMENTE os comentários fornecidos
2. Identifique as DORES, DESEJOS e OBJEÇÕES reais do público
3. Identifique o NICHO e CONTEXTO específico
4. Crie uma oferta ULTRA-ESPECÍFICA para esse público
5. Use palavras e expressões que ELES usaram nos comentários
6. Seja DIRETO, CLARO e PERSUASIVO

Retorne APENAS um JSON válido (sem markdown, sem explicações):
{
  "title": "Título com emoji + promessa específica do nicho",
  "subtitle": "Transformação clara que resolve a dor principal",
  "bullets": [
    "✅ Benefício específico 1 (use linguagem do público)",
    "✅ Benefício específico 2 (resolva objeção real)",
    "✅ Benefício específico 3 (resultado tangível)",
    "✅ Benefício específico 4 (diferencial único)"
  ],
  "cta": "Ação urgente e específica do nicho",
  "bonus": "Bônus irresistível e relevante"
}`,
      sofia: `Você é Sofia Universal, IA especializada em copywriting de alta conversão.

INSTRUÇÕES:
1. Leia TODOS os comentários com atenção
2. Identifique: nicho, público-alvo, dores principais, desejos ocultos
3. Encontre padrões: o que eles REALMENTE querem?
4. Crie uma oferta que pareça "feita sob medida"
5. Use gatilhos mentais: urgência, escassez, prova social
6. Seja específico no nicho identificado

Retorne APENAS um JSON válido (sem markdown, sem explicações):
{
  "title": "🎯 Título específico do nicho + promessa clara",
  "subtitle": "Como [público] pode [resultado desejado] sem [objeção]",
  "bullets": [
    "✅ Solução para dor específica 1",
    "✅ Benefício tangível e mensurável 2",
    "✅ Diferencial competitivo 3",
    "✅ Garantia ou segurança 4"
  ],
  "cta": "🚀 Ação clara e urgente",
  "bonus": "🎁 Bônus complementar e valioso"
}`
    };

    const userPrompt = `ANALISE ESTES COMENTÁRIOS REAIS:

${comments}

---

Agora crie uma oferta IRRESISTÍVEL para esse público específico. 

IMPORTANTE:
- Identifique o nicho/tema dos comentários
- Use a linguagem DELES (palavras que eles usaram)
- Resolva as DORES mencionadas
- Atenda aos DESEJOS expressos
- Seja ESPECÍFICO do nicho (não genérico!)
- Crie senso de urgência

Retorne APENAS o JSON, sem explicações.`;

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
            content: systemPrompts[agent] || systemPrompts.sophia,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        temperature: 0.9,  // Aumentado para mais criatividade
        max_tokens: 1500,  // Aumentado para respostas mais completas
        presence_penalty: 0.6,  // Evita repetições
        frequency_penalty: 0.3, // Mais variação nas palavras
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

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Tentar parsear JSON da resposta
    try {
      const offerData = JSON.parse(content);
      return offerData;
    } catch (parseError) {
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
