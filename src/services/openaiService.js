// Serviço para integração com OpenAI API
import { getServiceAPIKey } from '../hooks/useAPIKeys';
import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * VT: Gera oferta MOCK para demonstração (quando não há API key)
 * @param {string} comments - Comentários para análise
 * @param {string} agent - Agente IA
 * @returns {Promise<Object>} - Oferta mock
 */
const generateMockOffer = async (comments, agent) => {
  console.log('🎭 VT: Gerando oferta DEMO (modo demonstração)...');
  
  // Simular delay da API
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const mockOffers = {
    sophia: {
      title: '🔥 Transforme Seu Medo em Motivação',
      subtitle: 'Descubra como superar bloqueios emocionais e alcançar seus objetivos',
      bullets: [
        '✅ Método comprovado para vencer o medo do fracasso',
        '✅ Técnicas práticas aplicáveis hoje mesmo',
        '✅ Comunidade de apoio com pessoas na mesma jornada',
        '✅ Garantia de 7 dias ou seu dinheiro de volta',
      ],
      cta: '🚀 QUERO TRANSFORMAR MINHA VIDA AGORA!',
      bonus: '🎁 BÔNUS: E-book "Os 7 Passos Para Superar Qualquer Medo"',
    },
    sofia: {
      title: '🌟 Desperte Seu Potencial Máximo',
      subtitle: 'Um guia completo para alcançar seus sonhos sem limitações',
      bullets: [
        '✅ Estratégias testadas por milhares de pessoas',
        '✅ Passo a passo simples e direto',
        '✅ Resultados visíveis em 30 dias',
        '✅ Suporte dedicado durante toda sua jornada',
      ],
      cta: '🚀 COMEÇAR MINHA TRANSFORMAÇÃO!',
      bonus: '🎁 BÔNUS: Planilha de Acompanhamento de Resultados',
    },
  };
  
  console.log('✅ VT: Oferta DEMO gerada com sucesso!');
  console.log('💡 VT: DICA: Configure uma API Key real no painel Admin para usar a IA de verdade!');
  
  return mockOffers[agent] || mockOffers.sophia;
};

/**
 * VT: Busca o prompt do agente no Firestore
 * @param {string} agentId - ID do agente (sophia, sofia)
 * @returns {Promise<string|null>} - Prompt personalizado ou null
 */
const getAgentPromptFromFirestore = async (agentId) => {
  console.log(`🔍 VT: Buscando prompt do agente "${agentId}" no Firestore...`);
  
  try {
    if (!db) {
      console.warn('⚠️ VT: Firestore não configurado, usando prompt fallback');
      return null;
    }

    const docRef = doc(db, 'agent_templates', agentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const prompt = docSnap.data().prompt;
      console.log(`✅ VT: Prompt encontrado para "${agentId}"`, { hasPrompt: !!prompt });
      return prompt;
    } else {
      console.warn(`⚠️ VT: Documento "agent_templates/${agentId}" não encontrado no Firestore`);
      return null;
    }
  } catch (error) {
    console.error('❌ VT: Erro ao buscar prompt do Firestore:', error);
    return null;
  }
};

/**
 * VT: Parse seguro de JSON removendo markdown se necessário
 * @param {string} content - Conteúdo para parsear
 * @returns {Object} - JSON parseado
 */
const safeJsonParse = (content) => {
  console.log('📝 VT: Tentando parsear JSON da resposta da IA...');
  
  let cleanContent = content.trim();
  
  // VT: Remover blocos de markdown ```json``` se presentes
  if (cleanContent.startsWith('```json')) {
    console.log('🧹 VT: Removendo markdown do JSON...');
    cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
  } else if (cleanContent.startsWith('```')) {
    console.log('🧹 VT: Removendo markdown genérico do JSON...');
    cleanContent = cleanContent.replace(/^```\s*/, '').replace(/```\s*$/, '').trim();
  }
  
  try {
    const parsed = JSON.parse(cleanContent);
    console.log('✅ VT: JSON parseado com sucesso!');
    return parsed;
  } catch (parseError) {
    console.error('❌ VT: Erro ao parsear JSON:', parseError);
    console.log('📄 VT: Conteúdo que tentou parsear:', cleanContent.substring(0, 500));
    throw new Error('A IA retornou uma resposta inválida. Por favor, tente novamente.');
  }
};

/**
 * VT: Prompts fallback hardcoded (caso não encontre no Firestore)
 */
const FALLBACK_PROMPTS = {
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
  "title": "🎯 Título impactante com emoji",
  "subtitle": "Subtítulo persuasivo que amplifica a promessa",
  "bullets": [
    "✅ Benefício transformador 1",
    "✅ Benefício transformador 2", 
    "✅ Benefício transformador 3",
    "✅ Benefício transformador 4"
  ],
  "cta": "🚀 CALL TO ACTION PODEROSO",
  "bonus": "🎁 Bônus irresistível que agrega valor"
}

3️⃣ Se algo der errado, devolva:
{ "error": "descrição breve do problema" }

4️⃣ Fale sempre no tom estratégico, emocional e empático característico da Sophia Fênix.`,
  
  sofia: `Você é **Sofia Universal**, IA versátil especializada em todos os nichos.

Analise o comentário do usuário e crie uma oferta personalizada e persuasiva.

Responda APENAS em JSON válido (sem markdown):

{
  "title": "🌟 Título impactante",
  "subtitle": "Subtítulo persuasivo",
  "bullets": [
    "✅ Benefício 1",
    "✅ Benefício 2",
    "✅ Benefício 3",
    "✅ Benefício 4"
  ],
  "cta": "🚀 CALL TO ACTION",
  "bonus": "🎁 Bônus especial"
}`
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
 * VT: Gera uma oferta irresistível usando GPT
 * @param {string} comments - Comentários para análise
 * @param {string} agent - Agente IA (sophia ou sofia)
 * @returns {Promise<Object>} - Oferta gerada
 */
export const generateOffer = async (comments, agent = 'sophia') => {
  console.log(`🚀 VT: Iniciando geração de oferta com agente "${agent}"...`);
  
  try {
    // 1. Obter API Key
    const apiKey = await getServiceAPIKey('openai');
    
    // VT: MODO DEMONSTRAÇÃO - Se não tiver API key configurada
    if (!apiKey || apiKey.includes('••••')) {
      console.warn('⚠️ VT: API Key não configurada, usando MODO DEMONSTRAÇÃO');
      return generateMockOffer(comments, agent);
    }
    console.log('🔑 VT: API Key obtida com sucesso');

    // 2. Buscar prompt personalizado do Firestore
    let systemPrompt = await getAgentPromptFromFirestore(agent);
    
    // 3. Se não encontrou, usar fallback
    if (!systemPrompt) {
      console.log('⚠️ VT: Usando prompt fallback (hardcoded)');
      systemPrompt = FALLBACK_PROMPTS[agent] || FALLBACK_PROMPTS.sophia;
    }
    
    console.log('📋 VT: System prompt preparado (tamanho: ' + systemPrompt.length + ' caracteres)');

    // 4. Estruturar mensagens corretamente (system + user)
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
    
    console.log('💬 VT: Mensagens estruturadas:', { 
      systemLength: messages[0].content.length, 
      userLength: messages[1].content.length 
    });

    // 5. Fazer requisição para OpenAI
    console.log('📡 VT: Enviando requisição para OpenAI API...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o', // VT: Atualizado de gpt-4 para gpt-4o
        messages: messages,
        temperature: 0.0, // VT: Respostas determinísticas
        max_tokens: 2500, // VT: Aumentado de 1000 para 2500
      }),
    });

    console.log('📥 VT: Resposta recebida. Status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ VT: Erro da OpenAI API:', error);
      throw new Error(error.error?.message || 'Erro ao gerar oferta');
    }

    // 6. Extrair conteúdo
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('📄 VT: Conteúdo recebido da IA (primeiros 300 chars):', content.substring(0, 300));
    
    // 7. Parse seguro do JSON
    const offerData = safeJsonParse(content);
    
    // 8. Validar estrutura da oferta
    if (!offerData.title || !offerData.subtitle || !offerData.bullets) {
      console.warn('⚠️ VT: Oferta com estrutura incompleta, usando valores padrão');
      return {
        title: offerData.title || '🎯 Oferta Especial para Você!',
        subtitle: offerData.subtitle || 'Transforme sua realidade agora',
        bullets: offerData.bullets || [
          '✅ Acesso imediato ao conteúdo',
          '✅ Suporte dedicado',
          '✅ Garantia de satisfação',
          '✅ Bônus exclusivos',
        ],
        cta: offerData.cta || '🚀 QUERO APROVEITAR AGORA!',
        bonus: offerData.bonus || '🎁 Bônus: Material complementar gratuito',
      };
    }

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
