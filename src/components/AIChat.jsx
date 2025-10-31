import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import Button from './Button';
import Card from './Card';
import OfferViewer from './OfferViewer';
import { useToast } from './Toast';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { verifyAPIConnection, generateOffer } from '../services/openaiService';
import { createOfferFromAI } from '../services/offersService';

const AIChat = ({ initialText = '' }) => {
  const [selectedAgent, setSelectedAgent] = useState('sophia');
  const [inputText, setInputText] = useState(initialText);
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);
  const [verifying, setVerifying] = useState(false);
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
      color: 'from-purple-500 to-pink-600',
    },
  ];

  const handleVerifyConnection = async () => {
    setVerifying(true);
    try {
      const result = await verifyAPIConnection();
      
      if (result.success) {
        setApiConnected(true);
        success('✅ Conexão com OpenAI API estabelecida!');
      } else {
        setApiConnected(false);
        if (user.isAdmin) {
          error(`⚠️ ${result.message}`);
        } else {
          error('🎯 O sistema está em operação normal. Tente novamente!');
        }
      }
    } catch (err) {
      setApiConnected(false);
      if (user.isAdmin) {
        error(`⚠️ Erro: ${err.message}`);
      } else {
        error('🎯 Erro ao conectar. Tente novamente!');
      }
    } finally {
      setVerifying(false);
    }
  };

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

    try {
      // Verificar conexão antes de gerar
      const connectionCheck = await verifyAPIConnection();
      
      if (!connectionCheck.success) {
        if (user.isAdmin) {
          error(`⚠️ ${connectionCheck.message}`);
        } else {
          error('🎯 O sistema está em operação normal. Por favor, tente novamente.');
        }
        setLoading(false);
        return;
      }

      // Gerar oferta com OpenAI
      const offerData = await generateOffer(inputText, selectedAgent);

      setOutput(offerData);
      updateUser({
        dailyUsage: {
          ...user.dailyUsage,
          offers: user.dailyUsage.offers + 1,
        },
      });
      success('Oferta gerada com sucesso!');
      setApiConnected(true);

      // VT: Salvar oferta automaticamente no Firestore
      try {
        const offerId = await createOfferFromAI({
          userId: user.id,
          title: offerData.title || 'Nova Oferta',
          agent: selectedAgent,
          copy: {
            page: `${offerData.title}\n\n${offerData.subtitle}\n\n${offerData.bullets.join('\n')}\n\n${offerData.cta}\n\n${offerData.bonus}`,
            adPrimary: offerData.bullets.join(' '),
            adHeadline: offerData.title,
            adDescription: offerData.subtitle
          },
          youtubeLinks: []
        });
        console.log('✅ Oferta salva automaticamente no Kanban:', offerId);
        success('📝 Oferta salva no Kanban!');
      } catch (saveError) {
        console.error('❌ Erro ao salvar oferta:', saveError);
        // VT: Não bloqueia o fluxo se falhar ao salvar
      }
    } catch (err) {
      console.error('Erro ao gerar oferta:', err);
      if (user.isAdmin) {
        error(`⚠️ ${err.message}`);
      } else {
        error('🎯 Erro ao gerar oferta. Tente novamente!');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!output) return;
    
    // Detectar se é oferta simples ou completa
    if (output.title && output.subtitle && output.bullets) {
      // Formato simples
      const text = `${output.title}\n\n${output.subtitle}\n\n${output.bullets.join('\n')}\n\n${output.cta}\n\n${output.bonus}`;
      navigator.clipboard.writeText(text);
      success('Oferta copiada!');
    } else {
      // Formato completo - copiar JSON
      navigator.clipboard.writeText(JSON.stringify(output, null, 2));
      success('Oferta completa copiada como JSON!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Agent Selection */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Selecione a IA</h3>
          {/* VT: Badge "API Conectada" removido conforme solicitado */}
        </div>
        
        {user?.isAdmin && (
          <div className="mb-4">
            <Button
              onClick={handleVerifyConnection}
              loading={verifying}
              variant="secondary"
              className="w-full"
            >
              {apiConnected ? '✅ Reconectar API' : '🔌 Verificar Conexão API'}
            </Button>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => setSelectedAgent(agent.id)}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedAgent === agent.id
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-white/10 glass-hover'
              }`}
            >
              <div className="text-4xl mb-2">{agent.emoji}</div>
              <h4 className="font-bold mb-1">{agent.name}</h4>
              <p className="text-sm text-gray-400">{agent.description}</p>
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
          className="w-full glass border border-white/10 rounded-lg px-4 py-3 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
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
        <OfferViewer offerData={output} onCopy={handleCopy} />
      )}
    </div>
  );
};

export default AIChat;
