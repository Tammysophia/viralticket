import { useState } from 'react';
import { Youtube, Loader2, Copy, Sparkles, Heart } from 'lucide-react';
import Button from './Button';
import Input from './Input';
import Card from './Card';
import { useToast } from './Toast';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { validateYouTubeUrl } from '../utils/validation';

const YouTubeExtractor = ({ onUseWithAI }) => {
  const [urls, setUrls] = useState(['', '', '']);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const { user, updateUser } = useAuth();
  const { success, error } = useToast();
  const { t } = useLanguage();

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
    
    // Simulação de extração
    setTimeout(() => {
      const mockComments = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        author: `Usuário ${i + 1}`,
        text: `Este é um comentário de exemplo #${i + 1}. Adorei o conteúdo!`,
        likes: Math.floor(Math.random() * 1000),
      }));
      
      setComments(mockComments);
      updateUser({
        dailyUsage: {
          ...user.dailyUsage,
          urls: user.dailyUsage.urls + validUrls.length,
        },
      });
      success(`${mockComments.length} comentários extraídos com sucesso!`);
      setLoading(false);
    }, 2000);
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
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Youtube className="w-6 h-6 text-red-500" />
          URLs do YouTube
        </h3>
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
                  <p className="font-semibold text-primary-lilac">{comment.author}</p>
                  <div className="flex items-center gap-1 text-sm text-zinc-400">
                    <Heart className="w-4 h-4" />
                    {comment.likes}
                  </div>
                </div>
                <p className="text-zinc-300">{comment.text}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default YouTubeExtractor;
