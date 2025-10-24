import { useState } from 'react';
import { Sparkles, Copy, Loader2, Plus } from 'lucide-react';
import Button from './Button';
import Card from './Card';
import { useToast } from './Toast';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { createOffer } from '../firebase/offers';

const AIChat = ({ initialText = '' }) => {
  const [selectedAgent, setSelectedAgent] = useState('sophia');
  const [inputText, setInputText] = useState(initialText);
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user, updateUser } = useAuth();
  const { success, error } = useToast();
  const { t } = useLanguage();

  const agents = [
    {
      id: 'sophia',
      name: 'Sophia Fênix',
      emoji: '🔥',
      description: 'Especialista em ofertas de alto impacto',
      color: 'from-orange-500 to-red-600',
    },
    {
      id: 'sofia',
      name: 'Sofia Universal',
      emoji: '🌟',
      description: 'IA versátil para todos os nichos',
      color: 'from-primary-purple to-primary-lilac',
    },
  ];

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      error('Digite um comentário ou texto');
      return;
    }

    if (user.dailyUsage.offers >= user.limits.offers && user.limits.offers !== 'unlimited') {
      error('Limite diário de ofertas atingido');
      return;
    }

    setLoading(true);

    // Simulação de geração de oferta
    setTimeout(() => {
      const mockOffer = {
        title: '🎯 Transforme Sua Vida em 30 Dias!',
        subtitle: 'O Método Definitivo para Alcançar Seus Objetivos',
        bullets: [
          '✅ Sistema comprovado usado por +10.000 pessoas',
          '✅ Resultados garantidos em 30 dias ou seu dinheiro de volta',
          '✅ Acesso vitalício + bônus exclusivos',
          '✅ Suporte dedicado 24/7',
        ],
        cta: '🚀 QUERO TRANSFORMAR MINHA VIDA AGORA!',
        bonus: '🎁 Bônus: Curso Gratuito de Mentalidade Vencedora',
      };

      setOutput(mockOffer);
      updateUser({
        dailyUsage: {
          ...user.dailyUsage,
          offers: user.dailyUsage.offers + 1,
        },
      });
      success('Oferta gerada com sucesso!');
      setLoading(false);
    }, 3000);
  };

  const handleCopy = () => {
    if (!output) return;
    
    const text = `${output.title}\n\n${output.subtitle}\n\n${output.bullets.join('\n')}\n\n${output.cta}\n\n${output.bonus}`;
    navigator.clipboard.writeText(text);
    success('Oferta copiada!');
  };

  const handleAddToKanban = async () => {
    if (!output) return;
    
    try {
      const agent = agents.find(a => a.id === selectedAgent);
      const offerData = {
        title: output.title,
        description: output.subtitle,
        agent: `${agent.name} ${agent.emoji}`,
        status: 'pending',
        content: {
          bullets: output.bullets,
          cta: output.cta,
          bonus: output.bonus,
        },
      };
      
      await createOffer(offerData);
      success('✅ Oferta adicionada ao Kanban!');
    } catch (error) {
      console.error('Error adding to Kanban:', error);
      error('Erro ao adicionar oferta ao Kanban');
    }
  };

  return (
    <div className="space-y-6">
      {/* Agent Selection */}
      <Card>
        <h3 className="text-xl font-bold mb-4">Selecione a IA</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => setSelectedAgent(agent.id)}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedAgent === agent.id
                  ? 'border-primary-purple bg-primary-purple/10'
                  : 'border-white/10 glass-hover'
              }`}
            >
              <div className="text-4xl mb-2">{agent.emoji}</div>
              <h4 className="font-bold mb-1">{agent.name}</h4>
              <p className="text-sm text-zinc-400">{agent.description}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Input */}
      <Card>
        <h3 className="text-xl font-bold mb-4">Comentário ou Texto</h3>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t('enterText')}
          className="w-full glass border border-white/10 rounded-lg px-4 py-3 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary-purple/50 resize-none"
        />
        <Button
          onClick={handleGenerate}
          loading={loading}
          className="w-full mt-4"
          icon={Sparkles}
        >
          {t('generate')}
        </Button>
      </Card>

      {/* Output */}
      {output && (
        <Card gradient>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Oferta Gerada</h3>
            <div className="flex gap-2">
              <Button variant="gold" onClick={handleAddToKanban} icon={Plus}>
                Adicionar ao Kanban
              </Button>
              <Button variant="secondary" onClick={handleCopy} icon={Copy}>
                {t('copy')}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
                {output.title}
              </h2>
              <p className="text-lg text-zinc-300 mt-2">{output.subtitle}</p>
            </div>

            <div className="space-y-2">
              {output.bullets.map((bullet, index) => (
                <p key={index} className="text-zinc-300">{bullet}</p>
              ))}
            </div>

            <div className="glass border border-primary-purple/30 rounded-lg p-4 text-center">
              <p className="text-xl font-bold gradient-primary bg-clip-text text-transparent">
                {output.cta}
              </p>
            </div>

            <p className="text-center text-yellow-400">{output.bonus}</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AIChat;
