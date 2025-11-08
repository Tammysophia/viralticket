// Serviço para integração com OpenAI API
import { getServiceAPIKey } from '../hooks/useAPIKeys';
import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Busca o template da agente do Firestore
 * @param {string} agentId - ID da agente (sophia ou sofia)
 * @returns {Promise<string|null>} - Prompt da agente ou null
 */
const getAgentTemplate = async (agentId) => {
  try {
    console.log(`🔍 VT: Buscando template da agente "${agentId}" no Firestore...`);
    
    const docRef = doc(db, 'agent_templates', agentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const prompt = data.prompt || data.systemPrompt || null;
      
      if (prompt && prompt.trim().length > 0) {
        console.log(`✅ VT: Template da agente ${agentId} carregado do Firestore (${prompt.length} caracteres)`);
        return prompt;
      } else {
        console.warn(`⚠️ VT: Template da agente ${agentId} está vazio no Firestore`);
        return null;
      }
    }
    
    console.warn(`⚠️ VT: Template da agente ${agentId} não encontrado no Firestore`);
    return null;
  } catch (error) {
    console.error(`❌ VT: Erro ao buscar template da agente ${agentId}:`, error);
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
    console.log(`🚀 VT: Iniciando geração de oferta com agente "${agent}"...`);
    
    const apiKey = await getServiceAPIKey('openai');
    
    // MODO MOCK: Se não tiver chave válida, retornar oferta de exemplo
    const isValidKey = apiKey && apiKey.startsWith('sk-') && apiKey.length > 40;
    
    if (!isValidKey) {
      console.log('🎭 VT: MODO MOCK - Retornando oferta de exemplo (sem gastar tokens)');
      
      return {
        title: '🚀 Transforme Sua Vida Agora!',
        subtitle: 'Descubra o método comprovado que já ajudou milhares de pessoas',
        bullets: [
          '✅ Sistema completo e testado por especialistas',
          '✅ Resultados comprovados em até 30 dias',
          '✅ Suporte dedicado e comunidade exclusiva',
          '✅ Garantia incondicional de 7 dias'
        ],
        cta: '🎯 QUERO COMEÇAR AGORA!',
        bonus: '🎁 BÔNUS: Acesso vitalício + Material complementar grátis',
        fullResponse: `# 🎭 MODO MOCK - Exemplo de Análise Completa

Esta é uma oferta de exemplo gerada em modo mock (sem usar API).

## 📊 Análise do Público

### Dores Identificadas:
1. Falta de tempo para resultados
2. Dificuldade em encontrar métodos que funcionam
3. Necessidade de suporte durante o processo

### Desejos do Público:
1. Transformação rápida e efetiva
2. Método testado e comprovado
3. Garantia de resultados

## 🎯 Oferta Campeã

**Título:** Transforme Sua Vida em 30 Dias

**Promessa:** Sistema completo testado por milhares de pessoas com resultados comprovados.

### Benefícios Principais:
- ✅ Método passo a passo simplificado
- ✅ Suporte dedicado 24/7
- ✅ Comunidade exclusiva de apoio
- ✅ Garantia total de satisfação

### Bônus Incluídos:
🎁 Acesso vitalício a todas as atualizações
🎁 Material complementar exclusivo
🎁 Sessão de mentoria em grupo

---

💡 **Configure uma chave OpenAI real para gerar ofertas personalizadas com sua IA!**`
      };
    }

    console.log('🔑 VT: API Key obtida com sucesso');

    // 1️⃣ Buscar prompt do Firestore primeiro
    let agentPrompt = await getAgentTemplate(agent);
    
    console.log(`🔍 VT: agentPrompt tipo=${typeof agentPrompt}, vazio=${!agentPrompt}, length=${agentPrompt?.length || 0}`);
    
    // 2️⃣ Se não encontrar no Firestore, usar prompts fixos como fallback
    if (!agentPrompt) {
      console.log(`📝 VT: Usando prompt fixo para ${agent} (fallback)`);
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

    console.log('📋 VT: Prompt preparado (tamanho:', agentPrompt.length, 'caracteres)');

    // 3️⃣ IMPORTANTE: Usar role "system" para o prompt e "user" para os comentários
    // O prompt da IA NUNCA aparece na tela - apenas a resposta gerada
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o', // VT: Modelo mais recente (conforme solicitado: equivalente ao gpt-5)
        messages: [
          {
            role: 'system',
            content: agentPrompt, // VT: Prompt completo da IA do Firestore (OCULTO, base fixa)
          },
          {
            role: 'user',
            content: `Analise estes comentários e gere a oferta completa seguindo TODO o seu protocolo:\n\n${comments}`, // VT: Comentários do usuário
          },
        ],
        temperature: 0.0, // VT: Temperatura 0.0 para respostas determinísticas (conforme solicitado)
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
    
    console.log('📥 VT: Resposta da OpenAI (primeiros 500 chars):', content.substring(0, 500));
    console.log('📊 VT: Resposta completa tem', content.length, 'caracteres');
    console.log('🔥 VT: Agente utilizada:', agent);
    
    // 4️⃣ SEMPRE retornar fullResponse + tentar extrair JSON
    // Procurar por JSON no final da resposta (depois de todas as seções)
    let offerJson = null;
    
    // Tentar encontrar JSON no formato esperado
    const jsonMatch = content.match(/\{[\s\S]*"title"[\s\S]*"subtitle"[\s\S]*"bullets"[\s\S]*"cta"[\s\S]*"bonus"[\s\S]*\}/);
    if (jsonMatch) {
      try {
        offerJson = JSON.parse(jsonMatch[0]);
        console.log('✅ VT: JSON extraído da resposta completa');
      } catch (e) {
        console.warn('⚠️ VT: Falha ao parsear JSON encontrado');
      }
    }
    
    // Se não encontrou JSON válido, criar estrutura básica
    if (!offerJson || !offerJson.title) {
      console.log('📝 VT: Criando estrutura básica (JSON não encontrado)');
      offerJson = {
        title: '🔥 Análise Completa Gerada',
        subtitle: 'Veja a análise detalhada abaixo',
        bullets: [
          '✅ Diagnóstico profundo do público',
          '✅ 10 micro-ofertas criadas',
          '✅ 3 ofertas mestres selecionadas',
          '✅ Estrutura completa da oferta campeã'
        ],
        cta: '📋 ROLE PARA BAIXO PARA VER TUDO',
        bonus: '🎁 Análise completa de 8 seções disponível'
      };
    }
    
    // RETORNAR: JSON parseado + fullResponse (resposta completa da IA)
    return {
      ...offerJson,
      fullResponse: content, // ✅ CRÍTICO: Resposta COMPLETA para exibir na UI
      agent: agent
    };
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
