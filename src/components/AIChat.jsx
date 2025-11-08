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
      console.log('🚀 VT: Iniciando geração de oferta com agente "' + selectedAgent + '"...');
      
      // Gerar oferta com OpenAI (a verificação de API key está dentro do generateOffer)
      const offerData = await generateOffer(inputText, selectedAgent);
      console.log('VT: Oferta gerada:', offerData);

      setOutput(offerData);
      
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

      // VT: Salvar oferta automaticamente no Firestore com estrutura completa
      try {
        const offerId = await createOfferFromAI({
          userId: user.id,
          title: offerData.title || 'Nova Oferta',
          agent: offerData.agent || selectedAgent,
          fullResponse: offerData.fullResponse || '', // ✅ Resposta COMPLETA da IA
          copy: {
            page: offerData.fullResponse || `${offerData.title}\n\n${offerData.subtitle}\n\n${offerData.bullets.join('\n')}\n\n${offerData.cta}\n\n${offerData.bonus}`,
            adPrimary: offerData.bullets.join(' '),
            adHeadline: offerData.title,
            adDescription: offerData.subtitle
          },
          youtubeLinks: []
        });
        console.log('VT: Oferta criada com estrutura completa:', offerId);
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
            <Button variant="secondary" onClick={handleCopy} icon={Copy}>
              {t('copy')}
            </Button>
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

            {/* VT: Resposta completa da IA - FORMATADA E ORGANIZADA */}
            {output.fullResponse && (
              <div className="mt-8 space-y-6">
                <div className="glass border border-purple-500/30 rounded-xl p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20">
                  <h4 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-6 flex items-center gap-3">
                    <span className="text-3xl">🔥</span>
                    Análise Completa da {selectedAgent === 'sophia' ? 'Sophia Fênix' : 'Sofia Universal'}
                  </h4>
                  
                  <div className="prose prose-invert prose-lg max-w-none">
                    {/* VT: Renderizar com formatação Markdown-like */}
                    <div 
                      className="space-y-6 text-gray-200 leading-relaxed"
                      style={{ fontSize: '15px', lineHeight: '1.8' }}
                      dangerouslySetInnerHTML={{
                        __html: output.fullResponse
                          // Títulos principais (###)
                          .replace(/###\s+(.+)/g, '<div class="mt-10 mb-6"><h3 class="text-2xl font-bold text-purple-300 border-l-4 border-purple-500 pl-4 py-2 bg-purple-500/10 rounded-r-lg">$1</h3></div>')
                          // Negrito (**)
                          .replace(/\*\*(.+?)\*\*/g, '<strong class="text-purple-200 font-bold">$1</strong>')
                          // Listas numeradas com destaque
                          .replace(/^(\d+)\.\s+\*\*(.+?)\*\*(.+)?$/gm, '<div class="ml-6 my-4 p-4 bg-black/30 rounded-lg border-l-4 border-purple-500"><div class="flex items-start gap-3"><span class="text-purple-400 font-bold text-xl flex-shrink-0">$1.</span><div><strong class="text-white text-lg">$2</strong><span class="text-gray-300">$3</span></div></div></div>')
                          // Listas simples numeradas
                          .replace(/^(\d+)\.\s+(.+)/gm, '<div class="ml-6 my-2 flex items-start gap-3"><span class="text-purple-400 font-bold flex-shrink-0">$1.</span><span class="text-gray-300">$2</span></div>')
                          // Listas com marcadores
                          .replace(/^[-•✓✅]\s+(.+)/gm, '<div class="ml-8 my-2 flex items-start gap-2"><span class="text-purple-400 text-xl">•</span><span class="text-gray-300">$1</span></div>')
                          // Emojis em destaque
                          .replace(/(🎯|💡|🔥|✨|💎|🚀|📋|💰|🎁|✅|⚠️|❌|💔|🔍|💥|🧱|🪶|👉|🌹|🕯️|🔗|💣|🌙|🌅|💖|🩸|💫|🩶|💌|👑)/g, '<span class="inline-block text-2xl mr-2 align-middle">$1</span>')
                          // Separadores (---)
                          .replace(/^━━━+$/gm, '<hr class="my-8 border-purple-500/30"/>')
                          // Citações ou blocos importantes (> )
                          .replace(/^>\s+(.+)/gm, '<blockquote class="border-l-4 border-purple-500 pl-4 py-2 my-4 bg-purple-500/10 italic text-purple-200">$1</blockquote>')
                          // Blocos de código (```)
                          .replace(/```(.+?)```/gs, '<pre class="bg-black/60 p-5 rounded-xl my-6 border border-purple-500/40 overflow-x-auto shadow-lg"><code class="text-sm text-green-300 font-mono">$1</code></pre>')
                          // Quebras de linha triplas (espaçamento maior)
                          .replace(/\n\n\n/g, '<div class="my-8"></div>')
                          // Quebras de linha duplas
                          .replace(/\n\n/g, '<div class="my-4"></div>')
                          // Quebras de linha simples
                          .replace(/\n/g, '<br/>')
                      }}
                    />
                  </div>

                  {/* Botões de ação */}
                  <div className="mt-8 pt-6 border-t border-purple-500/30 space-y-6">
                    {/* Botão de copiar */}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(output.fullResponse);
                        success('✅ Análise completa copiada!');
                      }}
                      className="w-full glass border border-purple-500/50 hover:border-purple-400 rounded-lg px-6 py-3 font-semibold text-purple-300 hover:text-purple-200 transition-all flex items-center justify-center gap-2"
                    >
                      <Copy size={20} />
                      Copiar Análise Completa
                    </button>

                    {/* VT: Botões de escolha de formato */}
                    <div className="space-y-6">
                      {/* Separador visual */}
                      <div className="my-8 border-t-2 border-purple-500/30"></div>
                      
                      <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                          🎨 Escolha os Formatos de Entrega
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Clique nas opções abaixo para gerar os formatos específicos que você precisa
                        </p>
                      </div>

                      {/* Pergunta 1: Página de Vendas */}
                      <div className="glass border border-purple-500/30 rounded-xl p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20">
                        <h4 className="text-lg font-bold text-purple-300 mb-4 text-center">
                          📄 Como você deseja construir sua Página de Vendas?
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <button
                            onClick={() => handleGeneratePageFormat('wordpress')}
                            disabled={loading}
                            className="glass border-2 border-blue-500/50 hover:border-blue-400 hover:bg-blue-500/10 rounded-lg p-4 font-semibold text-blue-300 hover:text-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-center"
                          >
                            <div className="text-3xl mb-2">🔧</div>
                            <div className="font-bold">WordPress</div>
                            <div className="text-xs text-gray-400 mt-1">Manual/Elementor</div>
                          </button>
                          <button
                            onClick={() => handleGeneratePageFormat('quiz')}
                            disabled={loading}
                            className="glass border-2 border-green-500/50 hover:border-green-400 hover:bg-green-500/10 rounded-lg p-4 font-semibold text-green-300 hover:text-green-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-center"
                          >
                            <div className="text-3xl mb-2">🎯</div>
                            <div className="font-bold">Quiz</div>
                            <div className="text-xs text-gray-400 mt-1">Funil Diagnóstico</div>
                          </button>
                          <button
                            onClick={() => handleGeneratePageFormat('ia-builder')}
                            disabled={loading}
                            className="glass border-2 border-pink-500/50 hover:border-pink-400 hover:bg-pink-500/10 rounded-lg p-4 font-semibold text-pink-300 hover:text-pink-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-center"
                          >
                            <div className="text-3xl mb-2">🤖</div>
                            <div className="font-bold">IA Builder</div>
                            <div className="text-xs text-gray-400 mt-1">Lovable/Gama</div>
                          </button>
                        </div>
                      </div>

                      {/* Pergunta 2: Formato do Ebook */}
                      <div className="glass border border-purple-500/30 rounded-xl p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20">
                        <h4 className="text-lg font-bold text-purple-300 mb-4 text-center">
                          📘 Como você deseja estruturar seu Ebook?
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <button
                            onClick={() => handleGenerateEbookFormat('canva')}
                            disabled={loading}
                            className="glass border-2 border-cyan-500/50 hover:border-cyan-400 hover:bg-cyan-500/10 rounded-lg p-4 font-semibold text-cyan-300 hover:text-cyan-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-center"
                          >
                            <div className="text-3xl mb-2">🎨</div>
                            <div className="font-bold">Canva</div>
                            <div className="text-xs text-gray-400 mt-1">Design Visual Simples</div>
                          </button>
                          <button
                            onClick={() => handleGenerateEbookFormat('gama')}
                            disabled={loading}
                            className="glass border-2 border-orange-500/50 hover:border-orange-400 hover:bg-orange-500/10 rounded-lg p-4 font-semibold text-orange-300 hover:text-orange-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-center"
                          >
                            <div className="text-3xl mb-2">⚡</div>
                            <div className="font-bold">Gama</div>
                            <div className="text-xs text-gray-400 mt-1">Estrutura Completa</div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default AIChat;
