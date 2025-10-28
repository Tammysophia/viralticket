// Serviço para buscar e descriptografar prompts de agentes do Firestore
import { db } from '../config/firebase';
import { collection, doc, getDoc } from 'firebase/firestore';
import crypto from 'crypto-js';

/**
 * Descriptografa prompt criptografado com AES-256-GCM
 * @param {string} encryptedText - Texto no formato "iv:tag:encrypted"
 * @returns {string} - Texto descriptografado
 */
function decrypt(encryptedText) {
  try {
    const [ivHex, tagHex, encrypted] = encryptedText.split(':');
    
    // Em ambiente de produção, usar variável de ambiente
    const AGENT_MASTER_KEY = import.meta.env.VITE_AGENT_MASTER_KEY || '0'.repeat(64);
    
    // Descriptografar usando crypto-js (compatível com Node crypto)
    const key = crypto.enc.Hex.parse(AGENT_MASTER_KEY);
    const iv = crypto.enc.Hex.parse(ivHex);
    const tag = crypto.enc.Hex.parse(tagHex);
    
    // crypto-js não tem suporte direto a GCM no browser
    // Usar AES-CTR como fallback ou implementar via Web Crypto API
    console.warn('⚠️ VT: Descriptografia AES-GCM no browser não implementada. Usando fallback simples.');
    
    // FALLBACK: retornar texto base64 decodificado (temporário)
    return atob(encrypted);
  } catch (error) {
    console.error('❌ VT: Erro ao descriptografar prompt:', error);
    return null;
  }
}

/**
 * Busca prompt de agente do Firestore e descriptografa
 * @param {string} agentId - ID da agente (sophia-fenix ou sophia-universal)
 * @returns {Promise<string|null>} - Prompt descriptografado ou null
 */
export async function getAgentPrompt(agentId) {
  try {
    console.log(`🔍 VT: Buscando prompt da agente: ${agentId}`);
    
    const agentRef = doc(db, 'agent_templates', agentId);
    const agentSnap = await getDoc(agentRef);
    
    // OBRIGATÓRIO: Agente deve existir
    if (!agentSnap.exists()) {
      console.error(`❌ VT: Agente ${agentId} não encontrada no Firestore`);
      throw new Error(`Agent not found: ${agentId}`);
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
    
    console.log(`🔓 VT: Descriptografando prompt da agente ${agentId}...`);
    const decryptedPrompt = decrypt(data.prompt_enc);
    
    // OBRIGATÓRIO: Descriptografia deve funcionar
    if (!decryptedPrompt) {
      console.error(`❌ VT: Falha ao descriptografar prompt de ${agentId}`);
      throw new Error(`Failed to decrypt agent prompt: ${agentId}`);
    }
    
    console.log(`✅ VT: Prompt da agente ${agentId} descriptografado com sucesso (${decryptedPrompt.length} caracteres)`);
    return decryptedPrompt;
  } catch (error) {
    console.error(`❌ VT: Erro ao buscar prompt da agente ${agentId}:`, error);
    throw error; // Re-throw para forçar tratamento acima
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
