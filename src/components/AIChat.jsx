import { useState, useEffect } from 'react';
import { Sparkles, Copy, Trash2, Globe, RefreshCw, Layers, Zap } from 'lucide-react';
import Button from './Button';
import Card from './Card';
import { useToast } from './Toast';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { n8nService } from '../services/n8nService';

const AIChat = ({ initialText = '' }) => {
  const [activeTool, setActiveTool] = useState('generator');
  const [selectedAgent, setSelectedAgent] = useState('sophia');
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { success, error } = useToast();
  const { getLanguageForAI } = useLanguage();

  useEffect(() => { if (initialText) setInputText(initialText); }, [initialText]);

  const handleProcess = async () => {
    if (!inputText.trim()) return error('Preencha o campo');
    setLoading(true);
    try {
      let result;
      const baseData = { userId: user.id, idioma: getLanguageForAI() };
      if (activeTool === 'generator') result = await n8nService.generateOffer({ ...baseData, tema: inputText, agente: selectedAgent });
      else if (activeTool === 'modeler') result = await n8nService.modelSalesPage({ ...baseData, salesPageUrl: inputText });
      else if (activeTool === 'recover') result = await n8nService.recoverOffer({ ...baseData, oldOfferText: inputText });
      else if (activeTool === 'translator') result = await n8nService.translateOffer({ ...baseData, offerText: inputText });
      
      if (result?.fullResponse) setOutput(result);
    } catch (err) { error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-3">
        {[
          { id: 'generator', name: 'Oferta', icon: Sparkles },
          { id: 'modeler', name: 'Modelar', icon: Layers },
          { id: 'recover', name: 'Recuperar', icon: RefreshCw },
          { id: 'translator', name: 'Global', icon: Globe }
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTool(t.id)} className={`p-4 rounded-xl border flex flex-col items-center gap-2 ${activeTool === t.id ? 'bg-purple-600/20 border-purple-500' : 'bg-black/20 border-white/5'}`}>
            <t.icon size={20} /> <span className="text-xs font-bold">{t.name}</span>
          </button>
        ))}
      </div>
      <Card>
        <textarea className="w-full h-40 bg-black/40 border border-white/10 rounded-xl p-4 text-gray-200 outline-none" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Digite aqui..." />
        <Button onClick={handleProcess} loading={loading} className="w-full mt-4" icon={Zap}>Executar</Button>
      </Card>
      {output && (
        <Card className="border-purple-500/30">
          <div className="flex justify-between mb-4"><h3 className="font-bold">Resultado</h3><Button size="sm" onClick={() => { navigator.clipboard.writeText(output.fullResponse); success('Copiado!'); }} icon={Copy}>Copiar</Button></div>
          <div className="text-gray-200 whitespace-pre-wrap text-sm">{output.fullResponse}</div>
        </Card>
      )}
    </div>
  );
};

export default AIChat;
