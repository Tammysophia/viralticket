import { useState } from 'react';
import { Youtube, Search, Sparkles, Link as LinkIcon, Loader2 } from 'lucide-react';
import Button from './Button';
import Input from './Input';
import Card from './Card';
import { useToast } from './Toast';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { n8nService } from '../services/n8nService';

const YouTubeExtractor = ({ onUseWithAI }) => {
  const [mode, setMode] = useState('auto'); // 'auto' ou 'manual'
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { success, error } = useToast();
  const { t, getLanguageForAI } = useLanguage();

  const handleAction = async () => {
    if (!inputValue.trim()) {
      error(mode === 'auto' ? 'Digite um tema para buscar' : 'Insira um link do YouTube');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        userId: user.id,
        agente: 'sophia', // Padrão inicial
        idioma: getLanguageForAI(),
        [mode === 'auto' ? 'tema' : 'youtubeUrl']: inputValue
      };

      const result = await n8nService.generateOffer(payload);
      
      if (result && result.fullResponse) {
        success('✅ Inteligência de mercado extraída com sucesso!');
        if (onUseWithAI) onUseWithAI(result.fullResponse);
      }
    } catch (err) {
      error(err.message || 'Erro ao processar requisição');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-purple-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-500" />
              Nova Estratégia de Vendas
            </h3>
            <p className="text-gray-400 text-sm">
              Escolha como deseja alimentar a inteligência da sua oferta.
            </p>
          </div>
          
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => { setMode('auto'); setInputValue(''); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                mode === 'auto' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Search size={16} /> Busca Automática
            </button>
            <button
              onClick={() => { setMode('manual'); setInputValue(''); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                mode === 'manual' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
              }`}
            >
              <LinkIcon size={16} /> Link Direto
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Input
              placeholder={mode === 'auto' ? "Ex: Como sair de um relacionamento abusivo" : "Cole o link do vídeo do YouTube aqui"}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              icon={mode === 'auto' ? Search : Youtube}
              className="pr-32"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
               <Button
                onClick={handleAction}
                loading={loading}
                size="sm"
                className="h-9"
              >
                {loading ? 'Processando...' : 'Gerar Agora'}
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="glass p-3 rounded-lg border border-white/5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">✓</div>
              <span className="text-xs text-gray-400">Análise de Dores</span>
            </div>
            <div className="glass p-3 rounded-lg border border-white/5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">✓</div>
              <span className="text-xs text-gray-400">Desejos Ocultos</span>
            </div>
            <div className="glass p-3 rounded-lg border border-white/5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500">✓</div>
              <span className="text-xs text-gray-400">Objeções Reais</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default YouTubeExtractor;
