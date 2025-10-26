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
