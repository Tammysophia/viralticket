import { useState, useEffect } from 'react';
import { Sparkles, Copy, Trash2 } from 'lucide-react';
import Button from './Button';
import Card from './Card';
import { useToast } from './Toast';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../config/supabase';

const AIChat = ({ initialText = '' }) => {
  const [output, setOutput] = useState(null);
  const { user } = useAuth();
  const { success, error } = useToast();

  useEffect(() => {
    if (initialText) {
      setOutput(initialText);
      saveOfferToSupabase(initialText);
    }
  }, [initialText]);

  const saveOfferToSupabase = async (content) => {
    if (!user?.id) return;
    try {
      await supabase.from('offers').insert([{
        user_id: user.id,
        content: content,
        created_at: new Date().toISOString()
      }]);
      success('📝 Oferta salva no histórico!');
    } catch (err) {
      console.error('Erro ao salvar oferta:', err);
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    success('Oferta copiada!');
  };

  const handleClear = () => {
    if (window.confirm('Deseja limpar o painel?')) {
      setOutput(null);
    }
  };

  if (!output) {
    return (
      <Card className="flex flex-col items-center justify-center p-12 text-center">
        <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-purple-500" />
        </div>
        <h3 className="text-xl font-bold mb-2">Sua oferta aparecerá aqui</h3>
        <p className="text-gray-400 max-w-md">
          Use o formulário ao lado para descrever seu tema e nossa IA criará uma oferta completa para você.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            Oferta Gerada
          </h3>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleCopy} icon={Copy}>
              Copiar
            </Button>
            <Button variant="danger" size="sm" onClick={handleClear} icon={Trash2}>
              Limpar
            </Button>
          </div>
        </div>

        <div className="prose prose-invert max-w-none">
          <div className="whitespace-pre-wrap text-gray-300 leading-relaxed">
            {output}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AIChat;
