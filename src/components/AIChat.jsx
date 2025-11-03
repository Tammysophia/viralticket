import { useState } from 'react';
import { Sparkles, Copy, Loader2, CheckCircle } from 'lucide-react';
import Button from './Button';
import Card from './Card';
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
  const [chatHistory, setChatHistory] = useState([]);
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

    // Verificar e resetar limite diário se necessário
    const today = new Date().toISOString().split('T')[0]; // "2025-10-29"
    let currentOffers = user.dailyUsage.offers;
    let lastOfferDate = user.lastOfferDate || null;

    // Se é um novo dia, resetar contador
    if (lastOfferDate !== today) {
      currentOffers = 0;
      console.log('🔄 Novo dia detectado! Resetando contador de ofertas.');
    }

    // Verificar limite (admins não têm limite)
    if (user.limits.offers !== 'unlimited' && currentOffers >= user.limits.offers) {
      error(`⏰ Limite diário de ${user.limits.offers} ofertas atingido. Tente novamente amanhã!`);
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
      
      // Atualizar contador e data
      updateUser({
        dailyUsage: {
          ...user.dailyUsage,
          offers: currentOffers + 1,
        },
        lastOfferDate: today,
      });
      
      success(`✅ Oferta gerada! (${currentOffers + 1}/${user.limits.offers === 'unlimited' ? '∞' : user.limits.offers} hoje)`);
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
        console.log('VT: Oferta salva automaticamente:', offerId);
        success('📝 Oferta salva no Kanban!');
      } catch (saveError) {
        console.error('VT: Erro ao salvar oferta:', saveError);
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
    
    // Se tiver conteúdo completo, copiar ele todo
    const text = output.fullContent || `${output.title}\n\n${output.subtitle}\n\n${output.bullets.join('\n')}\n\n${output.cta}\n\n${output.bonus}`;
    navigator.clipboard.writeText(text);
    success(output.fullContent ? 'Resposta completa copiada!' : 'Oferta copiada!');
  };

  const handleChatWithAI = async (choice) => {
    if (!output) return;

    setLoading(true);
    try {
      // IA responde com base na escolha do usuário
      const response = await generateOffer(
        `O usuário escolheu: ${choice}. Gere APENAS essa parte específica agora (sem mais perguntas).`,
        selectedAgent
      );

      // Adicionar resposta ao histórico
      const newHistory = [
        { role: 'user', content: `Escolhi: ${choice}` },
        { role: 'assistant', content: response.fullContent || response.rawData }
      ];
      
      setChatHistory(newHistory);
      success(`✅ ${choice} gerado!`);
    } catch (err) {
      error('Erro ao gerar resposta da IA');
      console.error(err);
    } finally {
      setLoading(false);
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

            {/* Responder escolha da IA (quando ela perguntar algo) */}
            {output.fullContent && output.fullContent.includes('Pergunte:') && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="glass border border-purple-500/30 rounded-lg p-4">
                  <h4 className="font-bold mb-3 text-purple-300">💬 A IA fez uma pergunta. Escolha uma opção:</h4>
                  
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleChatWithAI('WordPress')}
                      className="px-4 py-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-white transition-colors"
                    >
                      🔧 WordPress (manual)
                    </button>
                    <button
                      onClick={() => handleChatWithAI('Quiz')}
                      className="px-4 py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-white transition-colors"
                    >
                      🎯 Quiz
                    </button>
                    <button
                      onClick={() => handleChatWithAI('Lovable')}
                      className="px-4 py-2 rounded-lg bg-pink-600/20 hover:bg-pink-600/30 text-white transition-colors"
                    >
                      🤖 Lovable/Builder AI
                    </button>
                  </div>

                  {chatHistory.length > 0 && (
                    <div className="mt-4 p-3 rounded-lg bg-green-600/20">
                      <p className="text-sm text-white">{chatHistory[chatHistory.length - 1]?.content}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Conteúdo completo gerado pela IA com formatação markdown */}
            {output.fullContent && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Resposta Completa da IA
                </h3>
                
                {/* Botões de ação rápida */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={() => {
                      const pvSection = output.fullContent.split('###')[0];
                      navigator.clipboard.writeText(pvSection);
                      success('📄 Copy da Página copiado!');
                    }}
                    className="px-4 py-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-sm transition-colors"
                  >
                    📄 Copiar Página de Vendas
                  </button>
                  <button
                    onClick={() => {
                      const quizMatch = output.fullContent.match(/### 🧠 FUNIL COM QUIZ[\s\S]*?(?=###|$)/);
                      if (quizMatch) {
                        navigator.clipboard.writeText(quizMatch[0]);
                        success('🎯 Quiz copiado!');
                      }
                    }}
                    className="px-4 py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-sm transition-colors"
                  >
                    🎯 Copiar Quiz
                  </button>
                  <button
                    onClick={() => {
                      const ebookMatch = output.fullContent.match(/### 📘 EBOOK CURADOR[\s\S]*?(?=###|$)/);
                      if (ebookMatch) {
                        navigator.clipboard.writeText(ebookMatch[0]);
                        success('📘 Ebook copiado!');
                      }
                    }}
                    className="px-4 py-2 rounded-lg bg-green-600/20 hover:bg-green-600/30 text-green-300 text-sm transition-colors"
                  >
                    📘 Copiar Ebook
                  </button>
                  <button
                    onClick={() => {
                      const lovableMatch = output.fullContent.match(/### 💻 CONSTRUÇÃO DA PÁGINA[\s\S]*?(?=###|$)/);
                      if (lovableMatch) {
                        navigator.clipboard.writeText(lovableMatch[0]);
                        success('🤖 Prompt Lovable copiado!');
                      }
                    }}
                    className="px-4 py-2 rounded-lg bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 text-sm transition-colors"
                  >
                    🤖 Copiar Prompt Lovable
                  </button>
                </div>

                <div className="glass border border-white/10 rounded-lg p-6 max-h-[600px] overflow-y-auto bg-gray-900/50">
                  {output.rawData ? (
                    // Exibir dados estruturados do JSON
                    <div className="space-y-6 text-white" style={{ fontSize: '15px', lineHeight: '1.7' }}>
                      
                      {/* Diagnóstico */}
                      {output.rawData.diagnostic && (
                        <div>
                          <h3 className="text-lg font-bold text-white mb-3">💭 Diagnóstico Emocional</h3>
                          <p className="text-gray-200">{output.rawData.diagnostic.interpretation}</p>
                          <p className="text-sm text-gray-400 mt-2">
                            Tipo de apego: {output.rawData.diagnostic.attachmentType} | 
                            Urgência: {output.rawData.diagnostic.urgencyLevel}
                          </p>
                        </div>
                      )}

                      {/* Micro Ofertas */}
                      {output.rawData.microOffers && (
                        <div>
                          <h3 className="text-lg font-bold text-white mb-3">🎯 Micro-Ofertas Criadas</h3>
                          {output.rawData.microOffers.map((offer, idx) => (
                            <div key={idx} className="mb-3 pl-4 border-l-2 border-purple-500">
                              <p className="font-semibold text-white">{idx + 1}. {offer.name}</p>
                              <p className="text-gray-300 text-sm">{offer.promise}</p>
                              <p className="text-gray-400 text-xs mt-1">💰 {offer.priceSuggestion}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Top 3 */}
                      {output.rawData.top3 && (
                        <div>
                          <h3 className="text-lg font-bold text-white mb-3">🏆 Top 3 Ofertas Mestres</h3>
                          {output.rawData.top3.map((offer, idx) => (
                            <div key={idx} className="mb-3 p-3 rounded bg-purple-600/10">
                              <p className="font-bold text-white">{offer.name}</p>
                              <p className="text-gray-300 text-sm">{offer.why}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Ebook */}
                      {output.rawData.ebookOutline && (
                        <div>
                          <h3 className="text-lg font-bold text-white mb-3">📘 Estrutura do Ebook</h3>
                          <ol className="list-decimal list-inside space-y-1 text-gray-200">
                            {output.rawData.ebookOutline.map((chapter, idx) => (
                              <li key={idx}>{chapter}</li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {/* Quiz */}
                      {output.rawData.quizQuestions && (
                        <div>
                          <h3 className="text-lg font-bold text-white mb-3">🎯 Quiz Interativo</h3>
                          <ol className="list-decimal list-inside space-y-1 text-gray-200">
                            {output.rawData.quizQuestions.map((q, idx) => (
                              <li key={idx}>{q}</li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {/* Criativos */}
                      {output.rawData.creativeSuggestions && (
                        <div>
                          <h3 className="text-lg font-bold text-white mb-3">🎨 Sugestões Visuais</h3>
                          <p className="text-gray-300">{output.rawData.creativeSuggestions.mainMockup}</p>
                          {output.rawData.creativeSuggestions.palette && (
                            <div className="flex gap-2 mt-2">
                              {output.rawData.creativeSuggestions.palette.map((color, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <div style={{ width: 24, height: 24, backgroundColor: color, borderRadius: 4 }}></div>
                                  <span className="text-xs text-gray-400">{color}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* JSON Completo (colapsável) */}
                      <details className="mt-4">
                        <summary className="cursor-pointer text-purple-400 hover:text-purple-300">
                          📋 Ver JSON Completo
                        </summary>
                        <pre className="mt-2 p-4 bg-black/30 rounded text-xs text-gray-400 overflow-x-auto">
                          {JSON.stringify(output.rawData, null, 2)}
                        </pre>
                      </details>
                    </div>
                  ) : (
                    // Fallback: exibir como texto
                    <pre className="text-white text-sm whitespace-pre-wrap leading-relaxed">
                      {output.fullContent}
                    </pre>
                  )}
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
