import { useState, useEffect } from 'react';
import { Sparkles, Copy, Loader2, CheckCircle, Trash2 } from 'lucide-react';
import Button from './Button';
import Card from './Card';
import { useToast } from './Toast';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { verifyAPIConnection, generateOffer } from '../services/openaiService';
import { createOfferFromAI } from '../services/offersService';

const AIChat = ({ initialText = '' }) => {
  const [selectedAgent, setSelectedAgent] = useState('sophia');
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const { user, updateUser } = useAuth();
  const { success, error } = useToast();
  const { t, getLanguageForAI } = useLanguage();

  // VT: Carregar oferta salva do localStorage quando componente montar
  useEffect(() => {
    const savedOutput = localStorage.getItem('vt_last_offer');
    const savedInput = localStorage.getItem('vt_last_input');
    const savedAgent = localStorage.getItem('vt_last_agent');
    
    if (savedOutput) {
      try {
        setOutput(JSON.parse(savedOutput));
        console.log('✅ VT: Oferta anterior restaurada do localStorage');
      } catch (e) {
        console.error('❌ VT: Erro ao restaurar oferta:', e);
      }
    }
    if (savedInput) setInputText(savedInput);
    if (savedAgent) setSelectedAgent(savedAgent);
  }, []);

  // VT: Salvar output no localStorage sempre que mudar
  useEffect(() => {
    if (output) {
      localStorage.setItem('vt_last_offer', JSON.stringify(output));
      localStorage.setItem('vt_last_input', inputText);
      localStorage.setItem('vt_last_agent', selectedAgent);
      console.log('💾 VT: Oferta salva no localStorage');
    }
  }, [output, inputText, selectedAgent]);

  // Atualizar inputText quando initialText mudar (comentários do YouTube)
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
      image: 'https://iili.io/KbegFWu.png',
      description: 'Especialista em ofertas de alto impacto',
      color: 'from-orange-500 to-red-600',
    },
    {
      id: 'sofia',
      name: 'Sofia Universal',
      emoji: '🌟',
      image: 'https://iili.io/KieLs1V.png',
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

      // Gerar oferta com OpenAI no idioma selecionado
      const offerData = await generateOffer(inputText, selectedAgent, getLanguageForAI());

      setOutput(offerData);
      updateUser({
        dailyUsage: {
          ...user.dailyUsage,
          offers: user.dailyUsage.offers + 1,
        },
      });
      success('Oferta gerada com sucesso!');
      setApiConnected(true);

      // VT: Salvar oferta automaticamente no Firestore COM TODOS OS CAMPOS
      try {
        console.log('💾 VT: Salvando oferta completa no Kanban...');
        
        const copyContent = offerData.fullResponse || `${offerData.title}\n\n${offerData.subtitle}\n\n${offerData.bullets?.join('\n') || ''}\n\n${offerData.cta}\n\n${offerData.bonus}`;
        
        // VT: Se tem vídeos do YouTube no input, extrair e salvar automaticamente
        const youtubeLinks = [];
        const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/g;
        let match;
        while ((match = youtubeRegex.exec(inputText)) !== null) {
          const fullUrl = match[0].startsWith('http') ? match[0] : `https://www.youtube.com/watch?v=${match[1]}`;
          if (!youtubeLinks.includes(fullUrl)) {
            youtubeLinks.push(fullUrl);
          }
        }
        
        const offerId = await createOfferFromAI({
          userId: user.id,
          title: offerData.title || 'Nova Oferta',
          subtitle: offerData.subtitle || '',
          agent: selectedAgent,
          
          // VT: Salvar fullResponse em TODOS os campos para garantir que aparecem no editor
          bigIdea: offerData.fullResponse || '',
          avatar: '', // Será preenchido manualmente ou por parsing futuro
          promessaPrincipal: offerData.subtitle || '',
          ofertaMatadora: offerData.fullResponse || '',
          bullets: offerData.bullets || [],
          garantia: offerData.bonus || '',
          chamadaCheckout: offerData.cta || '',
          
          // Blocos de conteúdo
          paginaVendas: offerData.fullResponse || '',
          scriptVideos: '',
          conteudoEbook: '',
          criativos: '',
          fullResponse: offerData.fullResponse || '',
          
          // Campos antigos (compatibilidade)
          copy: {
            page: copyContent,
            adPrimary: offerData.bullets?.join(' ') || '',
            adHeadline: offerData.title,
            adDescription: offerData.subtitle
          },
          youtubeLinks: youtubeLinks // VT: Links extraídos automaticamente
        });
        
        console.log('✅ VT: Oferta salva no Kanban com TODOS os campos:', offerId);
        if (youtubeLinks.length > 0) {
          console.log('🎥 VT: Links do YouTube salvos automaticamente:', youtubeLinks);
        }
        success('📝 Oferta salva no Kanban!');
      } catch (saveError) {
        console.error('❌ VT: Erro ao salvar oferta:', saveError);
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
    
    // VT: Se tem fullResponse, copiar ela; senão copiar o formato antigo
    const text = output.fullResponse || `${output.title}\n\n${output.subtitle}\n\n${output.bullets?.join('\n') || ''}\n\n${output.cta}\n\n${output.bonus}`;
    navigator.clipboard.writeText(text);
    success('Oferta copiada!');
  };

  // VT: Limpar oferta do painel (botão lixeira)
  const handleClearOutput = () => {
    if (window.confirm('🗑️ Tem certeza que deseja apagar esta oferta do painel?\n\n(A oferta já salva no Kanban não será afetada)')) {
      setOutput(null);
      setInputText('');
      localStorage.removeItem('vt_last_offer');
      localStorage.removeItem('vt_last_input');
      localStorage.removeItem('vt_last_agent');
      success('🗑️ Oferta apagada do painel!');
      console.log('🗑️ VT: Oferta removida do localStorage');
    }
  };

  // VT: Gerar criativos (posts + vídeos)
  const handleGenerateCreatives = async () => {
    if (!output || !output.title) {
      error('Por favor, gere a oferta principal primeiro');
      return;
    }

    setLoading(true);
    try {
      console.log('🎨 VT: Gerando criativos...');

      // NÃO repetir análise - só gerar criativos
      const creativesPrompt = `Você já fez a análise. AGORA gere APENAS os CRIATIVOS:

✅ 5 POSTS ESTÁTICOS (1080x1080) numerados
✅ 5 VÍDEOS CURTOS (Reels/TikTok) numerados
✅ Para cada: Copy + Ideia visual + Descrição
✅ NÃO repita análise anterior

COMECE DIRETO:
POST 1:
[conteúdo do post]`;

      // Chamar IA para gerar criativos no idioma selecionado
      const creativesData = await generateOffer(creativesPrompt, selectedAgent, getLanguageForAI());

      // Adicionar ao output existente
      setOutput(prev => ({
        ...prev,
        fullResponse: prev.fullResponse + '\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n### 🎨 CRIATIVOS (POSTS + VÍDEOS)\n\n' + (creativesData.fullResponse || 'Criativos gerados com sucesso!')
      }));

      success('✅ Criativos gerados (Posts + Vídeos)!');
    } catch (err) {
      console.error('❌ VT: Erro ao gerar criativos:', err);
      error('Erro ao gerar criativos');
    } finally {
      setLoading(false);
    }
  };

  // VT: Gerar formato específico da Página de Vendas
  const handleGeneratePageFormat = async (format) => {
    if (!output || !output.title) {
      error('Por favor, gere a oferta principal primeiro');
      return;
    }

    setLoading(true);

    try {
      console.log(`📄 VT: Gerando página de vendas em formato ${format}...`);

      const formatNames = {
        'wordpress': 'WordPress (manual/Elementor)',
        'quiz': 'Quiz (funil diagnóstico)',
        'ia-builder': 'IA Builder (Lovable/Gama)'
      };

      // ✅ NOVO: Mapear formato para nome do prompt específico no Firebase
      const promptMapping = {
        'wordpress': 'wordpress',
        'quiz': 'quiz',
        'ia-builder': 'lovable'  // ia-builder usa o prompt lovable
      };
      
      const specificPromptType = promptMapping[format];
      
      console.log(`🎯 VT: Buscando prompt específico: ${selectedAgent}_${specificPromptType}`);
      
      // ✅ Contexto mínimo com informações da oferta já gerada
      const offerContext = `OFERTA CAMPEÃ JÁ DEFINIDA:
Título: ${output.title}
Subtítulo: ${output.subtitle}
Benefícios: ${output.bullets.join(', ')}
CTA: ${output.cta}
Bônus: ${output.bonus}

Gere APENAS o formato solicitado usando essas informações.`;

      // ✅ Chamar generateOffer com prompt específico do Firebase
      const pageData = await generateOffer(offerContext, selectedAgent, getLanguageForAI(), specificPromptType);

      // Adicionar ao output existente
      setOutput(prev => ({
        ...prev,
        fullResponse: prev.fullResponse + '\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n### 📄 PÁGINA DE VENDAS - ' + formatNames[format].toUpperCase() + '\n\n' + (pageData.fullResponse || 'Página gerada com sucesso!')
      }));

      success(`✅ Página de vendas (${formatNames[format]}) gerada!`);
    } catch (err) {
      console.error(`❌ VT: Erro ao gerar página formato ${format}:`, err);
      error(`Erro ao gerar página ${format}`);
    } finally {
      setLoading(false);
    }
  };

  // VT: Gerar formato específico do Ebook
  const handleGenerateEbookFormat = async (format) => {
    if (!output || !output.title) {
      error('Por favor, gere a oferta principal primeiro');
      return;
    }

    setLoading(true);

    try {
      console.log(`📘 VT: Gerando ebook em formato ${format}...`);

      const formatNames = {
        'canva': 'Canva (design visual simples)',
        'gama': 'Gama (estrutura completa)'
      };

      // ✅ NOVO: Usar prompts específicos do Firebase para Ebook
      // Nota: Ebook usa o mesmo sistema de prompts separados
      // Os prompts no Firebase devem ser: sophia_canva, sophia_gama, sofia_canva, sofia_gama
      
      const specificPromptType = format; // 'canva' ou 'gama'
      
      console.log(`📘 VT: Buscando prompt específico de ebook: ${selectedAgent}_${specificPromptType}`);
      
      // ✅ Contexto mínimo com informações da oferta já gerada
      const offerContext = `OFERTA CAMPEÃ JÁ DEFINIDA:
Título: ${output.title}
Subtítulo: ${output.subtitle}
Benefícios: ${output.bullets.join(', ')}
CTA: ${output.cta}
Bônus: ${output.bonus}

Gere APENAS o ebook no formato solicitado usando essas informações.`;

      // ✅ Chamar generateOffer com prompt específico do Firebase
      const ebookData = await generateOffer(offerContext, selectedAgent, getLanguageForAI(), specificPromptType);

      // Adicionar ao output existente
      setOutput(prev => ({
        ...prev,
        fullResponse: prev.fullResponse + '\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n### 📘 EBOOK - ' + formatNames[format].toUpperCase() + '\n\n' + (ebookData.fullResponse || 'Ebook gerado com sucesso!')
      }));

      success(`✅ Ebook (${formatNames[format]}) gerado!`);
    } catch (err) {
      console.error(`❌ VT: Erro ao gerar ebook formato ${format}:`, err);
      error(`Erro ao gerar ebook ${format}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Agent Selection */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">{t('selectAI')}</h3>
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
                  : 'border-white/10 hover:border-purple-400 hover:bg-transparent'
              }`}
            >
              <div className="flex items-center justify-center mb-3">
                <img 
                  src={agent.image} 
                  alt={agent.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-purple-500/30"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div className="text-4xl" style={{ display: 'none' }}>{agent.emoji}</div>
              </div>
              <h4 className="font-bold mb-1 text-white">{agent.name}</h4>
              <p className="text-sm text-gray-300">{agent.description}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Input */}
      <Card>
        <h3 className="text-xl font-bold mb-4">{t('commentOrText')}</h3>
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
            <h3 className="text-xl font-bold">{t('offerGenerated')}</h3>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleCopy} icon={Copy}>
                {t('copy')}
              </Button>
              <Button 
                variant="danger" 
                onClick={handleClearOutput} 
                icon={Trash2}
                className="bg-red-500/20 hover:bg-red-500/30 border-red-500/50"
              >
                {t('clearPanel')}
              </Button>
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
              {output.bullets && output.bullets.map((bullet, index) => (
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
                    <img 
                      src={selectedAgent === 'sophia' ? 'https://iili.io/KbegFWu.png' : 'https://iili.io/KieLs1V.png'}
                      alt={selectedAgent === 'sophia' ? 'Sophia Fênix' : 'Sofia Universal'}
                      className="w-12 h-12 rounded-full object-cover border-2 border-purple-500/50"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'inline-block';
                      }}
                    />
                    <span className="text-3xl" style={{ display: 'none' }}>🔥</span>
                    {t('completeAnalysis')} {selectedAgent === 'sophia' ? 'Sophia Fênix' : 'Sofia Universal'}
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
                          .replace(/^---+$/gm, '<hr class="my-8 border-purple-500/30"/>')
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
                      {t('copyCompleteAnalysis')}
                    </button>

                    {/* VT: Botões de escolha - SEMPRE APARECEM */}
                    {output.fullResponse && (
                      <div className="space-y-6">
                        {/* Separador visual */}
                        <div className="my-8 border-t-2 border-purple-500/30"></div>
                        
                      <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                          🎨 {t('chooseDeliveryFormats')}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {t('clickOptionsBelow')}
                        </p>
                      </div>

                      {/* Pergunta 1: Página de Vendas */}
                      <div className="glass border border-purple-500/30 rounded-xl p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20">
                        <h4 className="text-lg font-bold text-purple-300 mb-4 text-center">
                          📄 {t('howBuildSalesPage')}
                        </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button
                              onClick={() => handleGeneratePageFormat('wordpress')}
                              disabled={loading}
                              className="glass border-2 border-blue-500/50 hover:border-blue-400 hover:bg-blue-500/10 rounded-lg p-4 font-semibold text-blue-300 hover:text-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-center"
                          >
                            <div className="text-3xl mb-2">🔧</div>
                            <div className="font-bold">{t('wordpress')}</div>
                            <div className="text-xs text-gray-400 mt-1">{t('wordpressDesc')}</div>
                          </button>
                          <button
                            onClick={() => handleGeneratePageFormat('quiz')}
                            disabled={loading}
                            className="glass border-2 border-green-500/50 hover:border-green-400 hover:bg-green-500/10 rounded-lg p-4 font-semibold text-green-300 hover:text-green-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-center"
                          >
                            <div className="text-3xl mb-2">🎯</div>
                            <div className="font-bold">{t('quiz')}</div>
                            <div className="text-xs text-gray-400 mt-1">{t('quizDesc')}</div>
                          </button>
                          <button
                            onClick={() => handleGeneratePageFormat('ia-builder')}
                            disabled={loading}
                            className="glass border-2 border-pink-500/50 hover:border-pink-400 hover:bg-pink-500/10 rounded-lg p-4 font-semibold text-pink-300 hover:text-pink-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-center"
                          >
                            <div className="text-3xl mb-2">🤖</div>
                            <div className="font-bold">{t('iaBuilder')}</div>
                            <div className="text-xs text-gray-400 mt-1">{t('iaBuilderDesc')}</div>
                          </button>
                          </div>
                        </div>

                      {/* Pergunta 2: Formato do Ebook */}
                      <div className="glass border border-purple-500/30 rounded-xl p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20">
                        <h4 className="text-lg font-bold text-purple-300 mb-4 text-center">
                          📘 {t('howStructureEbook')}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <button
                            onClick={() => handleGenerateEbookFormat('canva')}
                            disabled={loading}
                            className="glass border-2 border-cyan-500/50 hover:border-cyan-400 hover:bg-cyan-500/10 rounded-lg p-4 font-semibold text-cyan-300 hover:text-cyan-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-center"
                          >
                            <div className="text-3xl mb-2">🎨</div>
                            <div className="font-bold">{t('canva')}</div>
                            <div className="text-xs text-gray-400 mt-1">{t('canvaDesc')}</div>
                          </button>
                          <button
                            onClick={() => handleGenerateEbookFormat('gama')}
                            disabled={loading}
                            className="glass border-2 border-orange-500/50 hover:border-orange-400 hover:bg-orange-500/10 rounded-lg p-4 font-semibold text-orange-300 hover:text-orange-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-center"
                          >
                            <div className="text-3xl mb-2">⚡</div>
                            <div className="font-bold">{t('gama')}</div>
                            <div className="text-xs text-gray-400 mt-1">{t('gamaDesc')}</div>
                          </button>
                        </div>
                      </div>

                      {/* Pergunta 3: Gerar Criativos */}
                      <div className="glass border border-yellow-500/30 rounded-xl p-6 bg-gradient-to-br from-yellow-900/20 to-orange-900/20">
                        <h4 className="text-lg font-bold text-yellow-300 mb-4 text-center">
                          🎨 {t('generateCreativesCopy')}
                        </h4>
                        <p className="text-gray-400 text-sm text-center mb-4">
                          {t('creativesDesc')}
                        </p>
                        <button
                          onClick={handleGenerateCreatives}
                          disabled={loading}
                          className="glass border-2 border-yellow-500/50 hover:border-yellow-400 hover:bg-yellow-500/10 rounded-lg p-4 font-semibold text-yellow-300 hover:text-yellow-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-center w-full"
                        >
                          <div className="text-3xl mb-2">✨</div>
                          <div className="font-bold">{t('generateCreatives')}</div>
                          <div className="text-xs text-gray-400 mt-1">{t('creativesCount')}</div>
                        </button>
                      </div>
                      </div>
                    )}
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
