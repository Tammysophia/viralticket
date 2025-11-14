// VT: Formulário para adicionar ofertas de monitoramento
import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import { useAuth } from '../hooks/useAuth';
import { createOfferFromAI } from '../services/offersService';
import toast from 'react-hot-toast';

const MonitoringForm = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    fanpageUrl: '',
    salesPageUrl: '',
    checkoutUrl: '',
    creativesCount: 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'creativesCount' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Digite um título para a oferta');
      return;
    }

    setLoading(true);
    try {
      await createOfferFromAI({
        userId: user.id,
        title: formData.title,
        subtitle: formData.subtitle,
        type: 'monitoramento',
        status: 'monitorando',
        agent: 'Manual',
        copy: {
          page: '',
          adPrimary: '',
          adHeadline: formData.title,
          adDescription: formData.subtitle
        },
        modeling: {
          fanpageUrl: formData.fanpageUrl,
          salesPageUrl: formData.salesPageUrl,
          checkoutUrl: formData.checkoutUrl,
          creativesCount: formData.creativesCount,
          monitorStart: new Date().toISOString(),
          monitorDays: 7,
          trend: null,
          modelavel: false
        },
        youtubeLinks: []
      });

      toast.success('Oferta de monitoramento criada!');
      setFormData({
        title: '',
        subtitle: '',
        fanpageUrl: '',
        salesPageUrl: '',
        checkoutUrl: '',
        creativesCount: 0,
      });
      onClose();
    } catch (error) {
      console.error('Erro ao criar monitoramento:', error);
      toast.error('Erro ao criar monitoramento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Monitoramento">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Título da Oferta *"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Ex: Curso de Marketing Digital"
          required
        />

        <Input
          label="Descrição"
          name="subtitle"
          value={formData.subtitle}
          onChange={handleChange}
          placeholder="Breve descrição da oferta"
        />

        <Input
          label="URL da Fanpage"
          name="fanpageUrl"
          value={formData.fanpageUrl}
          onChange={handleChange}
          placeholder="https://facebook.com/..."
          type="url"
        />

        <Input
          label="URL da Página de Vendas"
          name="salesPageUrl"
          value={formData.salesPageUrl}
          onChange={handleChange}
          placeholder="https://..."
          type="url"
        />

        <Input
          label="URL do Checkout"
          name="checkoutUrl"
          value={formData.checkoutUrl}
          onChange={handleChange}
          placeholder="https://..."
          type="url"
        />

        <Input
          label="Quantidade de Criativos"
          name="creativesCount"
          value={formData.creativesCount}
          onChange={handleChange}
          type="number"
          min="0"
          max="50"
          placeholder="0"
        />

        <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4">
          <p className="text-xs text-cyan-300 mb-2">
            ℹ️ <strong>Monitoramento Automático</strong>
          </p>
          <p className="text-xs text-gray-400">
            O sistema irá monitorar automaticamente esta oferta por 7 dias. 
            Você pode preencher os campos manualmente ou deixar em branco para adicionar depois.
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Criando...' : 'Criar Monitoramento'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default MonitoringForm;
