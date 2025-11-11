// VT: Painel Admin para gerenciar Agentes GPTs
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, ExternalLink, Eye, EyeOff } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import Input from './Input';
import toast from 'react-hot-toast';
import { 
  getAllAgents, 
  createAgent, 
  updateAgent, 
  deleteAgent,
  initializeDefaultAgents 
} from '../services/gptAgentsService';

const AdminGPTAgents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAgent, setEditingAgent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '🤖',
    imageUrl: '',
    url: '',
    active: false,
    order: 1
  });

  // VT: Carregar agentes
  const loadAgents = async () => {
    setLoading(true);
    try {
      const data = await getAllAgents();
      if (data.length === 0) {
        // Inicializar agentes padrão
        await initializeDefaultAgents();
        const freshData = await getAllAgents();
        setAgents(freshData);
      } else {
        setAgents(data);
      }
    } catch (error) {
      console.error('VT: Erro ao carregar agentes:', error);
      toast.error('Erro ao carregar agentes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  // VT: Iniciar edição
  const handleEdit = (agent) => {
    setEditingAgent(agent.id);
    setFormData({
      name: agent.name,
      description: agent.description,
      icon: agent.icon || '🤖',
      imageUrl: agent.imageUrl || '',
      url: agent.url || '',
      active: agent.active,
      order: agent.order
    });
  };

  // VT: Cancelar edição
  const handleCancel = () => {
    setEditingAgent(null);
    setFormData({
      name: '',
      description: '',
      icon: '🤖',
      imageUrl: '',
      url: '',
      active: false,
      order: 1
    });
  };

  // VT: Salvar agente
  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Nome do agente é obrigatório');
      return;
    }

    try {
      if (editingAgent) {
        await updateAgent(editingAgent, formData);
        toast.success('✅ Agente atualizado!');
      } else {
        await createAgent({ ...formData, order: agents.length + 1 });
        toast.success('✅ Agente criado!');
      }
      handleCancel();
      loadAgents();
    } catch (error) {
      toast.error('Erro ao salvar agente');
      console.error('VT: Erro ao salvar:', error);
    }
  };

  // VT: Excluir agente
  const handleDelete = async (id, name) => {
    if (!confirm(`Deseja excluir o agente "${name}"?`)) return;

    try {
      await deleteAgent(id);
      toast.success('🗑️ Agente excluído!');
      loadAgents();
    } catch (error) {
      toast.error('Erro ao excluir agente');
      console.error('VT: Erro ao excluir:', error);
    }
  };

  // VT: Toggle ativo/inativo
  const handleToggleActive = async (agent) => {
    try {
      await updateAgent(agent.id, { active: !agent.active });
      toast.success(`Agente ${!agent.active ? 'ativado' : 'desativado'}!`);
      loadAgents();
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">🤖 Gerenciar Agentes GPTs</h2>
            <p className="text-gray-400">Configure os links dos agentes ChatGPT disponíveis para os usuários</p>
          </div>
          <Button onClick={() => setEditingAgent('new')}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Agente
          </Button>
        </div>
      </Card>

      {/* Form de Edição/Criação */}
      {(editingAgent === 'new' || editingAgent) && (
        <Card gradient>
          <h3 className="text-xl font-bold mb-4">
            {editingAgent === 'new' ? '➕ Novo Agente' : '✏️ Editar Agente'}
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome do Agente"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Coach Modelar"
              />
              
              <Input
                label="Ícone (Emoji)"
                value={formData.icon}
                onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                placeholder="🤖"
                maxLength="2"
              />
            </div>

            <Input
              label="Descrição"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Breve descrição do que o agente faz..."
            />

            <Input
              label="🖼️ URL da Imagem PNG"
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
              placeholder="https://exemplo.com/imagem-agente.png"
            />

            <Input
              label="URL do ChatGPT"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://chat.openai.com/g/..."
            />

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="activeAgent"
                checked={formData.active}
                onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                className="w-4 h-4 rounded border-purple-500/30 bg-purple-600/20 checked:bg-purple-600"
              />
              <label htmlFor="activeAgent" className="text-sm text-gray-300">
                Agente ativo (visível para usuários)
              </label>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
              <Button onClick={handleCancel} variant="secondary" className="flex-1">
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Lista de Agentes */}
      <Card>
        <h3 className="text-xl font-bold mb-4">📋 Agentes Cadastrados ({agents.length})</h3>
        
        {agents.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>Nenhum agente cadastrado ainda.</p>
            <p className="text-sm mt-2">Clique em "Novo Agente" para adicionar.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className={`glass border ${
                  agent.active ? 'border-green-500/30' : 'border-gray-500/30'
                } rounded-lg p-4 transition-all`}
              >
                <div className="flex items-start gap-4">
                  {/* Ícone/Imagem */}
                  <div className="flex-shrink-0">
                    {agent.imageUrl ? (
                      <img 
                        src={agent.imageUrl} 
                        alt={agent.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-purple-500/30"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                    ) : null}
                    <div className={agent.imageUrl ? 'text-4xl hidden' : 'text-4xl'}>{agent.icon || '🤖'}</div>
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-lg">{agent.name}</h4>
                      {agent.active ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                          Ativo
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-500/20 text-gray-400">
                          Inativo
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{agent.description}</p>
                    
                    {agent.url ? (
                      <a
                        href={agent.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 truncate max-w-md"
                      >
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{agent.url}</span>
                      </a>
                    ) : (
                      <p className="text-xs text-red-400">⚠️ URL não configurada</p>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleToggleActive(agent)}
                      className={`p-2 rounded-lg transition-colors ${
                        agent.active
                          ? 'bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400'
                          : 'bg-green-600/20 hover:bg-green-600/30 text-green-400'
                      }`}
                      title={agent.active ? 'Desativar' : 'Ativar'}
                    >
                      {agent.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    
                    <button
                      onClick={() => handleEdit(agent)}
                      className="p-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(agent.id, agent.name)}
                      className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Info */}
      <Card>
        <div className="flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div className="flex-1">
            <h4 className="font-bold mb-2">Como configurar?</h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>1. Crie seus GPTs personalizados no ChatGPT</li>
              <li>2. Copie o link compartilhável do GPT</li>
              <li>3. Cole aqui no campo "URL do ChatGPT"</li>
              <li>4. Ative o agente para aparecer no painel dos usuários</li>
              <li>5. Usuários clicarão e serão redirecionados para o ChatGPT</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminGPTAgents;
