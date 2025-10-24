import { useState } from 'react';
import { Youtube, Loader2, Copy, Sparkles, Heart, AlertCircle } from 'lucide-react';
import Button from './Button';
import Input from './Input';
import Card from './Card';
import { useToast } from './Toast';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { validateYouTubeUrl } from '../utils/validation';
import { useAPIKeys } from '../hooks/useAPIKeys';
import { extractCommentsFromYouTube } from '../firebase/offers';

const YouTubeExtractor = ({ onUseWithAI }) => {
  const [urls, setUrls] = useState(['', '', '']);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [videoInfo, setVideoInfo] = useState(null);
  const { user, updateUser } = useAuth();
  const { success, error } = useToast();
  const { t } = useLanguage();
  const { youtubeKey, hasYoutubeKey } = useAPIKeys();

  const handleExtract = async () => {
    const validUrls = urls.filter(url => url && validateYouTubeUrl(url));
    
    if (validUrls.length === 0) {
      error('Adicione pelo menos uma URL válida do YouTube');
      return;
    }

    if (!hasYoutubeKey()) {
      error('❌ Chave da API do YouTube não configurada. Configure no painel admin.');
      return;
    }

    if (user.dailyUsage.urls >= user.limits.urls && user.limits.urls !== 999999) {
      error('Limite diário de URLs atingido');
      return;
    }

    setLoading(true);
    
    try {
      // Usar apenas a primeira URL por enquanto
      const videoUrl = validUrls[0];
      
      console.log('🎬 Extraindo comentários reais do YouTube...');
      
      // Extrair comentários reais da API do YouTube
      const result = await extractCommentsFromYouTube(
        videoUrl,
        youtubeKey,
        user.id
      );
      
      setVideoInfo(result.videoInfo);
      setComments(result.comments.map(c => ({
        id: c.id,
        author: c.author,
        authorAvatar: c.authorAvatar,
        text: c.text,
        likes: c.likeCount,
        publishedAt: c.publishedAt,
      })));
      
      // Atualizar uso diário
      updateUser({
        dailyUsage: {
          ...user.dailyUsage,
          urls: user.dailyUsage.urls + validUrls.length,
        },
      });
      
      success(`✅ ${result.comments.length} comentários REAIS extraídos!`);
      
    } catch (err) {
      console.error('Erro ao extrair comentários:', err);
      error(`❌ Erro: ${err.message}`);
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
      {/* Alerta se não tiver chave configurada */}
      {!hasYoutubeKey() && (
        <Card className="border-yellow-500/30 bg-yellow-500/10">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-500 mb-1">
                ⚠️ Chave da API do YouTube não configurada
              </p>
              <p className="text-sm text-yellow-200/80">
                {user?.isAdmin 
                  ? 'Configure a chave no painel admin (Chaves API) para extrair comentários reais.'
                  : 'Entre em contato com o administrador para configurar as chaves de API.'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* URL Inputs */}
      <Card>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Youtube className="w-6 h-6 text-red-500" />
          URLs do YouTube {hasYoutubeKey() && <span className="text-xs text-green-400">(✓ API Ativa)</span>}
        </h3>
        <div className="space-y-3">
          {urls.map((url, index) => (
            <Input
              key={index}
              placeholder={`URL ${index + 1}: https://www.youtube.com/watch?v=...`}
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
          disabled={!hasYoutubeKey()}
          className="w-full mt-4"
        >
          {loading ? 'Extraindo comentários reais...' : '🎬 Extrair Comentários REAIS'}
        </Button>
      </Card>

      {/* Video Info */}
      {videoInfo && (
        <Card className="border-purple-500/30">
          <div className="flex gap-4">
            <img 
              src={videoInfo.thumbnail} 
              alt={videoInfo.title}
              className="w-32 h-20 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h4 className="font-bold text-lg mb-1">{videoInfo.title}</h4>
              <p className="text-sm text-gray-400">{videoInfo.channelTitle}</p>
              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                <span>👁️ {parseInt(videoInfo.viewCount).toLocaleString()} visualizações</span>
                <span>👍 {parseInt(videoInfo.likeCount).toLocaleString()} likes</span>
                <span>💬 {parseInt(videoInfo.commentCount).toLocaleString()} comentários</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Comments List */}
      {comments.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              ✅ {comments.length} Comentários REAIS Extraídos
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
                className="glass border border-white/5 rounded-lg p-4 hover:border-purple-500/30 transition-all"
              >
                <div className="flex items-start gap-3 mb-2">
                  {comment.authorAvatar && (
                    <img 
                      src={comment.authorAvatar} 
                      alt={comment.author}
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <p className="font-semibold text-purple-400">{comment.author}</p>
                      <div className="flex items-center gap-1 text-sm text-gray-400">
                        <Heart className="w-4 h-4" />
                        {comment.likes}
                      </div>
                    </div>
                    <p className="text-gray-300 mt-1">{comment.text}</p>
                    {comment.publishedAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(comment.publishedAt).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default YouTubeExtractor;
