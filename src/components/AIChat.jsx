import { useState, useEffect } from 'react';
import { Sparkles, Copy, Loader2, CheckCircle } from 'lucide-react';
import Button from './Button';
import Card from './Card';
import { useToast } from './Toast';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { verifyAPIConnection, generateOffer } from '../services/openaiService';
import { createOfferFromAI } from '../services/offersService';
import toast from 'react-hot-toast';

const AIChat = ({ initialText = '' }) => {
  const [selectedAgent, setSelectedAgent] = useState('sophia');
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const { user, updateUser } = useAuth();
  const { success, error } = useToast();
  const { t } = useLanguage();

  // Atualizar inputText apenas quando initialText mudar
  useEffect(() => {
    if (initialText) {
      setInputText(initialText);
    }
  }, [initialText]);

  // VT: Carregar última oferta gerada do localStorage ao montar
  useEffect(() => {
    const savedOutput = localStorage.getItem('vt_last_offer_output');
    if (savedOutput) {
      try {
        const parsed = JSON.parse(savedOutput);
        // Verificar se a oferta foi gerada nas últimas 24 horas
        const savedTime = parsed.timestamp || 0;
        const now = Date.now();
        const ONE_DAY = 24 * 60 * 60 * 1000;
        
        if (now - savedTime < ONE_DAY) {
          setOutput(parsed.data);
          console.log('VT: Última oferta carregada do localStorage');
        } else {
          // Limpar oferta antiga
          localStorage.removeItem('vt_last_offer_output');
        }
      } catch (e) {
        console.error('VT: Erro ao carregar oferta do localStorage', e);
      }
    }
  }, []);

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

    // Verificar apenas limite DIÁRIO de geração de ofertas
    if (user.dailyUsage.offers >= user.limits.offers && user.limits.offers !== 'unlimited') {
      const planName = user.plan === 'FREE' ? 'BRONZE' : 'PRATA';
      const nextPlanOffers = user.plan === 'FREE' ? '5' : '10';
      error(`⏰ Limite diário atingido (${user.limits.offers} ofertas/dia). Volte amanhã ou faça upgrade para ${planName} (${nextPlanOffers} ofertas/dia)!`);
      return;
    }

    setLoading(true);
    setOutput(null); // Limpar output anterior

    try {
      console.log('VT: Iniciando geração de oferta...');
      
      // Gerar oferta com OpenAI (a verificação de API key está dentro do generateOffer)
      const offerData = await generateOffer(inputText, selectedAgent);
      console.log('VT: Oferta gerada:', offerData);

      setOutput(offerData);
      
      // VT: Salvar oferta no localStorage para persistir entre navegações
      localStorage.setItem('vt_last_offer_output', JSON.stringify({
        data: offerData,
        timestamp: Date.now()
      }));
      
      // Atualizar apenas uso DIÁRIO (sem limite mensal)
      updateUser({
        dailyUsage: {
          ...user.dailyUsage,
          offers: user.dailyUsage.offers + 1,
        },
      });
      
      const remaining = user.limits.offers === 'unlimited' ? '∞' : user.limits.offers - (user.dailyUsage.offers + 1);
      success(`✅ Oferta gerada com sucesso! ${remaining === '∞' ? 'Ilimitado' : `Restam ${remaining} hoje`}`);
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
        console.log('VT: Oferta salva no Kanban:', offerId);
        toast.success('📝 Oferta salva no Kanban!', { duration: 2000 });
      } catch (saveError) {
        console.error('VT: Erro ao salvar oferta:', saveError);
        toast.error('⚠️ Oferta gerada mas não foi salva no Kanban');
      }
    } catch (err) {
      console.error('VT: Erro ao gerar oferta:', err);
      setOutput(null);
      
      // Mostrar mensagem específica para admin ou genérica para usuário
      if (user.isAdmin) {
        // Admin vê detalhes técnicos
        const adminMsg = err.adminMessage || err.message || 'Erro desconhecido';
        error(`⚠️ [ADMIN] ${adminMsg}`);
      } else {
        // Usuário vê mensagem genérica
        const userMsg = err.userMessage || '🔧 Sistema em manutenção. Tente novamente em instantes.';
        error(userMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!output) return;
    
    const text = `${output.title}\n\n${output.subtitle}\n\n${output.bullets.join('\n')}\n\n${output.cta}\n\n${output.bonus}`;
    navigator.clipboard.writeText(text);
    success('Oferta copiada!');
  };

  // VT: Limpar oferta da visualização
  const handleClearOutput = () => {
    setOutput(null);
    localStorage.removeItem('vt_last_offer_output');
    success('Oferta removida da visualização');
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
        <Card gradient>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Oferta Gerada</h3>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleCopy} icon={Copy}>
                {t('copy')}
              </Button>
              <button
                onClick={handleClearOutput}
                className="px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 text-sm font-medium transition-colors flex items-center gap-2"
              >
                🗑️ Limpar
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
                {output.title}
              </h2>
              <p className="text-lg text-gray-300 mt-2">{output.subtitle}</p>
            </div>

            <div className="space-y-2">
              {output.bullets.map((bullet, index) => (
                <p key={index} className="text-gray-300">{bullet}</p>
              ))}
            </div>

            <div className="glass border border-purple-500/30 rounded-lg p-4 text-center">
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
