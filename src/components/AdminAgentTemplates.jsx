// VT: secure-agent - Painel Admin para gerenciar templates de agentes
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit, Trash2, History, Lock, Unlock, 
  Save, X, AlertTriangle, Shield, Eye, EyeOff 
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  listAgentTemplates,
  saveAgentTemplate,
  deactivateAgentTemplate,
  getAgentTemplateHistory
} from '../services/agentsService';
import Button from './Button';
import Card from './Card';
import Modal from './Modal';
import Input from './Input';

export default function AdminAgentTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [showPrompt, setShowPrompt] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    agentId: '',
    name: '',
    description: '',
    promptPlaintext: '',
    model: 'gpt-4o-mini',
    temperature: 0.7,
    max_tokens: 1500,
    changeReason: ''
  });
  
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: '',
    message: '',
    onConfirm: null
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await listAgentTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
      toast.error('Erro ao carregar templates');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      agentId: template.id,
      name: template.name,
      description: template.description,
      promptPlaintext: '', // Admin deve digitar novo prompt
      model: template.model || 'gpt-4o-mini',
      temperature: template.temperature || 0.7,
      max_tokens: template.max_tokens || 1500,
      changeReason: ''
    });
    setShowEditor(true);
  };

  const handleNew = () => {
    setEditingTemplate(null);
    setFormData({
      agentId: '',
      name: '',
      description: '',
      promptPlaintext: '',
      model: 'gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 1500,
      changeReason: ''
    });
    setShowEditor(true);
  };

  const handleSave = async () => {
    try {
      // Validações
      if (!formData.agentId || !formData.name || !formData.promptPlaintext) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      if (!formData.changeReason) {
        toast.error('Motivo da alteração é obrigatório para auditoria');
        return;
      }

      // Confirmar antes de salvar
      setConfirmModal({
        show: true,
        title: '⚠️ Confirmar Alteração de Template',
        message: `Você está prestes a ${editingTemplate ? 'atualizar' : 'criar'} o template "${formData.name}". Esta ação será registrada nos logs de auditoria.`,
        onConfirm: async () => {
          try {
            await saveAgentTemplate(formData.agentId, formData, formData.changeReason);
            toast.success('Template salvo com sucesso!');
            setShowEditor(false);
            loadTemplates();
          } catch (error) {
            console.error('Erro ao salvar:', error);
            toast.error('Erro ao salvar: ' + error.message);
          }
        }
      });
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const handleDeactivate = (template) => {
    setConfirmModal({
      show: true,
      title: '🗑️ Desativar Template',
      message: `Tem certeza que deseja desativar "${template.name}"? O template não poderá mais ser executado.`,
      onConfirm: async () => {
        try {
          await deactivateAgentTemplate(template.id);
          toast.success('Template desativado');
          loadTemplates();
        } catch (error) {
          console.error('Erro ao desativar:', error);
          toast.error('Erro ao desativar template');
        }
      }
    });
  };

  const handleViewHistory = async (template) => {
    try {
      const data = await getAgentTemplateHistory(template.id);
      setHistory(data);
      setShowHistory(true);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      toast.error('Erro ao buscar histórico');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Templates de Agentes IA</h2>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie os prompts criptografados dos agentes
          </p>
        </div>
        <Button onClick={handleNew} variant="primary">
          <Plus className="w-4 h-4 mr-2" />
          Novo Template
        </Button>
      </div>

      {/* Security Notice */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-purple-600 mt-1" />
          <div>
            <h3 className="font-semibold text-purple-900 mb-1">🔒 Área Segura</h3>
            <p className="text-sm text-purple-700">
              Todos os prompts são criptografados com AES-256-GCM antes de serem salvos. 
              Apenas administradores autorizados podem criar/editar templates. 
              Todas as alterações são registradas em logs de auditoria.
            </p>
          </div>
        </div>
      </Card>

      {/* Templates List */}
      {loading ? (
        <Card>
          <p className="text-center text-gray-500">Carregando templates...</p>
        </Card>
      ) : templates.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500">Nenhum template cadastrado</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={template.active === false ? 'opacity-60' : ''}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {template.name}
                      </h3>
                      {template.active === false ? (
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                          Desativado
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                          Ativo
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        v{template.version}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>ID: {template.id}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Prompt Criptografado
                      </span>
                      {template.lastEditedAt && (
                        <>
                          <span>·</span>
                          <span>
                            Editado: {new Date(template.lastEditedAt?.seconds * 1000).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleViewHistory(template)}
                      variant="ghost"
                      size="sm"
                    >
                      <History className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleEdit(template)}
                      variant="ghost"
                      size="sm"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    {template.active !== false && (
                      <Button
                        onClick={() => handleDeactivate(template)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      <Modal
        isOpen={showEditor}
        onClose={() => setShowEditor(false)}
        title={editingTemplate ? 'Editar Template' : 'Novo Template'}
        maxWidth="4xl"
      >
        <div className="space-y-4">
          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <strong>Atenção:</strong> O prompt será criptografado com AES-256-GCM antes de ser salvo. 
                Esta ação será registrada nos logs de auditoria.
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="ID do Agente *"
              placeholder="sophia-fenix"
              value={formData.agentId}
              onChange={(e) => setFormData({ ...formData, agentId: e.target.value })}
              disabled={!!editingTemplate}
            />
            <Input
              label="Nome *"
              placeholder="Sophia Fênix"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Especialista em criar ofertas de alto impacto..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              rows={2}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Prompt do Sistema * 🔒
              </label>
              <button
                onClick={() => setShowPrompt(!showPrompt)}
                className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                {showPrompt ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {showPrompt ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            <textarea
              value={formData.promptPlaintext}
              onChange={(e) => setFormData({ ...formData, promptPlaintext: e.target.value })}
              placeholder="Você é um agente especializado em...&#10;&#10;Instruções:&#10;1. Analise o input do usuário&#10;2. Gere uma oferta completa&#10;3. Retorne em formato JSON"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-sm"
              rows={12}
              type={showPrompt ? 'text' : 'password'}
              style={showPrompt ? {} : { 
                WebkitTextSecurity: 'disc',
                textSecurity: 'disc' 
              }}
            />
            <p className="text-xs text-gray-500 mt-1">
              Este prompt será criptografado antes de ser salvo no banco de dados
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Modelo"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            />
            <Input
              label="Temperature"
              type="number"
              step="0.1"
              min="0"
              max="2"
              value={formData.temperature}
              onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
            />
            <Input
              label="Max Tokens"
              type="number"
              value={formData.max_tokens}
              onChange={(e) => setFormData({ ...formData, max_tokens: parseInt(e.target.value) })}
            />
          </div>

          <Input
            label="Motivo da Alteração (para auditoria) *"
            placeholder="Ajuste no tom de voz / Correção de bugs / Nova funcionalidade..."
            value={formData.changeReason}
            onChange={(e) => setFormData({ ...formData, changeReason: e.target.value })}
          />

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} variant="primary" className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Salvar Template (Será Criptografado)
            </Button>
            <Button onClick={() => setShowEditor(false)} variant="outline">
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>

      {/* History Modal */}
      <Modal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        title="Histórico de Alterações"
      >
        {history.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Nenhum histórico encontrado</p>
        ) : (
          <div className="space-y-3">
            {history.map((entry) => (
              <Card key={entry.id} className="bg-gray-50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {entry.action === 'create' && '✨ Criado'}
                      {entry.action === 'update' && '✏️ Atualizado'}
                      {entry.action === 'deactivate' && '🗑️ Desativado'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {entry.changeReason || 'Sem motivo registrado'}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Versão: {entry.version} · 
                      Hash: {entry.promptHash?.slice(0, 16)}... ·
                      {entry.timestamp && new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Modal>

      {/* Confirm Modal */}
      <Modal
        isOpen={confirmModal.show}
        onClose={() => setConfirmModal({ ...confirmModal, show: false })}
        title={confirmModal.title}
      >
        <div className="space-y-4">
          <p className="text-gray-700">{confirmModal.message}</p>
          <div className="flex gap-3">
            <Button
              onClick={() => {
                confirmModal.onConfirm?.();
                setConfirmModal({ ...confirmModal, show: false });
              }}
              variant="primary"
              className="flex-1"
            >
              Confirmar
            </Button>
            <Button
              onClick={() => setConfirmModal({ ...confirmModal, show: false })}
              variant="outline"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
