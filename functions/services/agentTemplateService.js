// VT: secure-agent - Serviço para gerenciar templates de agentes
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { encryptPrompt, decryptPrompt, hashPrompt } from '../utils/encryption.js';

const db = getFirestore();

/**
 * Obtém um template de agente por ID (retorna versão criptografada)
 * @param {string} agentId - ID do agente (ex: 'sophia-fenix')
 * @returns {Promise<Object>} - Documento do template
 */
export async function getAgentTemplate(agentId) {
  const docRef = db.collection('agent_templates').doc(agentId);
  const doc = await docRef.get();
  
  if (!doc.exists) {
    throw new Error(`Template de agente '${agentId}' não encontrado`);
  }
  
  return {
    id: doc.id,
    ...doc.data()
  };
}

/**
 * Lista todos os templates disponíveis (sem os prompts)
 * @returns {Promise<Array>} - Lista de templates (metadata apenas)
 */
export async function listAgentTemplates() {
  const snapshot = await db.collection('agent_templates')
    .orderBy('name')
    .get();
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    name: doc.data().name,
    description: doc.data().description,
    version: doc.data().version,
    active: doc.data().active !== false,
    createdAt: doc.data().createdAt,
    lastEditedAt: doc.data().lastEditedAt,
    // NUNCA retornar prompt_enc para o frontend
  }));
}

/**
 * Cria ou atualiza um template de agente (apenas para ADMIN)
 * @param {string} agentId - ID do agente
 * @param {Object} data - Dados do template
 * @param {string} data.name - Nome do agente
 * @param {string} data.description - Descrição
 * @param {string} data.promptPlaintext - Prompt em texto plano (será criptografado)
 * @param {string} userId - ID do usuário admin
 * @param {string} changeReason - Motivo da mudança (para auditoria)
 * @returns {Promise<Object>} - Template salvo (sem prompt)
 */
export async function saveAgentTemplate(agentId, data, userId, changeReason = '') {
  const docRef = db.collection('agent_templates').doc(agentId);
  const existingDoc = await docRef.get();
  
  // Criptografar o prompt
  const promptEncrypted = encryptPrompt(data.promptPlaintext);
  const promptHash = hashPrompt(data.promptPlaintext);
  
  const templateData = {
    name: data.name,
    description: data.description,
    prompt_enc: promptEncrypted,
    prompt_hash: promptHash,
    model: data.model || 'gpt-4o-mini',
    temperature: data.temperature || 0.7,
    max_tokens: data.max_tokens || 1500,
    version: existingDoc.exists ? (existingDoc.data().version || 0) + 1 : 1,
    active: data.active !== false,
    lastEditedBy: userId,
    lastEditedAt: FieldValue.serverTimestamp(),
    access: {
      editRole: 'admin',
      runRole: 'user' // ou 'subscriber', dependendo da lógica
    }
  };
  
  if (!existingDoc.exists) {
    templateData.createdBy = userId;
    templateData.createdAt = FieldValue.serverTimestamp();
  }
  
  // Salvar template
  await docRef.set(templateData, { merge: true });
  
  // Registrar auditoria
  await db.collection('agent_audit_logs').add({
    agentId,
    action: existingDoc.exists ? 'update' : 'create',
    userId,
    changeReason,
    promptHash,
    version: templateData.version,
    timestamp: FieldValue.serverTimestamp(),
    // NÃO salvar prompt em texto plano aqui - apenas o hash
  });
  
  // Retornar sem o prompt
  const { prompt_enc, ...safeData } = templateData;
  return {
    id: agentId,
    ...safeData
  };
}

/**
 * Desativa um template (soft delete)
 * @param {string} agentId - ID do agente
 * @param {string} userId - ID do usuário admin
 * @returns {Promise<void>}
 */
export async function deactivateAgentTemplate(agentId, userId) {
  await db.collection('agent_templates').doc(agentId).update({
    active: false,
    lastEditedBy: userId,
    lastEditedAt: FieldValue.serverTimestamp()
  });
  
  await db.collection('agent_audit_logs').add({
    agentId,
    action: 'deactivate',
    userId,
    timestamp: FieldValue.serverTimestamp()
  });
}

/**
 * Obtém histórico de versões de um template (apenas hashes e metadata)
 * @param {string} agentId - ID do agente
 * @returns {Promise<Array>} - Histórico de auditoria
 */
export async function getAgentHistory(agentId) {
  const snapshot = await db.collection('agent_audit_logs')
    .where('agentId', '==', agentId)
    .orderBy('timestamp', 'desc')
    .limit(50)
    .get();
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp?.toDate()
  }));
}

/**
 * INTERNO: Descriptografa e retorna o prompt (apenas para execução)
 * @param {string} agentId - ID do agente
 * @returns {Promise<string>} - Prompt em texto plano
 */
export async function getDecryptedPrompt(agentId) {
  const template = await getAgentTemplate(agentId);
  
  if (!template.active && template.active !== undefined) {
    throw new Error(`Template '${agentId}' está desativado`);
  }
  
  return decryptPrompt(template.prompt_enc);
}
