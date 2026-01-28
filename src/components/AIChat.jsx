import { useState, useEffect } from 'react';
import { Sparkles, Copy, Trash2, Globe, RefreshCw, Layers, Zap, MessageSquare } from 'lucide-react';
import Button from './Button';
import Card from './Card';
import { useToast } from './Toast';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { n8nService } from '../services/n8nService';

const AIChat = ({ initialText = '' }) => {
  const [activeTool, setActiveTool] = useState('generator'); // generator, modeler, recover, translator
  const [selectedAgent, setSelectedAgent] = useState('sophia');
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user, updateUser } = useAuth();
  const { success, error } = useToast();
  const { t, getLanguageForAI } = useLanguage();

  useEffect(() => {
    if (initialText) {
      setInputText(initialText);
      setActiveTool('generator');
    }
  }, [initialText]);

  const tools = [
    { id: 'generator', name: 'Criar Oferta', icon: Sparkles, color: 'text-purple-400' },
    { id: 'modeler', name: 'Modelar PV', icon: Layers, color: 'text-blue-400' },
    { id: 'recover', name: 'Recuperar Oferta', icon: RefreshCw, color: 'text-orange-400' },
    { id: 'translator', name: 'Expansão Global', icon: Globe, color: 'text-green-400' },
  ];

  const handleProcess = async () => {
    if (!inputText.trim()) {
      error('Preencha o campo de texto ou URL');
      return;
    }

    setLoading(true);
    try {
      let result;
      const baseData = { userId: user.id, idioma: getLanguageForAI() };

      switch (activeTool) {
        case 'generator':
          result = await n8nService.generateOffer({ ...baseData, tema: inputText, agente: selectedAgent });
          break;
        case 'modeler':
          result = await n8nService.modelSalesPage({ ...baseData, salesPageUrl: inputText });
          break;
        case 'recover':
          result = await n8nService.recoverOffer({ ...baseData, oldOfferText: inputText });
          break;
        case 'translator':
          result = await n8nService.translateOffer({ ...baseData, offerText: inputText });
          break;
        default:
          break;
      }

      if (result && result.fullResponse) {
        setOutput(result);
        success('Processamento concluído!');
      }
    } catch (err) {
      error(err.message || 'Erro ao processar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tool Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => { setActiveTool(tool.id); setOutput(null); }}
            className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
              activeTool === tool.id
                ? 'bg-purple-600/20 border-purple-500 shadow-lg shadow-purple-500/10'
                : 'bg-black/20 border-white/5 hover:border-white/20'
            }`}
          >
            <tool.icon className={`w-6 h-6 ${tool.color}`} />
            <span className="text-xs font-bold text-gray-200">{tool.name}</span>
          </button>
        ))}
      </div>

      {/* Input Area */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            {tools.find(t => t.id === activeTool)?.icon({ size: 20, className: 'text-purple-400' })}
            {activeTool === 'modeler' ? 'URL da Página de Vendas' : 'Conteúdo da Oferta'}
          </h3>
          {output && (
            <button onClick={() => setOutput(null)} className="text-gray-500 hover:text-red-400">
              <Trash2 size={18} />
            </button>
          )}
        </div>
        
        <textarea
          className="w-full h-40 bg-black/40 border border-white/10 rounded-xl p-4 text-gray-200 focus:ring-2 focus:ring-purple-500/50 outline-none resize-none"
          placeholder={activeTool === 'modeler' ? "Cole a URL da página que deseja modelar..." : "Digite ou cole o texto aqui..."}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />

        {activeTool === 'generator' && (
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => setSelectedAgent('sophia')}
              className={`flex-1 p-3 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                selectedAgent === 'sophia' ? 'bg-orange-500/20 border-orange-500 text-orange-300' : 'bg-black/20 border-white/5 text-gray-500'
              }`}
            >
              🔥 Sophia Fênix
            </button>
            <button
              onClick={() => setSelectedAgent('sofia')}
              className={`flex-1 p-3 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                selectedAgent === 'sofia' ? 'bg-blue-500/20 border-blue-500 text-blue-300' : 'bg-black/20 border-white/5 text-gray-500'
              }`}
            >
              🌟 Sofia Universal
            </button>
          </div>
        )}

        <Button onClick={handleProcess} loading={loading} className="w-full mt-6" icon={Zap}>
          {loading ? 'Processando Inteligência...' : 'Executar Comando'}
        </Button>
      </Card>

      {/* Output Area */}
      {output && (
        <Card className="border-purple-500/30 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-purple-300">Resultado da Inteligência</h3>
            <Button variant="secondary" size="sm" onClick={() => {
              navigator.clipboard.writeText(output.fullResponse);
              success('Copiado!');
            }} icon={Copy}>Copiar Tudo</Button>
          </div>

          <div className="glass border border-white/5 rounded-xl p-6 prose prose-invert max-w-none">
            <div className="text-gray-200 whitespace-pre-wrap leading-relaxed">
              {output.fullResponse}
            </div>
          </div>

          {/* Sub-ações de Formato */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
            <button className="p-3 rounded-lg bg-blue-600/10 border border-blue-500/30 text-blue-300 text-xs font-bold hover:bg-blue-600/20 transition-all">
              📄 WordPress
            </button>
            <button className="p-3 rounded-lg bg-pink-600/10 border border-pink-500/30 text-pink-300 text-xs font-bold hover:bg-pink-600/20 transition-all">
              🤖 Lovable Prompt
            </button>
            <button className="p-3 rounded-lg bg-cyan-600/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold hover:bg-cyan-600/20 transition-all">
              🎨 Canva/Gama
            </button>
            <button className="p-3 rounded-lg bg-yellow-600/10 border border-yellow-500/30 text-yellow-300 text-xs font-bold hover:bg-yellow-600/20 transition-all">
              🎯 Quiz Funnel
            </button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AIChat;
