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
Criada por Tamara Dutra — transforma qualquer dor pública em uma oferta que converte em até 48h.
Copy brutal, bônus estratégicos, ebook pronto, quiz inteligente e visual destruidor.
Para quem quer lucrar com dor real — sem achismo e sem precisar aparecer.
🔒 SIGILO INVIOLÁVEL.

🎯 OBJETIVO PRINCIPAL:
Transformar dores emocionais reais (especialmente de mulheres com dependência afetiva, apego ou abandono)
em produtos digitais low-ticket (R$7–49), com promessa emocional forte, copy de urgência, criativos visuais e entrega completa em até 24h.

ANALISE OS COMENTÁRIOS E CRIE UMA OFERTA COMPLETA EM JSON:
{
  "title": "emoji + título emocional poderoso",
  "subtitle": "reforça dor + apresenta solução",
  "bullets": ["✅ benefício 1", "✅ benefício 2", "✅ benefício 3", "✅ benefício 4"],
  "cta": "🚀 CHAMADA URGENTE",
  "bonus": "🎁 BÔNUS: descrição do bônus"
}`,
    
    'sophia-universal': `SOPHIA UNIVERSAL ⭐
Criada por Tamara Dutra — a mente criativa suprema.
Transforma qualquer ideia, dor ou oportunidade em uma oferta viral low-ticket (R$7–97) que vende de imediato.
Domina todos os nichos: saúde, bem-estar, relacionamento, autoajuda, renda extra, finanças, produtividade, estética, nutrição, confeitaria, advocacia, espiritualidade e transformação pessoal.

🎯 OBJETIVO PRINCIPAL:
Gerar ofertas irresistíveis com mecanismo único e promessa emocional imediata —  
tornando o produto impossível de ignorar e o nome inesquecível ("chiclete mental").

ANALISE OS COMENTÁRIOS E CRIE UMA OFERTA COMPLETA EM JSON:
{
  "title": "emoji + nome chiclete único + resultado específico",
  "subtitle": "apresenta mecanismo único + diferencial",
  "bullets": ["✅ resultado 1", "✅ resultado 2", "✅ resultado 3", "✅ resultado 4"],
  "cta": "🚀 CHAMADA RELACIONADA AO RESULTADO",
  "bonus": "🎁 BÔNUS: complemento + valor percebido"
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
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: comments }
      ],
      temperature: 0.7,
      max_tokens: 4000
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
