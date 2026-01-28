import { useState } from 'react';
import { Youtube, Search, Sparkles, Link as LinkIcon } from 'lucide-react';
import Button from './Button';
import Input from './Input';
import Card from './Card';
import { useToast } from './Toast';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { n8nService } from '../services/n8nService';

const YouTubeExtractor = ({ onUseWithAI }) => {
  const [mode, setMode] = useState('auto');
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { success, error } = useToast();
  const { getLanguageForAI } = useLanguage();

  const handleAction = async () => {
    if (!inputValue.trim()) return error('Preencha o campo');
    setLoading(true);
    try {
      const payload = {
        userId: user.id,
        agente: 'sophia',
        idioma: getLanguageForAI(),
        [mode === 'auto' ? 'tema' : 'youtubeUrl']: inputValue
      };
      const result = await n8nService.generateOffer(payload);
      if (result?.fullResponse) {
        success('✅ Extraído com sucesso!');
        if (onUseWithAI) onUseWithAI(result.fullResponse);
      }
    } catch (err) {
      error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-purple-500/20">
      <div className="flex justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2"><Sparkles className="text-purple-500" /> Nova Estratégia</h3>
        <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
          <button onClick={() => setMode('auto')} className={`px-4 py-2 rounded-lg text-sm ${mode === 'auto' ? 'bg-purple-600 text-white' : 'text-gray-400'}`}>Busca Auto</button>
          <button onClick={() => setMode('manual')} className={`px-4 py-2 rounded-lg text-sm ${mode === 'manual' ? 'bg-purple-600 text-white' : 'text-gray-400'}`}>Link Direto</button>
        </div>
      </div>
      <div className="relative">
        <Input placeholder={mode === 'auto' ? "Tema da oferta..." : "Link do YouTube..."} value={inputValue} onChange={(e) => setInputValue(e.target.value)} icon={mode === 'auto' ? Search : Youtube} />
        <Button onClick={handleAction} loading={loading} className="absolute right-2 top-1/2 -translate-y-1/2 h-9">Gerar</Button>
      </div>
    </Card>
  );
};

export default YouTubeExtractor;
