import { useState } from 'react';
import { UserPlus, Copy, CheckCircle, Eye, EyeOff } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import Input from './Input';
import Modal from './Modal';
import { auth, db } from '../config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { PLANS } from '../utils/plans';

const AdminCreateUser = ({ onUserCreated }) => {
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [credentialsCopied, setCredentialsCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    plan: 'PRATA',
  });

  // Gerar senha temporária aleatória
  const generateTempPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `Temp${password}!`;
  };

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
      // 1. Gerar senha temporária
      const tempPassword = generateTempPassword();
      
      // 2. Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        tempPassword
      );
      
      const user = userCredential.user;
      
      // 3. Criar perfil no Firestore
      if (db) {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: formData.email,
          displayName: formData.name,
          plan: formData.plan,
          status: 'active',
          mustChangePassword: true, // Forçar troca de senha no primeiro login
          createdAt: serverTimestamp(),
          createdBy: 'admin',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=8B5CF6&color=fff`,
          dailyUsage: { offers: 0, urls: 0 },
        });
      }
      
      // Também salvar no localStorage (fallback)
      const users = JSON.parse(localStorage.getItem('viralticket_users') || '[]');
      users.push({
        uid: user.uid,
        email: formData.email,
        displayName: formData.name,
        plan: formData.plan,
        status: 'active',
        mustChangePassword: true,
        createdAt: new Date().toISOString(),
        createdBy: 'admin',
      });
      localStorage.setItem('viralticket_users', JSON.stringify(users));
      
      // 4. Armazenar credenciais para exibir
      setGeneratedCredentials({
        email: formData.email,
        password: tempPassword,
        name: formData.name,
        plan: formData.plan,
      });
      
      toast.success('✅ Usuário criado! Envie as credenciais para ele.');
      
      // Callback
      if (onUserCreated) {
        onUserCreated({
          ...formData,
          uid: user.uid,
          tempPassword,
        });
      }
      
      // Resetar form
      setFormData({ name: '', email: '', plan: 'PRATA' });
      
      // Fazer logout do usuário recém-criado para não atrapalhar a sessão do admin
      await auth.signOut();
      
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        toast.error('❌ Este email já está cadastrado');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('❌ Email inválido');
      } else if (error.code === 'auth/weak-password') {
        toast.error('❌ Senha muito fraca');
      } else {
        toast.error('❌ Erro ao criar usuário: ' + error.message);
      }
    } finally {
      setCreating(false);
    }
  };

  const handleCopyCredentials = () => {
    const text = `🎟️ Acesso ao ViralTicket

Nome: ${generatedCredentials.name}
Email: ${generatedCredentials.email}
Senha Temporária: ${generatedCredentials.password}

⚠️ IMPORTANTE: Altere sua senha no primeiro acesso!

Acesse: ${window.location.origin}/login`;

    navigator.clipboard.writeText(text);
    setCredentialsCopied(true);
    toast.success('📋 Credenciais copiadas!');
    
    setTimeout(() => {
      setCredentialsCopied(false);
    }, 2000);
  };

  const handleClose = () => {
    setShowModal(false);
    setGeneratedCredentials(null);
    setCredentialsCopied(false);
    setShowPassword(false);
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
        {!generatedCredentials ? (
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
                ℹ️ Uma senha temporária será gerada automaticamente. O usuário deverá alterá-la no primeiro acesso.
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
                Envie as credenciais abaixo para o usuário:
              </p>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-sm text-gray-400 mb-1">Nome:</p>
                <p className="font-medium">{generatedCredentials.name}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-400 mb-1">Email:</p>
                <p className="font-medium">{generatedCredentials.email}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-400 mb-1">Senha Temporária:</p>
                <div className="flex items-center gap-2">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={generatedCredentials.password}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-900/50 border border-gray-700 rounded font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-2 hover:bg-gray-700 rounded transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-400 mb-1">Plano:</p>
                <p className="font-medium">{PLANS[generatedCredentials.plan]?.name}</p>
              </div>
            </div>

            <Button
              onClick={handleCopyCredentials}
              className={`w-full ${credentialsCopied ? 'bg-green-600' : 'bg-purple-600'}`}
            >
              {credentialsCopied ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Credenciais Copiadas!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Credenciais
                </>
              )}
            </Button>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-sm text-yellow-300">
                ⚠️ <strong>IMPORTANTE:</strong> O usuário DEVE alterar a senha no primeiro acesso por segurança!
              </p>
            </div>

            <Button
              onClick={handleClose}
              variant="secondary"
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
