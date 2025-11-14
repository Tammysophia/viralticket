import { useState } from 'react';
import { UserPlus, Copy, CheckCircle } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import Input from './Input';
import Modal from './Modal';
import { generatePasswordToken, generatePasswordResetURL } from '../services/passwordTokenService';
import { db } from '../config/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { PLANS } from '../utils/plans';

const AdminCreateUser = ({ onUserCreated }) => {
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    plan: 'PRATA',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.plan) {
      toast.error('📝 Preencha todos os campos');
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('📧 Email inválido');
      return;
    }

    setCreating(true);

    try {
      // 1. Gerar token de criação de senha
      const token = await generatePasswordToken(formData.email, 'create');
      
      // 2. Criar usuário no Firestore (sem senha no Firebase Auth ainda)
      const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      if (db) {
        await setDoc(doc(db, 'users', userId), {
          uid: userId,
          email: formData.email,
          displayName: formData.name,
          plan: formData.plan,
          status: 'pending_password', // Aguardando criação de senha
          createdAt: serverTimestamp(),
          createdBy: 'admin',
          passwordToken: token,
        });
      }
      
      // Também salvar no localStorage (fallback)
      const users = JSON.parse(localStorage.getItem('viralticket_users') || '[]');
      users.push({
        uid: userId,
        email: formData.email,
        displayName: formData.name,
        plan: formData.plan,
        status: 'pending_password',
        createdAt: new Date().toISOString(),
        createdBy: 'admin',
        passwordToken: token,
      });
      localStorage.setItem('viralticket_users', JSON.stringify(users));
      
      // 3. Gerar link de criação de senha
      const resetURL = generatePasswordResetURL(token);
      setGeneratedLink(resetURL);
      
      toast.success('✅ Usuário criado! Envie o link para ele criar a senha.');
      
      // Callback
      if (onUserCreated) {
        onUserCreated({
          ...formData,
          uid: userId,
          token,
          link: resetURL,
        });
      }
      
      // Resetar form
      setFormData({ name: '', email: '', plan: 'PRATA' });
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      toast.error('❌ Erro ao criar usuário: ' + error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    setLinkCopied(true);
    toast.success('📋 Link copiado!');
    
    setTimeout(() => {
      setLinkCopied(false);
    }, 2000);
  };

  const handleClose = () => {
    setShowModal(false);
    setGeneratedLink('');
    setLinkCopied(false);
    setFormData({ name: '', email: '', plan: 'PRATA' });
  };

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
      >
        <UserPlus className="w-5 h-5 mr-2" />
        Cadastrar Usuário
      </Button>

      <Modal
        isOpen={showModal}
        onClose={handleClose}
        title="Cadastrar Novo Usuário"
      >
        {!generatedLink ? (
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              label="Nome Completo"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: João Silva"
              required
            />

            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="joao@email.com"
              required
            />

            <div>
              <label className="block text-sm font-medium mb-2">
                Plano
              </label>
              <select
                name="plan"
                value={formData.plan}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                required
              >
                {Object.entries(PLANS).map(([key, plan]) => (
                  <option key={key} value={key}>
                    {plan.name} - {plan.dailyOffers === -1 ? 'Ilimitado' : `${plan.dailyOffers} ofertas/dia`}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-sm text-blue-300">
                ℹ️ O usuário receberá um link para criar sua própria senha.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                onClick={handleClose}
                variant="secondary"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                loading={creating}
                disabled={creating}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
              >
                {creating ? 'Criando...' : 'Criar Usuário'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="text-center py-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Usuário Criado!</h3>
              <p className="text-gray-400">
                Envie o link abaixo para o usuário criar sua senha:
              </p>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">Link de Criação de Senha:</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={generatedLink}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-900/50 border border-gray-700 rounded text-sm"
                />
                <Button
                  onClick={handleCopyLink}
                  size="sm"
                  className={linkCopied ? 'bg-green-600' : ''}
                >
                  {linkCopied ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-sm text-yellow-300">
                ⚠️ Este link expira em 24 horas. O usuário deve criar a senha dentro deste prazo.
              </p>
            </div>

            <Button
              onClick={handleClose}
              className="w-full"
            >
              Fechar
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
};

export default AdminCreateUser;
