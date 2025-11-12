// VT: Painel de Agentes GPTs para usuários
import { useState, useEffect } from 'react';
import { ExternalLink, Sparkles, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from './Card';
import { subscribeToActiveAgents } from '../services/agentsService';
import toast from 'react-hot-toast';

const GPTAgents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToActiveAgents((activeAgents) => {
      setAgents(activeAgents);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenAgent = (agent) => {
    if (!agent.url || agent.url.trim() === '') {
      toast.error('Este agente ainda não está configurado');
      return;
    }
    window.open(agent.url, '_blank', 'noopener,noreferrer');
    toast.success(`Abrindo ${agent.name}...`);
  };

  if (loading) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-400">Carregando agentes...</p>
        </div>
      </Card>
    );
  }

  if (agents.length === 0) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center py-12 text-center max-w-lg mx-auto">
          <Lock className="w-16 h-16 text-gray-500 mb-4" />
          <h3 className="text-xl font-bold mb-2">Nenhum Agente Disponível</h3>
          <p className="text-gray-400">
            Os agentes GPTs são bônus extras que serão liberados em breve. Aguarde enquanto configuramos esses assistentes especiais para você!
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
          <Card>
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold">Agentes GPTs Bônus</h2>
        </div>
        <p className="text-gray-400">
          Assistentes especializados para complementar suas estratégias!
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover gradient className="relative h-full">
                {/* VT: Garantimos que o conteúdo textual fique acima do gradiente do Card */}
                <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0">
                    {agent.imageUrl ? (
                      <img
                        src={agent.imageUrl}
                        alt={agent.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-purple-500/30"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextSibling;
                          if (fallback) fallback.style.display = 'block';
                        }}
                      />
                    ) : null}
                    <div className={agent.imageUrl ? 'text-5xl hidden' : 'text-5xl'}>
                      {agent.icon || '🤖'}
                    </div>
                  </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold mb-1 gradient-primary bg-clip-text text-transparent truncate relative z-10">
                      {agent.name}
                    </h3>
                      <p className="text-sm text-gray-400 relative z-10">{agent.description}</p>
                  </div>
                </div>

                  <button
                    onClick={() => handleOpenAgent(agent)}
                    disabled={!agent.url || agent.url.trim() === ''}
                    className={`w-full mt-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                      agent.url && agent.url.trim() !== ''
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg hover:shadow-purple-500/50'
                        : 'bg-gray-600/20 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <ExternalLink className="w-4 h-4" />
                    {agent.url && agent.url.trim() !== '' ? 'Abrir Agente' : 'Em Breve'}
                  </button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <div className="flex items-start gap-3">
          <div className="text-2xl leading-none">💡</div>
          <div>
            <h4 className="font-bold mb-1">Como usar os Agentes GPTs?</h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Clique em "Abrir Agente" para acessar o ChatGPT especializado</li>
              <li>• Converse com o agente sobre sua oferta ou estratégia</li>
              <li>• Copie as respostas e use no ViralTicket</li>
              <li>• Cada agente é especializado em uma área específica</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GPTAgents;
