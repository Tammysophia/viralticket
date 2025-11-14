// VT: Formulário para adicionar/editar modelagem de ofertas
import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import { useAuth } from '../hooks/useAuth';
import { createOfferFromAI, updateOffer } from '../services/offersService';
import toast from 'react-hot-toast';

const ModelingForm = ({ isOpen, onClose, offer = null }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    salesPageCopy: '',
    creativeCopy: '',
    fanpageUrl: '',
    salesPageUrl: '',
    checkoutUrl: '',
    creativesCount: 0,
    notes: ''
  });

  useEffect(() => {
    if (offer) {
      setFormData({
        title: offer.title || '',
        description: offer.subtitle || '',
        salesPageCopy: offer.modeling?.salesPageCopy || '',
        creativeCopy: offer.modeling?.creativeCopy || '',
        fanpageUrl: offer.modeling?.fanpageUrl || '',
        salesPageUrl: offer.modeling?.salesPageUrl || '',
        checkoutUrl: offer.modeling?.checkoutUrl || '',
        creativesCount: offer.modeling?.creativesCount || 0,
        notes: offer.modeling?.notes || ''
      });
    }
  }, [offer]);

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
      toast.error('Digite um título para a modelagem');
      return;
    }

    setLoading(true);
    try {
      if (offer) {
        // Atualizar modelagem existente
        await updateOffer(offer.id, {
          title: formData.title,
          subtitle: formData.description,
          modeling: {
            ...offer.modeling,
            salesPageCopy: formData.salesPageCopy,
            creativeCopy: formData.creativeCopy,
            fanpageUrl: formData.fanpageUrl,
            salesPageUrl: formData.salesPageUrl,
            checkoutUrl: formData.checkoutUrl,
            creativesCount: formData.creativesCount,
            notes: formData.notes
          }
        });
        toast.success('Modelagem atualizada!');
      } else {
        // Criar nova modelagem
        await createOfferFromAI({
          userId: user.id,
          title: formData.title,
          subtitle: formData.description,
          type: 'modelagem',
          status: 'pendente',
          agent: 'Manual',
          copy: {
            page: formData.salesPageCopy,
            adPrimary: formData.creativeCopy,
            adHeadline: formData.title,
            adDescription: formData.description
          },
          modeling: {
            salesPageCopy: formData.salesPageCopy,
            creativeCopy: formData.creativeCopy,
            fanpageUrl: formData.fanpageUrl,
            salesPageUrl: formData.salesPageUrl,
            checkoutUrl: formData.checkoutUrl,
            creativesCount: formData.creativesCount,
            notes: formData.notes,
            monitorStart: null,
            monitorDays: 7,
            trend: null,
            modelavel: false
          },
          youtubeLinks: []
        });
        toast.success('Modelagem criada!');
      }

      setFormData({
        title: '',
        description: '',
        salesPageCopy: '',
        creativeCopy: '',
        fanpageUrl: '',
        salesPageUrl: '',
        checkoutUrl: '',
        creativesCount: 0,
        notes: ''
      });
      onClose();
    } catch (error) {
      console.error('Erro ao salvar modelagem:', error);
      toast.error('Erro ao salvar modelagem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={offer ? 'Editar Modelagem' : 'Adicionar Modelagem'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Título da Modelagem *"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Ex: Modelagem - Curso de Marketing"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Descrição da Modelagem
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Descreva o que você está modelando..."
            rows={3}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Copy da Página de Vendas
          </label>
          <textarea
            name="salesPageCopy"
            value={formData.salesPageCopy}
            onChange={handleChange}
            placeholder="Cole aqui o copy da página de vendas que você está modelando..."
            rows={5}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Copy de Criativo
          </label>
          <textarea
            name="creativeCopy"
            value={formData.creativeCopy}
            onChange={handleChange}
            placeholder="Cole aqui o copy dos criativos que você está modelando..."
            rows={4}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
          />
        </div>

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

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Anotações
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Anotações adicionais sobre esta modelagem..."
            rows={3}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
          <p className="text-xs text-purple-300 mb-2">
            ℹ️ <strong>Sobre Modelagem</strong>
          </p>
          <p className="text-xs text-gray-400">
            Use este espaço para organizar e documentar as ofertas que você está modelando. 
            Salve copies, links e anotações importantes para referência futura.
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
            {loading ? 'Salvando...' : (offer ? 'Atualizar' : 'Criar Modelagem')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ModelingForm;
