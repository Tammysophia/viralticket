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
    subtitle: '',
    status: 'pendente',
    
    // Campos da oferta gerada pela IA
    bigIdea: '',
    avatar: '',
    promessaPrincipal: '',
    ofertaMatadora: '',
    bullets: [],
    garantia: '',
    chamadaCheckout: '',
    
    // Blocos opcionais
    paginaVendas: '',
    scriptVideos: '',
    conteudoEbook: '',
    fullResponse: '',
    
    // Campos antigos (compatibilidade)
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
        subtitle: offer.subtitle || '',
        status: offer.status || 'pendente',
        
        // Campos da IA
        bigIdea: offer.bigIdea || '',
        avatar: offer.avatar || '',
        promessaPrincipal: offer.promessaPrincipal || '',
        ofertaMatadora: offer.ofertaMatadora || '',
        bullets: offer.bullets || [],
        garantia: offer.garantia || '',
        chamadaCheckout: offer.chamadaCheckout || '',
        
        // Blocos opcionais
        paginaVendas: offer.paginaVendas || '',
        scriptVideos: offer.scriptVideos || '',
        conteudoEbook: offer.conteudoEbook || '',
        fullResponse: offer.fullResponse || '',
        
        // Campos antigos
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
    { id: 'offer', label: 'Oferta', icon: Sparkles },
    { id: 'content', label: 'Conteúdo', icon: Sparkles },
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
              
              <Input
                label="Subtítulo"
                value={formData.subtitle}
                onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                placeholder="Breve descrição da oferta"
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

          {/* ABA: Oferta (Campos da IA) */}
          {activeTab === 'offer' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Big Idea</label>
                <textarea
                  value={formData.bigIdea}
                  onChange={(e) => setFormData(prev => ({ ...prev, bigIdea: e.target.value }))}
                  placeholder="A grande ideia por trás da oferta..."
                  className="w-full h-24 glass border border-purple-500/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Avatar (Público-Alvo)</label>
                <textarea
                  value={formData.avatar}
                  onChange={(e) => setFormData(prev => ({ ...prev, avatar: e.target.value }))}
                  placeholder="Descrição do avatar/cliente ideal..."
                  className="w-full h-20 glass border border-purple-500/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Promessa Principal</label>
                <Input
                  value={formData.promessaPrincipal}
                  onChange={(e) => setFormData(prev => ({ ...prev, promessaPrincipal: e.target.value }))}
                  placeholder="Ex: Emagreça 10kg em 30 dias"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Oferta Matadora</label>
                <textarea
                  value={formData.ofertaMatadora}
                  onChange={(e) => setFormData(prev => ({ ...prev, ofertaMatadora: e.target.value }))}
                  placeholder="O que torna esta oferta irresistível..."
                  className="w-full h-24 glass border border-purple-500/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Bullets / Benefícios</label>
                <textarea
                  value={Array.isArray(formData.bullets) ? formData.bullets.join('\n') : formData.bullets}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    bullets: e.target.value.split('\n').filter(b => b.trim())
                  }))}
                  placeholder="✅ Benefício 1&#10;✅ Benefício 2&#10;✅ Benefício 3"
                  className="w-full h-32 glass border border-purple-500/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">Uma linha por benefício</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Garantia</label>
                <Input
                  value={formData.garantia}
                  onChange={(e) => setFormData(prev => ({ ...prev, garantia: e.target.value }))}
                  placeholder="Ex: 7 dias de garantia incondicional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Chamada para Checkout</label>
                <Input
                  value={formData.chamadaCheckout}
                  onChange={(e) => setFormData(prev => ({ ...prev, chamadaCheckout: e.target.value }))}
                  placeholder="Ex: 🚀 QUERO COMEÇAR AGORA!"
                />
              </div>
            </div>
          )}

          {/* ABA: Conteúdo (Blocos Grandes) */}
          {activeTab === 'content' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Página de Vendas</label>
                <textarea
                  value={formData.paginaVendas}
                  onChange={(e) => setFormData(prev => ({ ...prev, paginaVendas: e.target.value }))}
                  placeholder="Copy completa da página de vendas..."
                  className="w-full h-48 glass border border-purple-500/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Scripts de Vídeos</label>
                <textarea
                  value={formData.scriptVideos}
                  onChange={(e) => setFormData(prev => ({ ...prev, scriptVideos: e.target.value }))}
                  placeholder="Scripts completos dos vídeos..."
                  className="w-full h-40 glass border border-purple-500/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Conteúdo do Ebook</label>
                <textarea
                  value={formData.conteudoEbook}
                  onChange={(e) => setFormData(prev => ({ ...prev, conteudoEbook: e.target.value }))}
                  placeholder="Conteúdo estruturado do ebook..."
                  className="w-full h-40 glass border border-purple-500/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Resposta Completa da IA</label>
                <textarea
                  value={formData.fullResponse}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullResponse: e.target.value }))}
                  placeholder="Resposta completa gerada pela IA..."
                  className="w-full h-64 glass border border-purple-500/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none font-mono text-xs"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">Somente leitura - gerado pela IA</p>
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
