// Serviço para integração com OpenAI API
import { getServiceAPIKey } from '../hooks/useAPIKeys';
import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

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
 * Função auxiliar para parsear resposta da oferta
 */
const parseOfferResponse = (content) => {
  try {
    let jsonContent = content;
    
    if (content.includes('```json')) {
      const match = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (match) jsonContent = match[1];
    } else if (content.includes('```')) {
      const match = content.match(/```\s*([\s\S]*?)\s*```/);
      if (match) jsonContent = match[1];
    }
    
    const jsonRegex = /\{[\s\S]*"title"[\s\S]*"subtitle"[\s\S]*"bullets"[\s\S]*"cta"[\s\S]*"bonus"[\s\S]*\}/;
    const jsonMatch = content.match(jsonRegex);
    if (jsonMatch && !jsonContent.includes('{')) {
      jsonContent = jsonMatch[0];
    }
    
    return JSON.parse(jsonContent.trim());
  } catch (e) {
    throw e;
  }
};

/**
 * Busca o template da agente do Firestore
 * @param {string} agentId - ID da agente (sophia ou sofia)
 * @returns {Promise<string|null>} - Prompt da agente ou null
 */
const getAgentTemplate = async (agentId) => {
  try {
    const docRef = doc(db, 'agent_templates', agentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const prompt = data.prompt || data.systemPrompt || null;
      
      if (prompt && prompt.trim().length > 0) {
        console.log(`✅ Template da agente ${agentId} carregado do Firestore (${prompt.length} caracteres)`);
        return prompt;
      } else {
        console.warn(`⚠️ Template da agente ${agentId} está vazio no Firestore`);
        return null;
      }
    }
    
    console.warn(`⚠️ Template da agente ${agentId} não encontrado no Firestore`);
    return null;
  } catch (error) {
    console.error(`❌ Erro ao buscar template da agente ${agentId}:`, error);
    return null;
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
    
    if (!apiKey) {
      throw new Error('Chave da API do OpenAI não configurada no painel administrativo');
    }

    // Buscar prompt do Firestore primeiro
    let agentPrompt = await getAgentTemplate(agent);
    
    console.log(`🔍 Debug: agentPrompt tipo=${typeof agentPrompt}, vazio=${!agentPrompt}, length=${agentPrompt?.length || 0}`);
    
    // Se não encontrar no Firestore, usar prompts fixos como fallback
    if (!agentPrompt) {
      console.log(`📝 Usando prompt fixo para ${agent} (fallback)`);
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
      agentPrompt = agentPrompts[agent] || agentPrompts.sophia;
    }

    // IMPORTANTE: Usar role "system" para o prompt (oculto) e "user" para os comentários
    // O prompt da IA NUNCA aparece na tela - apenas a resposta gerada
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Modelo com 128K tokens de contexto
        messages: [
          {
            role: 'system',
            content: agentPrompt, // Prompt completo da IA do Firestore (OCULTO, base fixa)
          },
          {
            role: 'user',
            content: `Analise estes comentários e gere a oferta completa seguindo TODO o seu protocolo:\n\n${comments}`, // Comentários do usuário
          },
        ],
        temperature: 0.9,
        max_tokens: 16000, // Muito maior para gerar resposta completa
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Erro ao gerar oferta');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('📥 Resposta da OpenAI (primeiros 500 chars):', content.substring(0, 500));
    console.log('📊 Resposta completa tem', content.length, 'caracteres');
    console.log('🔥 Agente utilizada:', agent);
    
    // Retornar TODA a resposta gerada pela IA
    // O prompt da IA está OCULTO (foi enviado como "system")
    // Apenas a resposta completa aparece na tela
    return {
      title: `🔥 Oferta Completa Gerada por ${agent === 'sophia' ? 'Sophia Fênix' : 'Sofia Universal'}`,
      subtitle: 'Veja abaixo o resultado completo da análise',
      bullets: [
        '✅ Oferta gerada seguindo todo o protocolo da IA',
        '✅ Role para baixo para ver tudo (10 ofertas, ebook, quiz, página)',
        '✅ Copie o conteúdo que precisar',
        '✅ Material completo pronto para usar'
      ],
      cta: '👉 Veja o conteúdo completo abaixo',
      bonus: '🎁 Todo o material foi gerado conforme o protocolo',
      fullContent: content, // Conteúdo completo para exibir
      agentId: agent // Salvar qual IA gerou
    };
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
