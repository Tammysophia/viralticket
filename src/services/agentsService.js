// VT: secure-agent - Serviço SEGURO para executar agentes via Cloud Functions
// NUNCA expõe prompts internos - apenas resultados
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth } from 'firebase/auth';

const FUNCTIONS_URL = import.meta.env.VITE_FUNCTIONS_URL || 'https://us-central1-viralticket.cloudfunctions.net/agents';

/**
 * Obtém token de autenticação do usuário atual
 * @returns {Promise<string>}
 */
async function getAuthToken() {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('Usuário não autenticado');
  }
  
  return await user.getIdToken();
}

/**
 * Faz requisição autenticada para a Cloud Function
 * @param {string} endpoint 
 * @param {Object} options 
 * @returns {Promise<any>}
 */
async function callFunction(endpoint, options = {}) {
  const token = await getAuthToken();
  
  const response = await fetch(`${FUNCTIONS_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(error.error || `Erro HTTP ${response.status}`);
  }
  
  return await response.json();
}

/**
 * Executa um agente de IA (Sophia Fênix ou Sophia Universal)
 * @param {string} agentId - ID do agente ('sophia-fenix' ou 'sophia-universal')
 * @param {string} userInput - Input do usuário (comentários, descrição, etc)
 * @param {Object} context - Contexto adicional (offerId, etc)
 * @returns {Promise<Object>} - Resultado da execução (SEM prompt)
 */
export async function runAgent(agentId, userInput, context = {}) {
  try {
    const result = await callFunction('/agents/run', {
      method: 'POST',
      body: JSON.stringify({
        agentId,
        userInput,
        context
      })
    });
    
    return {
      success: true,
      runId: result.runId,
      result: result.result, // Objeto com title, blocks, ebookOutline, etc
      metadata: result.metadata // agentName, executionTime, tokensUsed
    };
  } catch (error) {
    console.error('Erro ao executar agente:', error);
    throw error;
  }
}

/**
 * Lista templates de agentes disponíveis (metadata apenas, SEM prompts)
 * @returns {Promise<Array>}
 */
export async function listAgentTemplates() {
  try {
    const data = await callFunction('/agents/templates');
    return data.templates;
  } catch (error) {
    console.error('Erro ao listar templates:', error);
    return [];
  }
}

/**
 * Obtém histórico de runs do usuário
 * @param {number} limit - Limite de resultados
 * @returns {Promise<Array>}
 */
export async function getUserAgentRuns(limit = 20) {
  try {
    const data = await callFunction(`/agents/runs?limit=${limit}`);
    return data.runs;
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return [];
  }
}

/**
 * Obtém resultado de um run específico
 * @param {string} runId - ID do run
 * @returns {Promise<Object>}
 */
export async function getAgentRunResult(runId) {
  try {
    return await callFunction(`/agents/runs/${runId}`);
  } catch (error) {
    console.error('Erro ao buscar resultado:', error);
    throw error;
  }
}

// ============================================
// FUNÇÕES ADMIN (apenas para administradores)
// ============================================

/**
 * Salva ou atualiza template de agente (ADMIN apenas)
 * @param {string} agentId 
 * @param {Object} templateData 
 * @param {string} changeReason 
 * @returns {Promise<Object>}
 */
export async function saveAgentTemplate(agentId, templateData, changeReason) {
  try {
    const result = await callFunction('/admin/agents/templates', {
      method: 'POST',
      body: JSON.stringify({
        agentId,
        ...templateData,
        changeReason
      })
    });
    
    return result.template;
  } catch (error) {
    console.error('Erro ao salvar template:', error);
    throw error;
  }
}

/**
 * Desativa um template (ADMIN apenas)
 * @param {string} agentId 
 * @returns {Promise<boolean>}
 */
export async function deactivateAgentTemplate(agentId) {
  try {
    await callFunction(`/admin/agents/templates/${agentId}`, {
      method: 'DELETE'
    });
    return true;
  } catch (error) {
    console.error('Erro ao desativar template:', error);
    return false;
  }
}

/**
 * Obtém histórico de um template (ADMIN apenas)
 * @param {string} agentId 
 * @returns {Promise<Array>}
 */
export async function getAgentTemplateHistory(agentId) {
  try {
    const data = await callFunction(`/admin/agents/templates/${agentId}/history`);
    return data.history;
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return [];
  }
}

// ============================================
// HELPERS E VALIDAÇÕES
// ============================================

/**
 * Valida input do usuário antes de enviar
 * @param {string} input 
 * @returns {boolean}
 */
export function validateUserInput(input) {
  if (!input || typeof input !== 'string') {
    return false;
  }
  
  const trimmed = input.trim();
  
  if (trimmed.length < 10) {
    throw new Error('Input muito curto. Mínimo 10 caracteres.');
  }
  
  if (trimmed.length > 50000) {
    throw new Error('Input muito longo. Máximo 50.000 caracteres.');
  }
  
  return true;
}

/**
 * Formata resultado do agente para exibição
 * @param {Object} result 
 * @returns {Object}
 */
export function formatAgentResult(result) {
  // Garantir estrutura básica
  return {
    title: result.title || 'Oferta Gerada',
    subtitle: result.subtitle || '',
    description: result.description || '',
    blocks: result.blocks || [],
    ebookOutline: result.ebookOutline || [],
    quiz: result.quiz || [],
    orderBumps: result.orderBumps || []
  };
}
