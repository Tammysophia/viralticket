import { useState } from 'react';
import { Youtube, Sparkles } from 'lucide-react';
import Button from './Button';
import Input from './Input';
import Card from './Card';
import { useToast } from './Toast';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import axios from 'axios';

const YouTubeExtractor = ({ onUseWithAI }) => {
  const [tema, setTema] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('sophia');
  const { user, updateUser } = useAuth();
  const { success, error } = useToast();
  const { t } = useLanguage();

  const agents = [
    { id: 'sophia', name: 'Sophia Fênix 🔥' },
    { id: 'sofia', name: 'Sofia Universal 🌟' }
  ];

  const handleGenerate = async () => {
    if (!tema.trim()) {
      error('Por favor, digite sobre o que você quer criar uma oferta');
      return;
    }

    setLoading(true);
    
    try {
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;
      if (!webhookUrl) {
        throw new Error('Webhook do n8n não configurado');
      }

      const payload = {
        userId: user.id,
        tema: tema,
        agente: selectedAgent,
        idioma: 'pt-BR'
      };

      const response = await axios.post(webhookUrl, payload);
      
      if (response.data) {
        success('✅ Oferta gerada com sucesso!');
        onUseWithAI(response.data.oferta || response.data);
        
        updateUser({
          dailyUsage: {
            ...user.dailyUsage,
            offers: (user.dailyUsage.offers || 0) + 1,
          },
        });
      }
    } catch (err) {
      console.error('Erro ao gerar oferta:', err);
      error('❌ Erro ao processar sua solicitação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            Criar Nova Oferta
          </h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Sobre o que você quer criar uma oferta?
            </label>
            <Input
              placeholder="Ex: Curso de emagrecimento, Mentoria de investimentos..."
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              icon={Youtube}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Selecione sua Estrategista
            </label>
            <div className="grid grid-cols-2 gap-4">
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent.id)}
                  className={`p-4 rounded-xl border transition-all ${
                    selectedAgent === agent.id
                      ? 'border-purple-500 bg-purple-500/10 text-white'
                      : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                  }`}
                >
                  {agent.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          loading={loading}
          className="w-full mt-6"
          icon={Sparkles}
        >
          Gerar Oferta Viral
        </Button>
      </Card>
    </div>
  );
};

export default YouTubeExtractor;
