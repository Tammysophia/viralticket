// Utilitário para inicializar agentes IA no Firebase
import { saveAgent } from '../services/firebaseService';

/**
 * Inicializa os agentes padrão no Firebase
 * Execute isso uma vez para configurar os agentes
 */
export const initializeAgents = async () => {
  try {
    console.log('🚀 Inicializando agentes no Firebase...');

    // Agente Sophia Fênix
    const sophiaAgent = {
      id: 'sophia',
      name: 'Sophia Fênix',
      emoji: '🔥',
      description: 'Especialista em ofertas de alto impacto',
      color: 'from-orange-500 to-red-600',
      active: true,
      prompt: `Você é Sophia Fênix, especialista em criar ofertas de alto impacto que convertem. 
Analise os seguintes comentários e crie uma oferta irresistível que atenda às dores e desejos do público.

Comentários:
{comments}

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
}`
    };

    // Agente Sofia Universal
    const sofiaAgent = {
      id: 'sofia',
      name: 'Sofia Universal',
      emoji: '🌟',
      description: 'IA versátil para todos os nichos',
      color: 'from-purple-500 to-pink-600',
      active: true,
      prompt: `Você é Sofia Universal, IA versátil especializada em todos os nichos.
Analise os comentários abaixo e crie uma oferta personalizada e persuasiva.

Comentários:
{comments}

Crie uma oferta completa com elementos persuasivos em formato JSON:
{
  "title": "",
  "subtitle": "",
  "bullets": ["", "", "", ""],
  "cta": "",
  "bonus": ""
}`
    };

    // Salvar agentes no Firebase
    await saveAgent('sophia', sophiaAgent);
    console.log('✅ Agente Sophia salvo no Firebase');

    await saveAgent('sofia', sofiaAgent);
    console.log('✅ Agente Sofia salvo no Firebase');

    console.log('🎉 Agentes inicializados com sucesso!');
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao inicializar agentes:', error);
    throw error;
  }
};

/**
 * Atualiza o prompt de um agente específico
 * @param {string} agentId - ID do agente (sophia ou sofia)
 * @param {string} newPrompt - Novo prompt para o agente
 */
export const updateAgentPrompt = async (agentId, newPrompt) => {
  try {
    console.log(`🔄 Atualizando prompt do agente ${agentId}...`);
    
    await saveAgent(agentId, { prompt: newPrompt });
    
    console.log(`✅ Prompt do agente ${agentId} atualizado!`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Erro ao atualizar prompt do agente ${agentId}:`, error);
    throw error;
  }
};

// Exportar função para uso no console do navegador
if (typeof window !== 'undefined') {
  window.initializeAgents = initializeAgents;
  window.updateAgentPrompt = updateAgentPrompt;
  console.log('💡 Funções disponíveis no console:');
  console.log('  - initializeAgents() - Inicializa os agentes no Firebase');
  console.log('  - updateAgentPrompt(agentId, newPrompt) - Atualiza o prompt de um agente');
}
