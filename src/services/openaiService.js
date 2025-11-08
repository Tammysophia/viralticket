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
            content: `Analise estes comentários e gere APENAS as 4 primeiras etapas do seu protocolo:

1️⃣ DIAGNÓSTICO PROFUNDO
2️⃣ CRIAÇÃO DE OFERTAS (10 micro-ofertas)
3️⃣ SELEÇÃO DAS 3 OFERTAS MESTRES
4️⃣ ESTRUTURA DA OFERTA CAMPEÃ

⚠️ IMPORTANTE: 
- NÃO gere o Ebook (etapa 5)
- NÃO gere a Página de Vendas (etapa 6)
- NÃO gere o Copy para Criativos (etapa 7)
- Esses formatos serão gerados DEPOIS que o cliente escolher como deseja receber

Comentários para análise:
${comments}

Ao final da ESTRUTURA DA OFERTA CAMPEÃ, você DEVE retornar o JSON obrigatório com title, subtitle, bullets, cta e bonus.`, // VT: Comentários + instrução LIMITADA às 4 primeiras etapas
          },
        ],
        temperature: 0.0, // VT: Temperatura 0.0 para respostas determinísticas
        max_tokens: 4096, // VT: AUMENTADO para 4096 para garantir que não corte antes do JSON final
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
 * 🆕 VT: Gera formato específico (página/ebook/criativos) usando template do Firestore
 * Chama a IA com o template completo para gerar APENAS a seção escolhida
 * 
 * @param {string} formatType - Tipo: 'page', 'ebook' ou 'creatives'
 * @param {string} format - Formato específico: 'wordpress', 'quiz', 'ia-builder', 'canva', 'gama', 'reels', 'carousel'
 * @param {string} agent - Agente: 'sophia' ou 'sofia'
 * @param {string} offerContext - Contexto da oferta campeã já gerada
 * @returns {Promise<string>} - Conteúdo formatado específico
 */
export const generateSpecificFormat = async (formatType, format, agent = 'sophia', offerContext = '') => {
  try {
    console.log(`🎨 VT: Gerando formato específico: ${formatType}/${format} com agente ${agent}`);
    
    // 1️⃣ Buscar chave da OpenAI
    const apiKey = await getServiceAPIKey('openai');
    
    if (!apiKey) {
      throw new Error('Chave da OpenAI não configurada. Configure no painel administrativo.');
    }

    // 2️⃣ Buscar template COMPLETO do Firestore (igual geração principal)
    let agentPrompt = await getAgentTemplate(agent);
    
    if (!agentPrompt) {
      console.log(`📝 VT: Template não encontrado no Firestore, usando fallback para ${agent}`);
      // Fallback se não encontrar no Firestore
      agentPrompt = 'Você é uma especialista em marketing digital e copywriting emocional de alta conversão.';
    }

    console.log(`✅ VT: Template carregado (${agentPrompt.length} caracteres)`);

    // 3️⃣ Criar instrução específica para gerar APENAS a seção escolhida
    let userPrompt = '';

    if (formatType === 'page') {
      const formatNames = {
        'wordpress': 'Página de Vendas em WordPress/Elementor (item 7 do seu protocolo)',
        'quiz': 'Quiz Diagnóstico com 15 perguntas (item 7 do seu protocolo)',
        'ia-builder': 'Prompt para IA Builder (Lovable/Gama) (item 7 do seu protocolo)'
      };

      userPrompt = `Com base na oferta campeã abaixo, gere AGORA a ${formatNames[format]}.

📋 CONTEXTO DA OFERTA CAMPEÃ:
${offerContext}

⚠️ IMPORTANTE:
- Gere APENAS a ${formatNames[format]}
- Siga TODO o seu protocolo para este formato específico
- NÃO repita o diagnóstico profundo
- NÃO repita as 10 micro-ofertas
- NÃO repita a seleção das 3 ofertas mestres
- Vá direto para a estrutura da ${formatNames[format]}`;

    } else if (formatType === 'ebook') {
      const formatNames = {
        'canva': 'Ebook para Canva (design visual simples) (item 6 do seu protocolo)',
        'gama': 'Ebook para Gama (estrutura completa) (item 6 do seu protocolo)'
      };

      userPrompt = `Com base na oferta campeã abaixo, gere AGORA o ${formatNames[format]}.

📋 CONTEXTO DA OFERTA CAMPEÃ:
${offerContext}

⚠️ IMPORTANTE:
- Gere APENAS o ${formatNames[format]}
- Siga TODO o seu protocolo para ebook (item 6)
- Inclua TODOS os módulos e capítulos detalhados
- NÃO repita o diagnóstico profundo
- NÃO repita as 10 micro-ofertas
- NÃO repita a seleção das 3 ofertas mestres`;

    } else if (formatType === 'creatives') {
      userPrompt = `Com base na oferta campeã abaixo, gere AGORA o COPY PARA CRIATIVOS RÁPIDOS (item 8 do seu protocolo).

📋 CONTEXTO DA OFERTA CAMPEÃ:
${offerContext}

⚠️ IMPORTANTE:
- Gere APENAS o copy para criativos rápidos
- Inclua:
  * 5 frases curtas para Reels (5-8 palavras)
  * Copy completo para Carrossel (10 slides)
  * Headlines para anúncios
- Siga TODO o seu protocolo para este formato
- NÃO repita o diagnóstico, ofertas ou análises`;
    }

    // 4️⃣ Chamar OpenAI com template COMPLETO do Firestore
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o', // VT: Mesmo modelo da geração principal
        messages: [
          {
            role: 'system',
            content: agentPrompt, // VT: Template COMPLETO do Firestore
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        temperature: 0.0,
        max_tokens: 4096, // VT: Suficiente para formatos completos
      }),
    });

    console.log('📥 VT: Resposta recebida. Status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ VT: Erro na API OpenAI:', error);
      throw new Error(error.error?.message || 'Erro ao gerar formato');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log(`✅ VT: Formato ${formatType}/${format} gerado (${content.length} caracteres)`);
    
    return content;
  } catch (error) {
    console.error(`❌ VT: Erro ao gerar formato ${formatType}/${format}:`, error);
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
