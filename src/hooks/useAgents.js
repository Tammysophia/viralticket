// VT: secure-agent - Hook para gerenciar agentes
import { useState, useEffect } from 'react';
import { listAgentTemplates } from '../services/agentsService';

/**
 * Hook para listar e gerenciar agentes disponíveis
 * @returns {Object} { agents, loading, error, refresh }
 */
export function useAgents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAgents = async () => {
    try {
      setLoading(true);
      setError(null);
      const templates = await listAgentTemplates();
      
      // Filtrar apenas agentes ativos
      const activeAgents = templates.filter(t => t.active !== false);
      
      setAgents(activeAgents);
    } catch (err) {
      console.error('Erro ao carregar agentes:', err);
      setError(err.message);
      
      // Fallback para agentes padrão se API falhar
      setAgents([
        {
          id: 'sophia-fenix',
          name: 'Sophia Fênix',
          emoji: '🔥',
          description: 'Especialista em ofertas emocionais de alto impacto',
          color: 'from-orange-500 to-red-600',
          active: true
        },
        {
          id: 'sophia-universal',
          name: 'Sophia Universal',
          emoji: '🌟',
          description: 'IA versátil para qualquer nicho',
          color: 'from-purple-500 to-pink-600',
          active: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  return {
    agents,
    loading,
    error,
    refresh: loadAgents
  };
}

/**
 * Hook para obter um agente específico
 * @param {string} agentId 
 * @returns {Object} { agent, loading, error }
 */
export function useAgent(agentId) {
  const { agents, loading, error } = useAgents();
  
  const agent = agents.find(a => a.id === agentId);
  
  return {
    agent,
    loading,
    error: error || (!loading && !agent ? 'Agente não encontrado' : null)
  };
}

export default useAgents;
