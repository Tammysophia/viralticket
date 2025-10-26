// VT: Editor completo de ofertas com 4 abas
import { useState, useEffect } from 'react';
import { X, Save, Sparkles, Link as LinkIcon, Upload, TrendingUp, Trash2 } from 'lucide-react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import toast from 'react-hot-toast';
import { updateOffer, addYoutubeLink, removeYoutubeLink } from '../services/offersService';
import { getServiceAPIKey } from '../hooks/useAPIKeys';

const OfferEditor = ({ isOpen, onClose, offer }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [formData, setFormData] = useState({
    title: '',
    status: 'execucao',
    copy: {
      page: '',
      adPrimary: '',
      adHeadline: '',
      adDescription: ''
    },
    modeling: {
      fanpageUrl: '',
      salesPageUrl: '',
      checkoutUrl: '',
      creativesCount: 0,
      monitorStart: null,
      monitorDays: 7,
      trend: null,
      modelavel: false
    },
    youtubeLinks: []
  });
  const [newLink, setNewLink] = useState('');
  const [saving, setSaving] = useState(false);

  // VT: Carregar dados da oferta
  useEffect(() => {
    if (offer) {
      setFormData({
        title: offer.title || '',
        status: offer.status || 'execucao',
        copy: offer.copy || { page: '', adPrimary: '', adHeadline: '', adDescription: '' },
        modeling: offer.modeling || {
          fanpageUrl: '',
          salesPageUrl: '',
          checkoutUrl: '',
          creativesCount: 0,
          monitorStart: null,
          monitorDays: 7,
          trend: null,
          modelavel: false
        },
        youtubeLinks: offer.youtubeLinks || []
      });
    }
  }, [offer]);

  // VT: Salvar alterações
  const handleSave = async () => {
    if (!offer?.id) return;
    
    setSaving(true);
    try {
      await updateOffer(offer.id, formData);
      toast.success('💾 Oferta salva com sucesso!');
      onClose();
    } catch (error) {
      toast.error('❌ Erro ao salvar oferta');
      console.error('VT: Erro ao salvar:', error);
    } finally {
      setSaving(false);
    }
  };

  // VT: Adicionar link do YouTube
  const handleAddLink = async () => {
    if (!newLink || !newLink.includes('youtube.com') && !newLink.includes('youtu.be')) {
      toast.error('Link inválido do YouTube');
      return;
    }

    try {
      await addYoutubeLink(offer.id, newLink);
      setFormData(prev => ({
        ...prev,
        youtubeLinks: [...prev.youtubeLinks, newLink]
      }));
      setNewLink('');
      toast.success('Link adicionado!');
    } catch (error) {
      toast.error('Erro ao adicionar link');
    }
  };

  // VT: Remover link do YouTube
  const handleRemoveLink = async (link) => {
    try {
      await removeYoutubeLink(offer.id, link);
      setFormData(prev => ({
        ...prev,
        youtubeLinks: prev.youtubeLinks.filter(l => l !== link)
      }));
      toast.success('Link removido!');
    } catch (error) {
      toast.error('Erro ao remover link');
    }
  };

  // VT: Gerar texto com IA (placeholder - integrar com openaiService)
  const handleGenerateWithAI = async (field) => {
    toast('🤖 Geração com IA em breve...', { icon: '⚙️' });
    // TODO: Integrar com openaiService para gerar texto específico
  };

  // VT: Iniciar monitoramento
  const handleStartMonitoring = () => {
    setFormData(prev => ({
      ...prev,
      modeling: {
        ...prev.modeling,
        monitorStart: new Date().toISOString()
      }
    }));
    toast.success('Monitoramento iniciado!');
  };

  // VT: Calcular trend (placeholder - lógica completa necessita histórico)
  const calculateTrend = () => {
    const { creativesCount } = formData.modeling;
    if (creativesCount > 20) return 'subindo';
    if (creativesCount > 10) return 'estavel';
    return 'caindo';
  };

  const tabs = [
    { id: 'details', label: 'Detalhes', icon: Sparkles },
    { id: 'copy', label: 'Cópias', icon: Sparkles },
    { id: 'videos', label: 'Vídeos', icon: LinkIcon },
    { id: 'modeling', label: 'Modelagem', icon: TrendingUp },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editor de Oferta" size="xl">
      <div className="flex flex-col h-[600px]">
        {/* VT: Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10 pb-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-600/30 text-purple-300'
                    : 'hover:bg-white/5 text-gray-400'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* VT: Conteúdo das abas */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {/* ABA: Detalhes */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              <Input
                label="Nome da Oferta"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Curso de Marketing Digital"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full glass border border-purple-500/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  <option value="pendente">Pendente</option>
                  <option value="execucao">Em Execução</option>
                  <option value="modelando">Modelando</option>
                  <option value="concluido">Concluído</option>
                </select>
              </div>
            </div>
          )}

          {/* ABA: Cópias */}
          {activeTab === 'copy' && (
            <div className="space-y-6">
              {/* Página de Vendas */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-300">Página de Vendas</label>
                  <Button
                    onClick={() => handleGenerateWithAI('page')}
                    variant="secondary"
                    className="text-xs"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Gerar com IA
                  </Button>
                </div>
                <textarea
                  value={formData.copy.page}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    copy: { ...prev.copy, page: e.target.value }
                  }))}
                  placeholder="Cole ou gere a copy da página de vendas..."
                  className="w-full h-32 glass border border-purple-500/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                />
              </div>

              {/* Criativo - Texto Principal */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-300">Criativo - Texto Principal</label>
                  <Button
                    onClick={() => handleGenerateWithAI('adPrimary')}
                    variant="secondary"
                    className="text-xs"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Gerar com IA
                  </Button>
                </div>
                <textarea
                  value={formData.copy.adPrimary}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    copy: { ...prev.copy, adPrimary: e.target.value }
                  }))}
                  placeholder="Texto principal do anúncio..."
                  className="w-full h-24 glass border border-purple-500/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                />
              </div>

              {/* Headline */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-300">Headline</label>
                  <Button
                    onClick={() => handleGenerateWithAI('adHeadline')}
                    variant="secondary"
                    className="text-xs"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Gerar com IA
                  </Button>
                </div>
                <Input
                  value={formData.copy.adHeadline}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    copy: { ...prev.copy, adHeadline: e.target.value }
                  }))}
                  placeholder="Headline do anúncio..."
                />
              </div>

              {/* Descrição */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-300">Descrição</label>
                  <Button
                    onClick={() => handleGenerateWithAI('adDescription')}
                    variant="secondary"
                    className="text-xs"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Gerar com IA
                  </Button>
                </div>
                <textarea
                  value={formData.copy.adDescription}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    copy: { ...prev.copy, adDescription: e.target.value }
                  }))}
                  placeholder="Descrição do anúncio..."
                  className="w-full h-20 glass border border-purple-500/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                />
              </div>
            </div>
          )}

          {/* ABA: Vídeos */}
          {activeTab === 'videos' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Adicionar Vídeo</label>
                <div className="flex gap-2">
                  <Input
                    value={newLink}
                    onChange={(e) => setNewLink(e.target.value)}
                    placeholder="Cole o link do YouTube..."
                    className="flex-1"
                  />
                  <Button onClick={handleAddLink}>
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Vídeos de Origem ({formData.youtubeLinks.length})</label>
                {formData.youtubeLinks.length === 0 ? (
                  <p className="text-gray-500 text-sm py-4 text-center">Nenhum vídeo adicionado</p>
                ) : (
                  <div className="space-y-2">
                    {formData.youtubeLinks.map((link, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 glass border border-purple-500/20 rounded-lg">
                        <LinkIcon className="w-4 h-4 text-red-500" />
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-sm text-purple-400 hover:text-purple-300 truncate"
                        >
                          {link}
                        </a>
                        <button
                          onClick={() => handleRemoveLink(link)}
                          className="p-1 hover:bg-red-500/20 rounded text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ABA: Modelagem */}
          {activeTab === 'modeling' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="URL da Fanpage"
                  type="url"
                  value={formData.modeling.fanpageUrl}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    modeling: { ...prev.modeling, fanpageUrl: e.target.value }
                  }))}
                  placeholder="https://facebook.com/..."
                />
                
                <Input
                  label="URL da Página de Vendas"
                  type="url"
                  value={formData.modeling.salesPageUrl}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    modeling: { ...prev.modeling, salesPageUrl: e.target.value }
                  }))}
                  placeholder="https://..."
                />
              </div>

              <Input
                label="URL do Checkout"
                type="url"
                value={formData.modeling.checkoutUrl}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  modeling: { ...prev.modeling, checkoutUrl: e.target.value }
                }))}
                placeholder="https://..."
              />

              <Input
                label="Quantidade de Criativos"
                type="number"
                min="0"
                value={formData.modeling.creativesCount}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  modeling: { ...prev.modeling, creativesCount: parseInt(e.target.value) || 0 }
                }))}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Dias de Monitoramento"
                  type="number"
                  min="1"
                  max="30"
                  value={formData.modeling.monitorDays}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    modeling: { ...prev.modeling, monitorDays: parseInt(e.target.value) || 7 }
                  }))}
                />

                {!formData.modeling.monitorStart && (
                  <div className="flex items-end">
                    <Button onClick={handleStartMonitoring} className="w-full">
                      Iniciar Monitoramento
                    </Button>
                  </div>
                )}
              </div>

              {/* VT: Status de monitoramento */}
              {formData.modeling.monitorStart && (
                <div className="p-4 glass border border-purple-500/20 rounded-lg space-y-2">
                  <h4 className="font-semibold text-sm">Status do Monitoramento</h4>
                  <p className="text-xs text-gray-400">
                    Iniciado em: {new Date(formData.modeling.monitorStart).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                        style={{ width: '50%' }} // TODO: Calcular progresso real
                      />
                    </div>
                    <span className="text-xs text-gray-400">3/7 dias</span>
                  </div>
                  
                  {formData.modeling.trend && (
                    <div className="mt-2">
                      {formData.modeling.trend === 'subindo' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm">
                          📈 Tendência: Subindo
                        </span>
                      )}
                      {formData.modeling.trend === 'estavel' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm">
                          ➡️ Tendência: Estável
                        </span>
                      )}
                      {formData.modeling.trend === 'caindo' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm">
                          📉 Tendência: Caindo
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* VT: Rodapé com botões */}
        <div className="flex gap-2 pt-4 border-t border-white/10 mt-4">
          <Button onClick={handleSave} loading={saving} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
          <Button onClick={onClose} variant="secondary" className="flex-1">
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default OfferEditor;
