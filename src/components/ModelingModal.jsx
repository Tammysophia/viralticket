import { useState } from 'react';
import { TrendingUp, ExternalLink, Calendar, Target } from 'lucide-react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import { useToast } from './Toast';

const ModelingModal = ({ isOpen, onClose, offer, onSave }) => {
  const [formData, setFormData] = useState({
    salesPageUrl: '',
    checkoutUrl: '',
    fanpageUrl: '',
    creativesCount: 1,
    startDate: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.salesPageUrl || !formData.checkoutUrl) {
      error('Preencha os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      await onSave(offer.id, formData);
      success('Modelagem iniciada com sucesso! 📈');
      onClose();
    } catch (err) {
      error('Erro ao iniciar modelagem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📈 Modelar Oferta">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="glass-dark border border-primary-purple/20 rounded-lg p-4 mb-4">
          <h4 className="font-bold text-primary-lilac mb-1">{offer?.title}</h4>
          <p className="text-sm text-zinc-400">{offer?.agent}</p>
        </div>

        <Input
          label="Link da Página de Vendas *"
          placeholder="https://..."
          value={formData.salesPageUrl}
          onChange={(e) => setFormData({ ...formData, salesPageUrl: e.target.value })}
          icon={ExternalLink}
          required
        />

        <Input
          label="Link do Checkout *"
          placeholder="https://..."
          value={formData.checkoutUrl}
          onChange={(e) => setFormData({ ...formData, checkoutUrl: e.target.value })}
          icon={ExternalLink}
          required
        />

        <Input
          label="Link da Fanpage"
          placeholder="https://facebook.com/..."
          value={formData.fanpageUrl}
          onChange={(e) => setFormData({ ...formData, fanpageUrl: e.target.value })}
          icon={ExternalLink}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Criativos em Teste"
            type="number"
            min="1"
            value={formData.creativesCount}
            onChange={(e) => setFormData({ ...formData, creativesCount: parseInt(e.target.value) })}
            icon={Target}
          />

          <Input
            label="Data de Início"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            icon={Calendar}
          />
        </div>

        <div className="glass-dark border border-gold-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gold-500 mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="font-semibold">Duração do Monitoramento</span>
          </div>
          <p className="text-2xl font-bold text-gold-500">7 dias</p>
          <p className="text-sm text-zinc-400 mt-1">
            Acompanhamento automático de performance e análise de escalabilidade
          </p>
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" loading={loading} className="flex-1" variant="gold">
            Iniciar Modelagem
          </Button>
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ModelingModal;
