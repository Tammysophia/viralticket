// Serviço para gerenciamento de prompts de IA
import { db } from '../config/firebase';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';

// ⚠️ TAMARA: COLE SEU PROMPT REAL AQUI ⬇️
// Substitua todo o texto entre as aspas invertidas por seu prompt completo
const MVP_PROMPTS = {
  sophia: `Você é Sophia Fênix, especialista em criar ofertas de alto impacto que convertem. 
Analise os seguintes comentários e crie uma oferta irresistível que atenda às dores e desejos do público.

Comentários:
{{comments}}

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
{{comments}}

Crie uma oferta completa com elementos persuasivos em formato JSON:
{
  "title": "",
  "subtitle": "",
  "bullets": ["", "", "", ""],
  "cta": "",
  "bonus": ""
}`
};
// ⚠️ TAMARA: COLE SEU PROMPT REAL ACIMA ⬆️

// Cache de prompts para evitar múltiplas requisições
let promptsCache = null;
let lastCacheTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Busca um prompt do Firestore ou retorna fallback
 * @param {string} agentId - ID do agente (sophia, sofia)
 * @returns {Promise<string>} - Prompt do agente
 */
export const getAgentPrompt = async (agentId = 'sophia') => {
  try {
    // 🚀 MODO EMERGÊNCIA: Usar prompt do código diretamente
    const hardcodedPrompt = MVP_PROMPTS[agentId] || MVP_PROMPTS.sophia;
    console.log(`[AGENTS][SUCCESS] Usando prompt do código para ${agentId} (${hardcodedPrompt.length} chars)`);
    return hardcodedPrompt;
    
    /* DESABILITADO TEMPORARIAMENTE - Firestore
    // Verificar cache
    if (promptsCache && lastCacheTime && (Date.now() - lastCacheTime < CACHE_DURATION)) {
      const cachedPrompt = promptsCache[agentId];
      if (cachedPrompt) {
        console.log(`[AGENTS][INFO] Usando prompt em cache para ${agentId} (${cachedPrompt.length} chars)`);
        return cachedPrompt;
      }
    }

    // Verificar se Firebase está configurado
    if (!db) {
      console.warn('[AGENTS][WARN] Firebase não configurado, usando MVP hardcoded prompt');
      return MVP_PROMPTS[agentId] || MVP_PROMPTS.sophia;
    }

    // Buscar do Firestore (coleção agent_templates)
    const promptRef = doc(db, 'agent_templates', agentId);
    const promptSnap = await getDoc(promptRef);

    if (promptSnap.exists()) {
      const promptData = promptSnap.data();
      const prompt = promptData.content || promptData.prompt || '';
      
      if (prompt.length > 0) {
        // Atualizar cache
        if (!promptsCache) promptsCache = {};
        promptsCache[agentId] = prompt;
        lastCacheTime = Date.now();
        
        console.log(`[AGENTS][SUCCESS] Prompt carregado do Firestore para ${agentId} (${prompt.length} chars)`);
        return prompt;
      }
    }

    // Fallback para MVP
    console.warn(`[AGENTS][WARN] Prompt não encontrado no Firestore para ${agentId}, usando MVP hardcoded`);
    return MVP_PROMPTS[agentId] || MVP_PROMPTS.sophia;
    */

  } catch (error) {
    // Fallback silencioso para MVP
    return MVP_PROMPTS[agentId] || MVP_PROMPTS.sophia;
  }
};

/**
 * Busca todos os prompts disponíveis
 * @returns {Promise<Object>} - Objeto com todos os prompts
 */
export const getAllPrompts = async () => {
  try {
    // Verificar cache
    if (promptsCache && lastCacheTime && (Date.now() - lastCacheTime < CACHE_DURATION)) {
      console.log('[AGENTS][INFO] Usando prompts em cache');
      return promptsCache;
    }

    // Verificar se Firebase está configurado
    if (!db) {
      console.warn('[AGENTS][WARN] Firebase não configurado, retornando MVP prompts');
      return MVP_PROMPTS;
    }

    // Buscar do Firestore (coleção agent_templates)
    const promptsRef = collection(db, 'agent_templates');
    const snapshot = await getDocs(promptsRef);

    if (!snapshot.empty) {
      const prompts = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        prompts[doc.id] = data.content || data.prompt || '';
      });

      // Atualizar cache
      promptsCache = prompts;
      lastCacheTime = Date.now();

      console.log(`[AGENTS][SUCCESS] ${snapshot.size} prompts carregados do Firestore`);
      return prompts;
    }

    // Fallback para MVP
    console.warn('[AGENTS][WARN] Nenhum prompt encontrado no Firestore, usando MVP');
    return MVP_PROMPTS;

  } catch (error) {
    console.warn(`[AGENTS][WARN] Erro ao buscar prompts: ${error.message}`);
    return MVP_PROMPTS;
  }
};

/**
 * Salva ou atualiza um prompt no Firestore
 * @param {string} agentId - ID do agente
 * @param {string} content - Conteúdo do prompt
 * @param {Object} metadata - Metadados adicionais
 * @returns {Promise<boolean>} - Sucesso ou falha
 */
export const saveAgentPrompt = async (agentId, content, metadata = {}) => {
  try {
    if (!db) {
      throw new Error('Firebase não configurado');
    }

    const promptRef = doc(db, 'agent_templates', agentId);
    await setDoc(promptRef, {
      content,
      agentId,
      updatedAt: new Date().toISOString(),
      version: metadata.version || '1.0',
      description: metadata.description || '',
      active: metadata.active !== false,
      ...metadata
    }, { merge: true });

    // Limpar cache para forçar reload
    promptsCache = null;
    lastCacheTime = null;

    console.log(`[AGENTS][SUCCESS] Prompt salvo para ${agentId}`);
    return true;

  } catch (error) {
    console.error(`[AGENTS][ERROR] Erro ao salvar prompt: ${error.message}`);
    return false;
  }
};

/**
 * Limpa o cache de prompts
 */
export const clearPromptsCache = () => {
  promptsCache = null;
  lastCacheTime = null;
  console.log('[AGENTS][INFO] Cache de prompts limpo');
};

/**
 * Retorna os prompts MVP (hardcoded)
 * @returns {Object} - Prompts MVP
 */
export const getMVPPrompts = () => {
  return { ...MVP_PROMPTS };
};

/**
 * Injeta variáveis em um prompt (como {{comments}})
 * @param {string} prompt - Prompt template
 * @param {Object} variables - Variáveis para injetar
 * @returns {string} - Prompt com variáveis injetadas
 */
export const injectPromptVariables = (prompt, variables = {}) => {
  let result = prompt;
  
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    result = result.replace(new RegExp(placeholder, 'g'), value);
  }
  
  return result;
};
