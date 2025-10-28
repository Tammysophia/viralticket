// Serviço para buscar e descriptografar prompts de agentes do Firestore
import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Converte hex string para Uint8Array
 */
function hexToBytes(hexString) {
  const bytes = [];
  for (let i = 0; i < hexString.length; i += 2) {
    bytes.push(parseInt(hexString.slice(i, i + 2), 16));
  }
  return new Uint8Array(bytes);
}

/**
 * Adiciona código de erro customizado
 */
function withCode(err, code) {
  err.code = code;
  return err;
}

/**
 * Descriptografa prompt_enc usando Web Crypto API (AES-256-GCM)
 * @param {string} promptEncHex - Formato: "ivHex:tagHex:cipherHex"
 * @returns {Promise<string>} - Prompt descriptografado
 */
async function decryptPromptEnc(promptEncHex) {
  try {
    console.info('[AGENTS] decrypting template with WebCrypto (AES-256-GCM)...');
    
    const [ivHex, tagHex, dataHex] = promptEncHex.split(':');
    const iv = hexToBytes(ivHex);
    const tag = hexToBytes(tagHex);
    const data = hexToBytes(dataHex);
    
    // Concatenar data + tag para GCM no WebCrypto
    const cipherPlusTag = new Uint8Array(data.length + tag.length);
    cipherPlusTag.set(data, 0);
    cipherPlusTag.set(tag, data.length);

    const keyHex = import.meta.env.VITE_AGENT_MASTER_KEY;
    if (!keyHex || keyHex.length !== 64) {
      console.error('[AGENTS][ERR] AGENT_KEY_INVALID: Missing or invalid VITE_AGENT_MASTER_KEY');
      throw withCode(new Error('Missing/invalid VITE_AGENT_MASTER_KEY'), 'AGENT_KEY_INVALID');
    }

    const rawKey = hexToBytes(keyHex);
    const key = await crypto.subtle.importKey('raw', rawKey, { name: 'AES-GCM' }, false, ['decrypt']);

    const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipherPlusTag);
    const decrypted = new TextDecoder().decode(new Uint8Array(plainBuf));
    
    console.info(`[AGENTS] decrypt OK (chars=${decrypted.length})`);
    return decrypted;
  } catch (error) {
    if (error.code === 'AGENT_KEY_INVALID') throw error;
    console.error('[AGENTS][ERR] AGENT_DECRYPT_FAIL:', error.message);
    throw withCode(new Error('Failed to decrypt agent prompt'), 'AGENT_DECRYPT_FAIL');
  }
}

/**
 * Busca prompt COMPLETO da agente do Firestore
 * @param {string} agentId - ID da agente ('sophia-fenix' ou 'sophia-universal')
 * @returns {Promise<string>} - Prompt COMPLETO descriptografado
 */
export async function getFullSystemPrompt(agentId) {
  try {
    console.info(`[AGENTS] fetching template: ${agentId}`);
    
    const agentRef = doc(db, 'agent_templates', agentId);
    const agentSnap = await getDoc(agentRef);
    
    // Validação: Documento deve existir
    if (!agentSnap.exists()) {
      console.error('[AGENTS][ERR] AGENT_NOT_FOUND: Document does not exist');
      throw withCode(
        new Error(`Agent template not found: ${agentId}`), 
        'AGENT_NOT_FOUND'
      );
    }
    
    const data = agentSnap.data();
    
    // Validação: Agente deve estar ativa
    if (!data.active) {
      console.error('[AGENTS][ERR] AGENT_NOT_FOUND: Agent is inactive');
      throw withCode(
        new Error(`Agent is inactive: ${agentId}`), 
        'AGENT_NOT_FOUND'
      );
    }
    
    // Validação: Campo prompt_enc deve existir
    if (!data.prompt_enc) {
      console.error('[AGENTS][ERR] AGENT_NOT_FOUND: prompt_enc field missing');
      throw withCode(
        new Error(`Agent prompt_enc missing: ${agentId}`), 
        'AGENT_NOT_FOUND'
      );
    }
    
    // Descriptografar prompt
    const decryptedPrompt = await decryptPromptEnc(data.prompt_enc);
    
    // Validação: Prompt não pode ser vazio
    if (!decryptedPrompt || decryptedPrompt.length < 100) {
      console.error('[AGENTS][ERR] AGENT_DECRYPT_FAIL: Decrypted prompt too short or empty');
      throw withCode(
        new Error('Decrypted prompt is invalid'), 
        'AGENT_DECRYPT_FAIL'
      );
    }
    
    return decryptedPrompt;
  } catch (error) {
    // Re-throw com código preservado
    throw error;
  }
}

/**
 * Lista todas as agentes ativas
 * @returns {Promise<Array>} - Lista de agentes disponíveis
 */
export async function listActiveAgents() {
  try {
    // Por enquanto retornar lista estática
    // Em produção, buscar do Firestore
    return [
      {
        id: 'sophia-fenix',
        name: 'Sophia Fênix',
        emoji: '🔥',
        description: 'Transforma dores emocionais reais em ofertas low-ticket completas em até 48h.',
        color: 'from-orange-500 to-red-600',
      },
      {
        id: 'sophia-universal',
        name: 'Sophia Universal',
        emoji: '⭐',
        description: 'Cria ofertas virais em qualquer nicho, com mecanismos únicos e nomes chicletes.',
        color: 'from-purple-500 to-pink-600',
      },
    ];
  } catch (error) {
    console.error('❌ VT: Erro ao listar agentes:', error);
    return [];
  }
}
