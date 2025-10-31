import { useState } from 'react';
import { Youtube, Loader2, Copy, Sparkles, Heart, CheckCircle } from 'lucide-react';
import Button from './Button';
import Input from './Input';
import Card from './Card';
import { useToast } from './Toast';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { validateYouTubeUrl } from '../utils/validation';
import { verifyAPIConnection, fetchMultipleVideosComments } from '../services/youtubeService';
import { generateOffer } from '../services/openaiService';
import { createOfferFromAI } from '../services/offersService';

const YouTubeExtractor = ({ onUseWithAI }) => {
  const [urls, setUrls] = useState(['', '', '']);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [apiConnected, setApiConnected] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const { user, updateUser } = useAuth();
  const { success, error } = useToast();
  const { t } = useLanguage();

  const handleVerifyConnection = async () => {
    setVerifying(true);
    try {
      const result = await verifyAPIConnection('youtube');
      
      if (result.success) {
        setApiConnected(true);
        success('✅ Conexão com YouTube API estabelecida!');
      } else {
        setApiConnected(false);
        if (user.isAdmin) {
          error(`⚠️ ${result.message}`);
        } else {
          error('⚡ Estamos conectando aos servidores do ViralTicket. Tente novamente em instantes!');
        }
      }
    } catch (err) {
      setApiConnected(false);
      if (user.isAdmin) {
        error(`⚠️ Erro: ${err.message}`);
      } else {
        error('⚡ Erro ao conectar. Tente novamente em instantes!');
      }
    } finally {
      setVerifying(false);
    }
  };

  const generateOffersAutomatically = async (commentsData, urls) => {
    try {
      // Preparar texto dos comentários para a IA
      const commentsText = commentsData.map(c => c.text).join('\n');
      
      // Gerar ofertas com ambos os agentes (sophia e sofia)
      const agents = ['sophia', 'sofia'];
      
      for (const agentId of agents) {
        try {
          console.log(`🤖 Gerando oferta com ${agentId}...`);
          
          // Gerar oferta usando o prompt do Firebase
          const offerData = await generateOffer(commentsText, agentId);
          
          // Salvar oferta no Firestore
          const offerId = await createOfferFromAI({
            userId: user.id,
            title: offerData.title || `Oferta ${agentId.charAt(0).toUpperCase() + agentId.slice(1)}`,
            agent: agentId,
            copy: {
              page: `${offerData.title}\n\n${offerData.subtitle}\n\n${offerData.bullets.join('\n')}\n\n${offerData.cta}\n\n${offerData.bonus}`,
              adPrimary: offerData.bullets.join(' '),
              adHeadline: offerData.title,
              adDescription: offerData.subtitle
            },
            youtubeLinks: urls
          });
          
          console.log(`✅ Oferta ${agentId} salva:`, offerId);
        } catch (agentError) {
          console.error(`❌ Erro ao gerar oferta com ${agentId}:`, agentError);
        }
      }
      
      success('🎯 Ofertas geradas e salvas no Kanban!');
      
    } catch (err) {
      console.error('❌ Erro ao gerar ofertas automaticamente:', err);
      // Não exibir erro para o usuário - ofertas são geradas em background
    }
  };

  const handleExtract = async () => {
    const validUrls = urls.filter(url => url && validateYouTubeUrl(url));
    
    if (validUrls.length === 0) {
      error('Adicione pelo menos uma URL válida do YouTube');
      return;
    }

    if (user.dailyUsage.urls >= user.limits.urls && user.limits.urls !== 'unlimited') {
      error('Limite diário de URLs atingido');
      return;
    }

    setLoading(true);
    
    try {
      // Verificar conexão antes de buscar
      const connectionCheck = await verifyAPIConnection('youtube');
      
      if (!connectionCheck.success) {
        if (user.isAdmin) {
          error(`⚠️ ${connectionCheck.message}`);
        } else {
          error('⚡ Estamos conectando aos servidores do ViralTicket. Tente novamente em instantes!');
        }
        setLoading(false);
        return;
      }

      // Buscar comentários reais
      const fetchedComments = await fetchMultipleVideosComments(validUrls, 50);
      
      if (fetchedComments.length === 0) {
        error('Nenhum comentário encontrado nos vídeos');
        setLoading(false);
        return;
      }

      setComments(fetchedComments);
      updateUser({
        dailyUsage: {
          ...user.dailyUsage,
          urls: user.dailyUsage.urls + validUrls.length,
        },
      });
      success(`${fetchedComments.length} comentários extraídos com sucesso!`);
      setApiConnected(true);

      // Gerar ofertas automaticamente com ambos os agentes
      await generateOffersAutomatically(fetchedComments, validUrls);
    } catch (err) {
      console.error('Erro ao extrair comentários:', err);
      if (user.isAdmin) {
        error(`⚠️ ${err.message}`);
      } else {
        error('⚡ Erro ao extrair comentários. Tente novamente!');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAll = () => {
    const text = comments.map(c => `${c.author}: ${c.text}`).join('\n');
    navigator.clipboard.writeText(text);
    success('Comentários copiados!');
  };

  const handleUseWithAI = () => {
    const text = comments.map(c => c.text).join('\n');
    onUseWithAI(text);
    success('Comentários enviados para IA!');
  };

  return (
    <div className="space-y-6">
      {/* URL Inputs */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Youtube className="w-6 h-6 text-red-500" />
            URLs do YouTube
          </h3>
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

        <div className="space-y-3">
          {urls.map((url, index) => (
            <Input
              key={index}
              placeholder={`URL ${index + 1}`}
              value={url}
              onChange={(e) => {
                const newUrls = [...urls];
                newUrls[index] = e.target.value;
                setUrls(newUrls);
              }}
              icon={Youtube}
            />
          ))}
        </div>
        <Button
          onClick={handleExtract}
          loading={loading}
          className="w-full mt-4"
        >
          {t('extractComments')}
        </Button>
      </Card>

      {/* Comments List */}
      {comments.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">
              {comments.length} {t('comments')}
            </h3>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleCopyAll} icon={Copy}>
                {t('copyAll')}
              </Button>
              <Button onClick={handleUseWithAI} icon={Sparkles}>
                {t('useWithAI')}
              </Button>
            </div>
          </div>
          
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="glass border border-white/5 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="font-semibold text-purple-400">{comment.author}</p>
                  <div className="flex items-center gap-1 text-sm text-gray-400">
                    <Heart className="w-4 h-4" />
                    {comment.likes}
                  </div>
                </div>
                <p className="text-gray-300">{comment.text}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default YouTubeExtractor;
