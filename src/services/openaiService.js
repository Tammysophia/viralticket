// Serviço para integração com OpenAI API
import { getServiceAPIKey } from '../hooks/useAPIKeys';
import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Busca o prompt de um agente do Firestore
 * @param {string} agentId - ID do agente (sophia, sofia, etc)
 * @returns {Promise<string|null>} - Prompt do agente ou null
 */
const getAgentPromptFromFirestore = async (agentId) => {
  try {
    console.log(`🔍 VT: Buscando prompt do agente "${agentId}" no Firestore...`);
    
    const agentRef = doc(db, 'agent_templates', agentId);
    const agentSnap = await getDoc(agentRef);
    
    if (agentSnap.exists()) {
      const data = agentSnap.data();
      console.log(`✅ VT: Prompt encontrado para "${agentId}"`, { hasPrompt: !!data.prompt });
      return data.prompt || null;
    }
    
    console.warn(`⚠️ VT: Documento "agent_templates/${agentId}" não encontrado no Firestore`);
    return null;
  } catch (error) {
    console.error(`❌ VT: Erro ao buscar prompt do Firestore:`, error);
    return null;
  }
};

/**
 * Parse seguro de JSON, removendo markdown se necessário
 * @param {string} content - Conteúdo a ser parseado
 * @returns {Object} - JSON parseado
 */
const safeJsonParse = (content) => {
  try {
    console.log('📝 VT: Tentando parsear JSON da resposta da IA...');
    
    // Remover markdown ```json``` se presente
    let cleanContent = content.trim();
    
    // Remover ```json ... ``` ou ``` ... ```
    if (cleanContent.startsWith('```')) {
      console.log('🧹 VT: Removendo markdown do JSON...');
      cleanContent = cleanContent.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
    }
    
    console.log('🔍 VT: Conteúdo limpo (primeiros 200 chars):', cleanContent.substring(0, 200));
    
    const parsed = JSON.parse(cleanContent);
    console.log('✅ VT: JSON parseado com sucesso!');
    return parsed;
  } catch (parseError) {
    console.error('❌ VT: Erro ao parsear JSON:', parseError);
    console.log('📄 VT: Resposta completa da IA:', content);
    throw new Error('Erro ao interpretar resposta da IA. Tente novamente.');
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
    console.log(`🚀 VT: Iniciando geração de oferta com agente "${agent}"...`);
    
    const apiKey = await getServiceAPIKey('openai');
    
    if (!apiKey) {
      throw new Error('Chave da API do OpenAI não configurada no painel administrativo');
    }

    console.log('🔑 VT: API Key obtida com sucesso');

    // 1️⃣ Buscar prompt do Firestore
    let systemPrompt = await getAgentPromptFromFirestore(agent);
    
    // 2️⃣ Fallback para prompts fixos se não encontrar no Firestore
    if (!systemPrompt) {
      console.warn('⚠️ VT: Usando prompt fallback (hardcoded)');
      
      const fallbackPrompts = {
        sophia: `Você é **Sophia Fênix**, uma IA especialista em transformar comentários emocionais em ofertas digitais de alto impacto.

INSTRUÇÕES INTERNAS (NÃO MOSTRAR AO USUÁRIO):

1️⃣ Analise o texto do usuário (mensagem de role "user") e aplique o protocolo:
   - Diagnóstico profundo
   - Geração de micro-ofertas
   - Seleção das 3 melhores ofertas
   - Desenvolvimento da oferta campeã
   - Estrutura do ebook
   - Criação do quiz
   - Criativos e CTA

2️⃣ Responda **exclusivamente em JSON válido**.  
   ❌ NÃO use Markdown, ❌ NÃO escreva texto fora do JSON.  
   ✅ O JSON deve seguir exatamente o formato abaixo:

{
  "agent":"sophia",
  "diagnostic": {
    "field": "texto curto",
    "interpretation": "texto breve explicando a dor",
    "attachmentType": "tipo de apego",
    "urgencyLevel": "high|medium|low"
  },
  "microOffers":[
    {"name":"", "promise":"", "whyConvert":"", "urgency":"", "priceSuggestion":""}
  ],
  "top3":[
    {"name":"", "why":"", "urgency":"", "marketSize":"small|medium|large"}
  ],
  "championOffer":{
    "name":"",
    "headline":"",
    "subheadline":"",
    "benefits":[ "benefit1", "benefit2" ],
    "objections":[ "objection + copy para quebrar" ],
    "price": "R$47",
    "valueAnchoring": "R$311",
    "cta":"[COMEÇAR AGORA]",
    "deliverables":[ "ebook", "quiz", "template_page" ]
  },
  "ebookOutline":[ "Capítulo 1", "Capítulo 2", "..." ],
  "quizQuestions":[ "q1", "q2", "..." ],
  "creativeSuggestions": {
    "palette":["#8B5CF6","#EC4899","#10B981"],
    "mainMockup":"descrição visual",
    "shortCopies":[ "frase1", "frase2" ]
  }
}

3️⃣ Se algo der errado, devolva:
{ "error": "descrição breve do problema" }

4️⃣ Fale sempre no tom estratégico, emocional e empático característico da Sophia Fênix.`,
        sofia: `Você é Sofia Universal, IA versátil especializada em todos os nichos.

Analise o comentário do usuário e crie uma oferta persuasiva em formato JSON válido (sem markdown):

{
  "agent": "sofia",
  "title": "Título impactante",
  "subtitle": "Subtítulo persuasivo",
  "bullets": ["✅ Benefício 1", "✅ Benefício 2", "✅ Benefício 3", "✅ Benefício 4"],
  "cta": "Call-to-action convincente",
  "bonus": "Bônus irresistível"
}

Responda APENAS com o JSON, sem texto adicional.`
      };
      
      systemPrompt = fallbackPrompts[agent] || fallbackPrompts.sophia;
    }

    console.log('📋 VT: System prompt preparado (tamanho:', systemPrompt.length, 'caracteres)');

    // 3️⃣ Estruturar mensagens corretamente: system + user
    const messages = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: comments,
      },
    ];

    console.log('💬 VT: Mensagens estruturadas:', {
      systemLength: messages[0].content.length,
      userLength: messages[1].content.length,
    });

    // 4️⃣ Chamar OpenAI com parâmetros corretos
    console.log('📡 VT: Enviando requisição para OpenAI API...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o', // VT: Usando gpt-4o (modelo mais recente, equivalente ao "gpt-5" solicitado)
        messages,
        temperature: 0.0, // VT: Temperatura 0.0 para respostas mais determinísticas
        max_tokens: 2500, // VT: 2500 tokens conforme especificado
      }),
    });

    console.log('📥 VT: Resposta recebida. Status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ VT: Erro na API OpenAI:', error);
      throw new Error(error.error?.message || 'Erro ao gerar oferta');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('📄 VT: Conteúdo recebido da IA (primeiros 300 chars):', content.substring(0, 300));

    // 5️⃣ Parse seguro do JSON
    const offerData = safeJsonParse(content);

    // 6️⃣ Validar estrutura básica (fallback para formato simples se necessário)
    if (!offerData || typeof offerData !== 'object') {
      throw new Error('Resposta da IA não é um objeto JSON válido');
    }

    // Se a resposta usar o formato completo da Sophia, mapear para formato simples
    if (offerData.championOffer) {
      console.log('🔄 VT: Convertendo formato completo para formato simples...');
      return {
        title: offerData.championOffer.headline || offerData.championOffer.name || '🎯 Oferta Especial',
        subtitle: offerData.championOffer.subheadline || '',
        bullets: offerData.championOffer.benefits || [],
        cta: offerData.championOffer.cta || '[COMEÇAR AGORA]',
        bonus: `🎁 Bônus: ${offerData.championOffer.deliverables?.join(', ') || 'Materiais exclusivos'}`,
      };
    }

    // Formato simples já está correto
    console.log('✅ VT: Oferta gerada com sucesso!');
    return offerData;

  } catch (error) {
    console.error('❌ VT: Erro ao gerar oferta:', error);
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
