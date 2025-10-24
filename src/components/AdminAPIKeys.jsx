import { useState } from 'react';
import { Plus, Key, RefreshCw, Trash2 } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import Modal from './Modal';
import Input from './Input';
import { useAPIKeys } from '../hooks/useAPIKeys';
import { useToast } from './Toast';
import { maskAPIKey, formatDate } from '../utils/validation';
import ProgressBar from './ProgressBar';

const AdminAPIKeys = () => {
  const { apiKeys, loading, addAPIKey, updateAPIKey, deleteAPIKey, rotateAPIKey } = useAPIKeys();
  const [showModal, setShowModal] = useState(false);
  const [newKey, setNewKey] = useState({ name: '', key: '', type: 'youtube' });
  const { success, error } = useToast();

  const handleAdd = () => {
    if (!newKey.name || !newKey.key) {
      error('Preencha todos os campos');
      return;
    }

    addAPIKey(newKey);
    success('Chave adicionada com sucesso!');
    setShowModal(false);
    setNewKey({ name: '', key: '', type: 'youtube' });
  };

  const handleRotate = (id) => {
    rotateAPIKey(id);
    success('Chave rotacionada com sucesso!');
  };

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja excluir esta chave?')) {
      deleteAPIKey(id);
      success('Chave excluída!');
    }
  };

  return (
    <>
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Chaves API</h3>
          <Button onClick={() => setShowModal(true)} icon={Plus}>
            Nova Chave
          </Button>
        </div>

        <div className="space-y-4">
          {apiKeys.map((key) => (
            <div
              key={key.id}
              className="glass border border-white/5 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <Key className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{key.name}</h4>
                    <p className="text-sm text-gray-400 font-mono">{maskAPIKey(key.key)}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Último uso: {formatDate(key.lastUsed)}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  key.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {key.status === 'active' ? 'Ativa' : 'Inativa'}
                </span>
              </div>

              <ProgressBar value={key.quota} max={100} label="Quota de Uso" />

              <div className="flex gap-2 mt-4">
                <Button
                  variant="secondary"
                  onClick={() => handleRotate(key.id)}
                  icon={RefreshCw}
                  className="flex-1"
                >
                  Rotacionar
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(key.id)}
                  icon={Trash2}
                  className="flex-1"
                >
                  Excluir
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Adicionar Nova Chave API"
      >
        <div className="space-y-4">
          <Input
            label="Nome da Chave"
            placeholder="Ex: YouTube Data API #1"
            value={newKey.name}
            onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
          />
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Tipo</label>
            <select
              value={newKey.type}
              onChange={(e) => setNewKey({ ...newKey, type: e.target.value })}
              className="w-full glass border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <option value="youtube">YouTube Data API</option>
              <option value="openai">OpenAI API</option>
            </select>
          </div>

          <Input
            label="Chave API"
            type="password"
            placeholder={newKey.type === 'youtube' ? 'AIza...' : 'sk-...'}
            value={newKey.key}
            onChange={(e) => setNewKey({ ...newKey, key: e.target.value })}
          />

          <div className="flex gap-2">
            <Button onClick={handleAdd} className="flex-1">
              Adicionar
            </Button>
            <Button variant="secondary" onClick={() => setShowModal(false)} className="flex-1">
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AdminAPIKeys;
