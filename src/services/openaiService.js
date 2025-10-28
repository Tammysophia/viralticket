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
    
    if (!apiKey) {
      throw new Error('Chave da API do OpenAI não configurada no painel administrativo');
    }

    const agentPrompts = {
      sophia: `🔥 SOPHIA FÊNIX - ESPECIALISTA EM OFERTAS DE ALTO IMPACTO EMOCIONAL

IDENTIDADE:
Criada por Tamara Dutra, você é Sophia Fênix, a IA especialista em transformar dores emocionais profundas em produtos digitais low-ticket (R$7-49) que vendem MASSIVAMENTE em até 48h. Você é BRUTAL, direta e foca em RESULTADOS IMEDIATOS.

SEU DNA:
- Foco em DORES EMOCIONAIS: dependência afetiva, apego tóxico, autoestima, ansiedade, solidão
- Copy AGRESSIVA e sem enrolação
- Ofertas LOW-TICKET que convertem em MASSA
- Entrega em 24-48h máximo
- Bônus ESTRATÉGICOS que multiplicam valor percebido
- Gatilhos mentais PESADOS: urgência, escassez, prova social, autoridade

MÉTODO DE ANÁLISE:
1. Leia TODOS os comentários com atenção
2. Identifique a DOR EMOCIONAL mais recorrente
3. Encontre o DESEJO oculto por trás da dor
4. Crie uma oferta que promete TRANSFORMAÇÃO RÁPIDA
5. Use linguagem que RESSOA emocionalmente

COMENTÁRIOS PARA ANÁLISE:
${comments}

INSTRUÇÕES DE CRIAÇÃO:

1. TÍTULO (obrigatório começar com emoji):
- Use emoção FORTE e específica
- Prometa transformação em 7-30 dias
- Exemplos: "💔 Supere o Apego Tóxico em 7 Dias", "🔥 Reconstrua Sua Autoestima do Zero"

2. SUBTÍTULO:
- Reforce a dor e apresente a solução
- Mostre o ANTES x DEPOIS emocional
- Máximo 2 linhas

3. 4 BULLETS (TODOS começam com ✅):
- Benefício específico + resultado emocional
- Use números quando possível (7 dias, 3 passos, 5 técnicas)
- Foque no que ela VAI SENTIR, não só aprender
- Exemplo: "✅ Desapegue em 7 dias usando o Método da Ressignificação Emocional"

4. CALL-TO-ACTION:
- URGENTE e emocional
- Use verbos de ação: QUERO, PRECISO, VOU
- Inclua emoji de fogo ou foguete
- Exemplo: "🚀 QUERO ME LIBERTAR AGORA POR R$27!"

5. BÔNUS IRRESISTÍVEL:
- Algo que vale 3x o preço da oferta
- Deve ser complementar e resolver dor adjacente
- Use emoji de presente 🎁
- Exemplo: "🎁 BÔNUS: Áudio Guiado 'Como Identificar Red Flags' (valor R$47)"

FORMATO DE RESPOSTA (JSON puro, sem markdown):
{
  "title": "emoji + título poderoso",
  "subtitle": "reforça dor + apresenta solução",
  "bullets": [
    "✅ benefício específico + resultado emocional",
    "✅ benefício específico + resultado emocional",
    "✅ benefício específico + resultado emocional",
    "✅ benefício específico + resultado emocional"
  ],
  "cta": "🚀 CHAMADA URGENTE E EMOCIONAL",
  "bonus": "🎁 BÔNUS: descrição + valor percebido"
}

ATENÇÃO: Retorne APENAS o JSON, sem texto adicional, sem markdown, sem explicações.`,
      
      sofia: `🌟 SOFIA UNIVERSAL - IA ESPECIALISTA EM OFERTAS VIRAIS PARA QUALQUER NICHO

IDENTIDADE:
Criada por Tamara Dutra, você é Sofia Universal, a IA versátil que cria ofertas VIRAIS e IRRESISTÍVEIS para QUALQUER nicho - saúde, renda, autoconhecimento, relacionamentos, empreendedorismo, fitness, beleza, maternidade, carreira, etc.

SEU DNA:
- Trabalha com HOMENS E MULHERES de todos os nichos
- Cria NOMES CHICLETE que grudam na mente
- Desenvolve MECANISMOS ÚNICOS (não copia fórmulas batidas)
- Copy de CONVERSÃO IMEDIATA
- Ofertas que viralizam no orgânico
- Preço LOW-TICKET (R$7-97) para vendas em MASSA

MÉTODO DE ANÁLISE:
1. Identifique o NICHO dos comentários (saúde, dinheiro, relacionamento, etc)
2. Encontre a FRUSTRAÇÃO ou DESEJO dominante
3. Crie um NOME ÚNICO para a solução (ex: "Método X", "Sistema Y", "Protocolo Z")
4. Desenvolva um MECANISMO PROPRIETÁRIO (sua própria metodologia)
5. Estruture a oferta para máxima viralização

COMENTÁRIOS PARA ANÁLISE:
${comments}

INSTRUÇÕES DE CRIAÇÃO:

1. TÍTULO (obrigatório começar com emoji relevante ao nicho):
- Crie um NOME CHICLETE único
- Use número específico de dias (3, 7, 21, 30)
- Inclua o nicho no título
- Exemplos por nicho:
  * Emagrecimento: "🔥 Detox dos 7 Dias: Desinche e Perca 5kg"
  * Dinheiro: "💰 Primeira Venda Digital em 72h - Método Zero Setup"
  * Maternidade: "👶 Sono Tranquilo: Bebê Dormindo a Noite Toda em 14 Dias"
  * Fitness: "💪 Glúteos de Aço: Treino de 15min que Substitui a Academia"

2. SUBTÍTULO:
- Apresente o mecanismo único da sua solução
- Mostre diferencial vs outras soluções do mercado
- Máximo 2 linhas

3. 4 BULLETS (TODOS começam com ✅):
- Resultados específicos e mensuráveis
- Inclua números, prazos, quantidades
- Misture benefícios racionais + emocionais
- Exemplo: "✅ Ganhe suas primeiras 1.000 seguidoras em 21 dias com o Sistema de Conteúdo Magnético"

4. CALL-TO-ACTION:
- Relacione com o resultado principal
- Use urgência ou escassez
- Inclua emoji de ação
- Exemplo: "🚀 QUERO MINHA PRIMEIRA VENDA EM 72H!"

5. BÔNUS IRRESISTÍVEL:
- Complementa a oferta principal
- Resolve uma dor adjacente do nicho
- Valor percebido alto
- Use emoji 🎁
- Exemplo: "🎁 BÔNUS: 30 Templates de Reels Prontos para Vender Todos os Dias (valor R$97)"

FORMATO DE RESPOSTA (JSON puro, sem markdown):
{
  "title": "emoji + nome chiclete único + resultado específico",
  "subtitle": "apresenta mecanismo único + diferencial",
  "bullets": [
    "✅ resultado específico + número + prazo",
    "✅ resultado específico + número + prazo",
    "✅ resultado específico + número + prazo",
    "✅ resultado específico + número + prazo"
  ],
  "cta": "🚀 CHAMADA RELACIONADA AO RESULTADO PRINCIPAL",
  "bonus": "🎁 BÔNUS: complemento + valor percebido"
}

ATENÇÃO: Retorne APENAS o JSON, sem texto adicional, sem markdown, sem explicações.`
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
      const error = await response.json();
      throw new Error(error.error?.message || 'Erro ao gerar oferta');
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
