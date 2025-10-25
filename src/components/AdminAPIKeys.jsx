import { useState } from 'react';
import { Plus, Key, RefreshCw, Trash2, Lock, Save, Shield } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import Modal from './Modal';
import Input from './Input';
import { useAPIKeys } from '../hooks/useAPIKeys';
import toast from 'react-hot-toast';
import { maskAPIKey, formatDate } from '../utils/validation';
import ProgressBar from './ProgressBar';
import { useAuth } from '../hooks/useAuth';
import { saveAPIKey as saveToFirestore } from '../services/firebaseService';
import { encrypt, decrypt, isEncrypted } from '../utils/cryptoUtils';

const AdminAPIKeys = () => {
  const { user } = useAuth();
  const { apiKeys, loading, keysLoaded, addAPIKey, updateAPIKey, deleteAPIKey, rotateAPIKey, encryptAPIKey } = useAPIKeys();
  const [showModal, setShowModal] = useState(false);
  const [newKey, setNewKey] = useState({ name: '', key: '', type: 'youtube' });

  // Proteção adicional - não renderizar se não for admin
  if (!user?.isAdmin) {
    return (
      <Card>
        <p className="text-center text-gray-400">🎯 O sistema está em operação normal.</p>
      </Card>
    );
  }

  // Mostrar loading enquanto carrega
  if (!keysLoaded) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400 text-lg">Carregando chaves...</p>
        </div>
      </Card>
    );
  }

  const handleAdd = async () => {
    if (!newKey.name || !newKey.key) {
      toast.error('📝 Preencha todos os campos');
      return;
    }

    try {
      // Criptografar a chave antes de salvar
      const encryptedKey = encrypt(newKey.key);
      
      // Tentar salvar no Firestore (com fallback para localStorage)
      try {
        await saveToFirestore(newKey.type, {
          name: newKey.name,
          key: encryptedKey,
          type: newKey.type,
          status: 'active',
          quota: 0,
          encrypted: true,
          lastUsed: new Date().toISOString(),
        });
      } catch (firestoreError) {
        console.warn('Firestore save failed, using localStorage:', firestoreError);
        // Fallback: salvar direto no localStorage via hook
      }

      // Atualizar estado local (sempre funciona)
      addAPIKey({
        ...newKey,
        key: encryptedKey,
        encrypted: true,
      });

      toast.success('✅ Chave adicionada e criptografada com sucesso!');
      setShowModal(false);
      setNewKey({ name: '', key: '', type: 'youtube' });
    } catch (err) {
      toast.error('❌ Erro ao adicionar chave: ' + err.message);
    }
  };

  const handleRotate = (id) => {
    rotateAPIKey(id);
    toast.success('🔄 Chave rotacionada com sucesso!');
  };

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja excluir esta chave?')) {
      deleteAPIKey(id);
      toast.success('🗑️ Chave excluída!');
    }
  };

  const handleEncrypt = async (keyId) => {
    try {
      const key = apiKeys.find(k => k.id === keyId);
      if (!key) {
        toast.error('❌ Chave não encontrada');
        return;
      }

      // Se já estiver criptografada, não fazer nada
      if (key.encrypted || isEncrypted(key.key)) {
        toast.success('🔒 Chave já está criptografada!');
        return;
      }

      // Criptografar a chave
      const encryptedKey = encrypt(key.key);

      // Tentar salvar no Firestore (com fallback)
      try {
        await saveToFirestore(key.type, {
          ...key,
          key: encryptedKey,
          encrypted: true,
        });
      } catch (firestoreError) {
        console.warn('Firestore save failed, using localStorage:', firestoreError);
      }

      // Atualizar estado local (sempre funciona)
      encryptAPIKey(keyId);
      toast.success('🔒 Chave criptografada com sucesso!');
    } catch (err) {
      toast.error('❌ Erro ao criptografar: ' + err.message);
    }
  };

  const handleSave = async (keyId) => {
    try {
      const key = apiKeys.find(k => k.id === keyId);
      if (!key) {
        toast.error('❌ Chave não encontrada');
        return;
      }

      // Tentar salvar no Firestore (com fallback)
      try {
        await saveToFirestore(key.type, {
          ...key,
          lastUpdated: new Date().toISOString(),
        });
        toast.success('💾 Chave salva com sucesso no Firestore!');
      } catch (firestoreError) {
        console.warn('Firestore save failed, using localStorage:', firestoreError);
        // Atualizar no localStorage via hook
        updateAPIKey(keyId, {
          lastUpdated: new Date().toISOString(),
        });
        toast.success('💾 Chave salva localmente com sucesso!');
      }
    } catch (err) {
      toast.error('❌ Erro ao salvar: ' + err.message);
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
              className="glass border border-purple-500/20 rounded-xl p-5 bg-gradient-to-br from-purple-500/5 to-purple-700/10 hover:border-purple-400/40 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/30 to-purple-600/40">
                    <Key className="w-5 h-5 text-purple-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-white">{key.name}</h4>
                      {key.encrypted && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs">
                          <Lock className="w-3 h-3" />
                          Criptografada
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {key.encrypted && <Lock className="w-3 h-3 text-purple-400" />}
                      <p className="text-sm text-gray-300 font-mono">{maskAPIKey(key.key)}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Último uso: {formatDate(key.lastUsed)}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  key.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {key.status === 'active' ? 'Ativa' : 'Inativa'}
                </span>
              </div>

              <ProgressBar value={key.quota} max={100} label="Quota de Uso" />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                <Button
                  onClick={() => handleSave(key.id)}
                  icon={Save}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600"
                >
                  Salvar
                </Button>
                <Button
                  onClick={() => handleEncrypt(key.id)}
                  icon={Shield}
                  className="bg-gradient-to-r from-purple-700 to-purple-800 hover:from-purple-600 hover:to-purple-700"
                >
                  Criptografar
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleRotate(key.id)}
                  icon={RefreshCw}
                >
                  Rotacionar
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(key.id)}
                  icon={Trash2}
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
              className="w-full glass border border-purple-500/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 bg-gradient-to-br from-purple-500/5 to-purple-700/10"
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

          <div className="flex gap-2 mt-6">
            <Button 
              onClick={handleAdd} 
              className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600"
              icon={Plus}
            >
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
