// Serviço para buscar prompts de agentes do Firestore
// NOTA: Descriptografia acontece no BACKEND apenas (/api/agents/run)
import { db } from '../config/firebase';
import { collection, doc, getDoc } from 'firebase/firestore';

/**
 * Verifica se agente existe e está ativa no Firestore
 * @param {string} agentId - ID da agente (sophia-fenix ou sophia-universal)
 * @returns {Promise<boolean>} - True se agente existe e está ativa
 */
export async function getAgentPrompt(agentId) {
  try {
    console.log(`🔍 VT: Verificando agente: ${agentId}`);
    
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
    
    console.log(`✅ VT: Agente ${agentId} existe e está ativa`);
    
    // Retornar true - descriptografia acontece no backend
    return true;
  } catch (error) {
    console.error(`❌ VT: Erro ao verificar agente ${agentId}:`, error);
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
