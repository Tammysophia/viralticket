import { useState } from 'react';
import { Sparkles, Copy, Loader2, AlertCircle, Plus } from 'lucide-react';
import Button from './Button';
import Card from './Card';
import { useToast } from './Toast';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { useAPIKeys } from '../hooks/useAPIKeys';
import { generateOfferFromComment } from '../firebase/offers';

const AIChat = ({ initialText = '' }) => {
  const [selectedAgent, setSelectedAgent] = useState('sophia');
  const [inputText, setInputText] = useState(initialText);
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user, updateUser } = useAuth();
  const { success, error } = useToast();
  const { t } = useLanguage();
  const { openaiKey, hasOpenaiKey } = useAPIKeys();

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

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      error('Digite um comentário ou texto');
      return;
    }

    if (!hasOpenaiKey()) {
      error('❌ Chave da API do OpenAI não configurada. Configure no painel admin.');
      return;
    }

    if (user.dailyUsage.offers >= user.limits.offers && user.limits.offers !== 999999) {
      error('Limite diário de ofertas atingido');
      return;
    }

    setLoading(true);

    try {
      console.log('🤖 Gerando oferta REAL com OpenAI...');
      
      // Gerar oferta real com OpenAI e salvar no Firestore
      const offerResult = await generateOfferFromComment(
        inputText,
        null, // ID do comentário (null se for texto direto)
        openaiKey,
        user.id,
        {
          agent: selectedAgent,
        }
      );

      const generatedOffer = {
        title: `🎯 ${offerResult.titulo}`,
        subtitle: offerResult.descricao,
        bullets: [
          `✅ Categoria: ${offerResult.categoria}`,
          `✅ Público-alvo: ${offerResult.publico}`,
          `✅ Gatilho mental: ${offerResult.gatilho}`,
          `✅ Gerado com IA (${selectedAgent})`,
        ],
        cta: `🚀 ${offerResult.callToAction}`,
        bonus: `🎁 Comentário original: "${offerResult.comentarioOriginal.substring(0, 100)}..."`,
        id: offerResult.id,
      };

      setOutput(generatedOffer);
      updateUser({
        dailyUsage: {
          ...user.dailyUsage,
          offers: user.dailyUsage.offers + 1,
        },
      });
      success('✅ Oferta REAL gerada e salva no Kanban!');
    } catch (err) {
      console.error('Erro ao gerar oferta:', err);
      error(`❌ Erro: ${err.message}`);
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

  return (
    <div className="space-y-6">
      {/* Alerta se não tiver chave configurada */}
      {!hasOpenaiKey() && (
        <Card className="border-yellow-500/30 bg-yellow-500/10">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-500 mb-1">
                ⚠️ Chave da API do OpenAI não configurada
              </p>
              <p className="text-sm text-yellow-200/80">
                {user?.isAdmin 
                  ? 'Configure a chave no painel admin (Chaves API) para gerar ofertas com IA real.'
                  : 'Entre em contato com o administrador para configurar as chaves de API.'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Agent Selection */}
      <Card>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          Selecione a IA {hasOpenaiKey() && <span className="text-xs text-green-400">(✓ API Ativa)</span>}
        </h3>
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
          placeholder="Cole um comentário do YouTube ou escreva um texto para gerar uma oferta viral..."
          className="w-full glass border border-white/10 rounded-lg px-4 py-3 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
        />
        <Button
          onClick={handleGenerate}
          loading={loading}
          disabled={!hasOpenaiKey()}
          className="w-full mt-4"
          icon={Sparkles}
        >
          {loading ? '🤖 Gerando oferta com IA real...' : '✨ Gerar Oferta REAL com IA'}
        </Button>
      </Card>

      {/* Output */}
      {output && (
        <Card gradient className="border-green-500/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              ✅ Oferta Gerada com IA REAL
              <span className="text-xs text-green-400">(Salva no Kanban)</span>
            </h3>
            <Button variant="secondary" onClick={handleCopy} icon={Copy}>
              {t('copy')}
            </Button>
          </div>

          <div className="space-y-4">
            <div className="glass border border-green-500/30 rounded-lg p-3 mb-4">
              <p className="text-xs text-green-400 font-semibold">
                🤖 Gerado por GPT-4o-mini • Salvo no Firestore • ID: {output.id}
              </p>
            </div>

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
