// VT: secure-agent - Serviço para executar agentes e salvar runs
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getDecryptedPrompt } from './agentTemplateService.js';
import { hashPrompt } from '../utils/encryption.js';

const db = getFirestore();

/**
 * Sanitiza input do usuário para prevenir injeções
 * @param {string} input - Input do usuário
 * @returns {string} - Input sanitizado
 */
function sanitizeUserInput(input) {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Remove scripts, tags HTML perigosos e caracteres especiais
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
    .slice(0, 50000); // Limite de 50k caracteres
}

/**
 * Valida e aplica rate limiting por usuário
 * @param {string} userId - ID do usuário
 * @param {string} agentId - ID do agente
 * @returns {Promise<boolean>} - True se permitido
 */
async function checkRateLimit(userId, agentId) {
  const now = Date.now();
  const oneHourAgo = now - (60 * 60 * 1000);
  
  // Verificar quantos runs nas últimas 1h
  const recentRuns = await db.collection('agent_runs')
    .where('userId', '==', userId)
    .where('agentId', '==', agentId)
    .where('createdAt', '>', new Date(oneHourAgo))
    .count()
    .get();
  
  const count = recentRuns.data().count;
  
  // Limite: 20 runs por hora por agente
  const RATE_LIMIT = 20;
  
  if (count >= RATE_LIMIT) {
    throw new Error(`Limite de ${RATE_LIMIT} execuções por hora atingido. Tente novamente mais tarde.`);
  }
  
  return true;
}

/**
 * Monta o prompt final combinando template + input do usuário
 * @param {string} templatePrompt - Prompt do template
 * @param {string} userInput - Input sanitizado do usuário
 * @param {Object} context - Contexto adicional (offerId, etc)
 * @returns {string} - Prompt final
 */
function buildFinalPrompt(templatePrompt, userInput, context = {}) {
  let finalPrompt = templatePrompt;
  
  // Adicionar input do usuário
  finalPrompt += `\n\n=== INPUT DO USUÁRIO ===\n${userInput}\n\n`;
  
  // Adicionar contexto se existir
  if (context.offerId) {
    finalPrompt += `OfferID: ${context.offerId}\n`;
  }
  
  // Instruções de formato de saída
  finalPrompt += `\n=== FORMATO DE SAÍDA ===
Retorne APENAS um objeto JSON válido com a seguinte estrutura:
{
  "title": "Título impactante da oferta",
  "subtitle": "Subtítulo persuasivo",
  "description": "Descrição detalhada",
  "blocks": [
    {
      "type": "hero|benefits|testimonial|cta|bonus",
      "content": "Conteúdo do bloco",
      "data": {}
    }
  ],
  "ebookOutline": [
    {
      "chapter": "Título do capítulo",
      "topics": ["Tópico 1", "Tópico 2"]
    }
  ],
  "quiz": [
    {
      "question": "Pergunta",
      "options": ["A", "B", "C"],
      "correct": 0
    }
  ],
  "orderBumps": [
    {
      "title": "Order Bump",
      "description": "Descrição",
      "price": 47
    }
  ]
}

NÃO inclua explicações, comentários ou texto fora do JSON.`;
  
  return finalPrompt;
}

/**
 * Executa um agente de IA
 * @param {Object} params - Parâmetros da execução
 * @param {string} params.userId - ID do usuário
 * @param {string} params.agentId - ID do agente
 * @param {string} params.userInput - Input do usuário
 * @param {Object} params.context - Contexto adicional
 * @param {Object} openaiClient - Cliente OpenAI instanciado
 * @returns {Promise<Object>} - Resultado da execução
 */
export async function executeAgent(params, openaiClient) {
  const { userId, agentId, userInput, context = {} } = params;
  
  // Validações
  if (!userId || !agentId || !userInput) {
    throw new Error('Parâmetros obrigatórios faltando: userId, agentId, userInput');
  }
  
  // Rate limiting
  await checkRateLimit(userId, agentId);
  
  // Sanitizar input
  const sanitizedInput = sanitizeUserInput(userInput);
  
  if (!sanitizedInput) {
    throw new Error('Input inválido ou vazio após sanitização');
  }
  
  // Obter template descriptografado (NUNCA vaza para frontend)
  const templatePrompt = await getDecryptedPrompt(agentId);
  const promptHash = hashPrompt(templatePrompt);
  
  // Montar prompt final
  const finalPrompt = buildFinalPrompt(templatePrompt, sanitizedInput, context);
  
  // Buscar configurações do template
  const template = await db.collection('agent_templates').doc(agentId).get();
  const templateData = template.data();
  
  // Executar OpenAI
  const startTime = Date.now();
  let openaiResponse;
  
  try {
    openaiResponse = await openaiClient.chat.completions.create({
      model: templateData.model || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: finalPrompt
        }
      ],
      temperature: templateData.temperature || 0.7,
      max_tokens: templateData.max_tokens || 1500,
      response_format: { type: 'json_object' }
    });
  } catch (apiError) {
    console.error('Erro na API OpenAI:', apiError);
    throw new Error(`Erro ao processar com IA: ${apiError.message}`);
  }
  
  const executionTime = Date.now() - startTime;
  
  // Extrair resultado
  const rawContent = openaiResponse.choices[0].message.content;
  
  // Parse JSON de forma segura
  let parsedResult;
  try {
    parsedResult = JSON.parse(rawContent);
  } catch (parseError) {
    console.error('Erro ao parsear resposta:', rawContent);
    throw new Error('Resposta da IA não está em formato JSON válido');
  }
  
  // Criar registro do run
  const runDoc = await db.collection('agent_runs').add({
    userId,
    agentId,
    promptHash, // Hash do prompt, NÃO o prompt
    inputLength: sanitizedInput.length,
    outputSummary: parsedResult.title || 'Sem título',
    tokens: openaiResponse.usage?.total_tokens || 0,
    executionTime,
    model: templateData.model || 'gpt-4o-mini',
    status: 'success',
    createdAt: FieldValue.serverTimestamp(),
    context
  });
  
  // Salvar resultado completo (para o usuário acessar depois)
  await db.collection('agent_outputs').doc(runDoc.id).set({
    runId: runDoc.id,
    userId,
    agentId,
    result: parsedResult,
    createdAt: FieldValue.serverTimestamp()
  });
  
  // Se há offerId no contexto, vincular
  if (context.offerId) {
    await db.collection('offers').doc(context.offerId).update({
      aiGeneratedBy: agentId,
      aiRunId: runDoc.id,
      lastUpdated: FieldValue.serverTimestamp()
    });
  }
  
  // Retornar apenas o resultado (NUNCA o prompt)
  return {
    runId: runDoc.id,
    result: parsedResult,
    metadata: {
      agentId,
      agentName: templateData.name,
      executionTime,
      tokensUsed: openaiResponse.usage?.total_tokens || 0
    }
  };
}

/**
 * Obtém histórico de runs de um usuário
 * @param {string} userId - ID do usuário
 * @param {number} limit - Limite de resultados
 * @returns {Promise<Array>} - Lista de runs
 */
export async function getUserRuns(userId, limit = 20) {
  const snapshot = await db.collection('agent_runs')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    // NÃO retornar promptHash (só para auditoria interna)
    promptHash: undefined
  }));
}

/**
 * Obtém resultado de um run específico
 * @param {string} runId - ID do run
 * @param {string} userId - ID do usuário (para validação)
 * @returns {Promise<Object>} - Resultado completo
 */
export async function getRunResult(runId, userId) {
  const outputDoc = await db.collection('agent_outputs').doc(runId).get();
  
  if (!outputDoc.exists) {
    throw new Error('Resultado não encontrado');
  }
  
  const data = outputDoc.data();
  
  // Verificar se o usuário tem permissão
  if (data.userId !== userId) {
    throw new Error('Acesso negado');
  }
  
  return {
    id: runId,
    result: data.result,
    createdAt: data.createdAt?.toDate()
  };
}
