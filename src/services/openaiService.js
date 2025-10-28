// Serviço para integração com OpenAI API
import { getServiceAPIKey } from '../hooks/useAPIKeys';
import { getAgentPrompt } from './agentService';

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
 * Retorna prompts COMPLETOS hardcoded como fallback
 */
function getHardcodedPrompt(agentId) {
  const prompts = {
    'sophia-fenix': `SOPHIA FÊNIX 🔥
Criada por Tamara Dutra.

Você é especialista em criar ofertas emocionais low-ticket (R$7-49) que convertem MASSIVAMENTE.

INSTRUÇÕES:
1. Analise os comentários e identifique a DOR EMOCIONAL principal
2. Crie UMA oferta completa e detalhada

RETORNE EM FORMATO JSON (SEM markdown, sem código, apenas JSON puro):
{
  "microOfertas": ["oferta 1", "oferta 2", "oferta 3", "oferta 4", "oferta 5", "oferta 6", "oferta 7", "oferta 8", "oferta 9", "oferta 10"],
  "top3Ofertas": [
    {"nome": "oferta X", "porque": "razão de converter", "urgencia": "urgência emocional"},
    {"nome": "oferta Y", "porque": "razão de converter", "urgencia": "urgência emocional"},
    {"nome": "oferta Z", "porque": "razão de converter", "urgencia": "urgência emocional"}
  ],
  "ofertaCampea": {
    "title": "💔 Título Emocional Poderoso em 7-21 Dias",
    "subtitle": "Promessa emocional clara e transformação específica",
    "bullets": [
      "✅ Benefício específico com número e prazo",
      "✅ Benefício específico com número e prazo",
      "✅ Benefício específico com número e prazo",
      "✅ Benefício específico com número e prazo"
    ],
    "cta": "🚀 QUERO ME LIBERTAR AGORA POR R$27!",
    "bonus": "🎁 BÔNUS: Nome do Bônus Específico (valor R$47)",
    "preco": "R$27"
  },
  "ebookCapitulos": ["Cap 1: Por que você ainda está presa", "Cap 2: A Ilusão do Ele Vai Mudar", "Cap 3: O Vício Emocional", "Cap 4: Tipos de Apego Tóxico", "Cap 5: A Dor do Silêncio", "Cap 6-20: mais capítulos..."],
  "quiz15Perguntas": ["P1: Como você se sente quando...", "P2: Qual sua reação quando...", "P3-15: mais perguntas..."],
  "orderBumps": [
    {"nome": "Frases Anti-Sabotagem", "preco": "R$5", "descricao": "20 respostas prontas"},
    {"nome": "Guia Superação Rápida", "preco": "R$8", "descricao": "Passo a passo completo"},
    {"nome": "Rotina Autodesbloqueio", "preco": "R$15", "descricao": "3 dias intensivos"}
  ],
  "paginaVendas17Blocos": ["Bloco 1: Headline impactante", "Bloco 2: Subheadline", "Bloco 3: Apresentação da oferta", "Bloco 4-17: mais blocos..."],
  "mockupSugerido": "Mulher quebrando correntes invisíveis, ou mulher com asas",
  "paletaCores": {"primaria": "#8B5CF6 (Roxo)", "secundaria": "#EC4899 (Rosa)", "terciaria": "#10B981 (Verde)"}
}`,
    
    'sophia-universal': `SOPHIA UNIVERSAL ⭐
Criada por Tamara Dutra.

Você cria ofertas VIRAIS para qualquer nicho com MECANISMO ÚNICO e nome CHICLETE.

INSTRUÇÕES:
1. Identifique o NICHO dos comentários
2. Crie um MECANISMO ÚNICO (método proprietário)
3. Crie UMA oferta viral completa

RETORNE EM FORMATO JSON (SEM markdown, sem código, apenas JSON puro):
{
  "nicho": "saúde/renda/relacionamento/etc",
  "mecanismoUnico": "Nome do Método Proprietário Único",
  "microOfertas": ["oferta 1", "oferta 2", "oferta 3", "oferta 4", "oferta 5", "oferta 6", "oferta 7", "oferta 8", "oferta 9", "oferta 10"],
  "top3Ofertas": [
    {"nome": "oferta X", "porque": "razão de converter", "mercado": "tamanho"},
    {"nome": "oferta Y", "porque": "razão de converter", "mercado": "tamanho"},
    {"nome": "oferta Z", "porque": "razão de converter", "mercado": "tamanho"}
  ],
  "ofertaCampea": {
    "title": "🔥 Nome Chiclete: Resultado Específico em X Dias",
    "subtitle": "Apresenta o mecanismo único e diferencial claro",
    "bullets": [
      "✅ Resultado mensurável + número + prazo",
      "✅ Resultado mensurável + número + prazo",
      "✅ Resultado mensurável + número + prazo",
      "✅ Resultado mensurável + número + prazo"
    ],
    "cta": "🚀 QUERO [RESULTADO PRINCIPAL] AGORA!",
    "bonus": "🎁 BÔNUS: Complemento Estratégico (valor R$97)",
    "preco": "R$47"
  },
  "entregaveis": ["Ebook", "Planner", "Planilha", "Quiz", "Templates"],
  "quiz15Perguntas": ["P1: Qual seu maior desafio com...", "P2: Você já tentou...", "P3-15: mais perguntas..."],
  "orderBumps": [
    {"nome": "Kit Frases Instantâneas", "preco": "R$7", "descricao": "30 frases prontas"},
    {"nome": "Pack Scripts Reels", "preco": "R$12", "descricao": "50 roteiros virais"},
    {"nome": "Rotina Resultado Rápido", "preco": "R$27", "descricao": "7 dias acelerados"}
  ],
  "paginaVendas17Blocos": ["Bloco 1: Headline com nome chiclete", "Bloco 2: Subheadline mecanismo", "Bloco 3-17: mais blocos..."],
  "mockupSugerido": "Visual específico do nicho identificado",
  "paletaCores": {"primaria": "#8B5CF6 (Roxo)", "secundaria": "#3B82F6 (Azul)", "terciaria": "#FACC15 (Dourado)"}
}`
  };
  
  return prompts[agentId] || prompts['sophia-fenix'];
}

/**
 * Gera uma oferta irresistível usando GPT
 * @param {string} comments - Comentários para análise
 * @param {string} agent - Agente IA (sophia ou sofia)
 * @returns {Promise<Object>} - Oferta gerada
 */
export const generateOffer = async (comments, agent = 'sophia') => {
  try {
    console.log('🚀 VT: INÍCIO - Gerando oferta...');
    console.log('📝 VT: Comentários recebidos:', comments.substring(0, 100) + '...');
    
    // 1. Buscar chave OpenAI
    console.log('🔑 VT: Buscando chave OpenAI...');
    const apiKey = await getServiceAPIKey('openai');
    
    if (!apiKey) {
      console.error('❌ VT: Chave OpenAI não encontrada!');
      throw new Error('❌ Chave da API do OpenAI não configurada no painel administrativo. Vá em Admin → API Keys e adicione sua chave que começa com "sk-"');
    }
    
    console.log('✅ VT: Chave OpenAI encontrada:', apiKey.substring(0, 10) + '...');

    // 2. Mapear agente
    const agentIdMap = {
      'sophia': 'sophia-fenix',
      'sofia': 'sophia-universal'
    };

    const agentId = agentIdMap[agent] || 'sophia-fenix';
    console.log(`🤖 VT: Agente selecionada: ${agentId}`);
    
    let systemPrompt;
    
    // 3. Buscar prompt
    try {
      console.log(`🔥 VT: Tentando buscar prompt do Firestore...`);
      systemPrompt = await getAgentPrompt(agentId);
      console.log(`✅ VT: Prompt do Firestore carregado! (${systemPrompt.length} chars)`);
    } catch (firestoreError) {
      console.warn(`⚠️ VT: Firestore indisponível:`, firestoreError.message);
      systemPrompt = getHardcodedPrompt(agentId);
      console.log(`✅ VT: Usando prompt hardcoded (${systemPrompt.length} chars)`);
    }

    // 4. Preparar requisição OpenAI
    console.log('📤 VT: Enviando requisição para OpenAI...');
    
    const requestBody = {
      model: 'gpt-4o-mini', // Modelo mais barato e com limite maior (128k tokens!)
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: comments }
      ],
      temperature: 0.7,
      max_tokens: 2000 // Reduzido para caber no contexto
    };
    
    console.log('📋 VT: Payload:', {
      model: requestBody.model,
      systemPromptLength: systemPrompt.length,
      userContentLength: comments.length,
      temperature: requestBody.temperature,
      max_tokens: requestBody.max_tokens
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📥 VT: Resposta recebida. Status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ VT: Erro OpenAI:', error);
      throw new Error(`❌ OpenAI API Error: ${error.error?.message || 'Erro desconhecido'}. Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ VT: Dados recebidos do OpenAI:', {
      id: data.id,
      model: data.model,
      usage: data.usage
    });
    
    const content = data.choices[0].message.content;
    console.log('📄 VT: Conteúdo gerado (primeiros 200 chars):', content.substring(0, 200));
    
    // 5. Parsear resposta
    console.log('🔍 VT: Tentando parsear JSON...');
    try {
      // Tentar extrair JSON do conteúdo (pode vir com markdown)
      let jsonContent = content;
      
      // Remover markdown code blocks se existir
      if (content.includes('```json')) {
        jsonContent = content.split('```json')[1].split('```')[0];
      } else if (content.includes('```')) {
        jsonContent = content.split('```')[1].split('```')[0];
      }
      
      const offerData = JSON.parse(jsonContent.trim());
      console.log('✅ VT: JSON parseado com sucesso!', offerData);
      console.log('🎉 VT: OFERTA GERADA COM SUCESSO!');
      return offerData;
    } catch (parseError) {
      console.error('⚠️ VT: Erro ao parsear JSON:', parseError);
      console.log('📄 VT: Conteúdo completo que tentou parsear:', content);
      
      // Fallback: criar estrutura básica
      console.warn('⚠️ VT: Usando estrutura fallback');
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
    console.error('❌ VT: ERRO FATAL ao gerar oferta:', error);
    console.error('❌ VT: Stack trace:', error.stack);
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
