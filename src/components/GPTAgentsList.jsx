// VT: Lista de Agentes GPTs disponíveis para usuários
import { useState, useEffect } from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';
import { subscribeToActiveAgents } from '../services/agentsService';

const GPTAgentsList = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToActiveAgents((activeAgents) => {
      setAgents(activeAgents);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="px-2 py-4">
        <div className="text-xs text-gray-500 mb-2">Carregando agentes...</div>
      </div>
    );
  }

  if (agents.length === 0) {
    return null;
  }

  return (
    <div className="px-2 py-4 border-t border-white/10">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-purple-400" />
        <h4 className="text-sm font-bold text-gray-300">Agentes de Bônus</h4>
      </div>

      <div className="space-y-2">
        {agents.map((agent) => (
          <a
            key={agent.id}
            href={agent.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg glass-hover border border-white/5 hover:border-purple-500/50 transition-all group"
          >
            <div className="flex-shrink-0">
              {agent.imageUrl ? (
                <img
                  src={agent.imageUrl}
                  alt={agent.name}
                  className="w-10 h-10 rounded-full object-cover border border-purple-500/30"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextSibling;
                    if (fallback) fallback.style.display = 'block';
                  }}
                />
              ) : null}
              <div className={agent.imageUrl ? 'text-2xl hidden' : 'text-2xl'}>
                {agent.icon || '🤖'}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm text-white truncate">
                  {agent.name}
                </p>
                <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-purple-400 transition-colors flex-shrink-0" />
              </div>
              <p className="text-xs text-gray-400 truncate">{agent.description}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default GPTAgentsList;
