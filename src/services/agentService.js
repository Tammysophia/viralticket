// Serviço para buscar e descriptografar prompts de agentes do Firestore
import { db } from '../config/firebase';
import { collection, doc, getDoc } from 'firebase/firestore';

/**
 * Descriptografa prompt usando Web Crypto API (AES-256-GCM)
 * @param {string} encryptedText - Formato: "iv:tag:encrypted"
 * @returns {Promise<string>} - Texto descriptografado
 */
async function decryptPrompt(encryptedText) {
  try {
    const [ivHex, tagHex, encryptedHex] = encryptedText.split(':');
    
    // Converter hex para Uint8Array
    const iv = new Uint8Array(ivHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    const tag = new Uint8Array(tagHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    const encrypted = new Uint8Array(encryptedHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    
    // Concatenar encrypted + tag (GCM precisa disso)
    const ciphertext = new Uint8Array(encrypted.length + tag.length);
    ciphertext.set(encrypted);
    ciphertext.set(tag, encrypted.length);
    
    // Chave master (deve estar em variável de ambiente)
    const AGENT_MASTER_KEY = import.meta.env.VITE_AGENT_MASTER_KEY || '0'.repeat(64);
    const keyData = new Uint8Array(AGENT_MASTER_KEY.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    
    // Importar chave para Web Crypto API
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    
    // Descriptografar
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      ciphertext
    );
    
    // Converter para string
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('❌ VT: Erro ao descriptografar:', error);
    throw new Error('Failed to decrypt prompt');
  }
}

/**
 * Busca prompt COMPLETO da agente do Firestore e descriptografa
 * @param {string} agentId - ID da agente (sophia-fenix ou sophia-universal)
 * @returns {Promise<string>} - Prompt COMPLETO descriptografado
 */
export async function getAgentPrompt(agentId) {
  try {
    console.log(`🔍 VT: Buscando prompt COMPLETO da agente: ${agentId}`);
    
    const agentRef = doc(db, 'agent_templates', agentId);
    const agentSnap = await getDoc(agentRef);
    
    // OBRIGATÓRIO: Agente deve existir
    if (!agentSnap.exists()) {
      console.error(`❌ VT: Agente ${agentId} não encontrada no Firestore`);
      throw new Error(`Agent not found: ${agentId}. Execute 'npm run inject-agents' para configurar.`);
    }
    
    const data = agentSnap.data();
    
    // OBRIGATÓRIO: Agente deve estar ativa
    if (!data.active) {
      console.error(`❌ VT: Agente ${agentId} está inativa`);
      throw new Error(`Agent inactive: ${agentId}`);
    }
    
    // OBRIGATÓRIO: Prompt criptografado deve existir
    if (!data.prompt_enc) {
      console.error(`❌ VT: Prompt criptografado não encontrado para ${agentId}`);
      throw new Error(`Agent prompt missing: ${agentId}`);
    }
    
    console.log(`🔓 VT: Descriptografando prompt COMPLETO da agente ${agentId}...`);
    
    // Descriptografar prompt
    const decryptedPrompt = await decryptPrompt(data.prompt_enc);
    
    if (!decryptedPrompt || decryptedPrompt.length < 100) {
      console.error(`❌ VT: Prompt descriptografado inválido ou muito curto`);
      throw new Error('Invalid decrypted prompt');
    }
    
    console.log(`✅ VT: Prompt COMPLETO descriptografado com sucesso! (${decryptedPrompt.length} caracteres)`);
    
    return decryptedPrompt;
  } catch (error) {
    console.error(`❌ VT: Erro ao buscar prompt da agente ${agentId}:`, error);
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
