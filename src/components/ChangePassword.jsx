import { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '../config/firebase';
import Button from './Button';
import Input from './Input';
import Modal from './Modal';
import toast from 'react-hot-toast';

const ChangePassword = ({ isForced = false, onPasswordChanged }) => {
  const [showModal, setShowModal] = useState(isForced);
  
  // Atualizar modal quando isForced mudar
  useEffect(() => {
    if (isForced) {
      setShowModal(true);
    }
  }, [isForced]);
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validações
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast.error('📝 Preencha todos os campos');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('🔐 Nova senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('❌ As senhas não coincidem');
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      toast.error('⚠️ A nova senha deve ser diferente da atual');
      return;
    }

    setLoading(true);

    try {
      const user = auth.currentUser;
      
      if (!user || !user.email) {
        throw new Error('Usuário não autenticado');
      }

      // Reautenticar usuário com senha atual
      const credential = EmailAuthProvider.credential(
        user.email,
        formData.currentPassword
      );
      
      await reauthenticateWithCredential(user, credential);
      
      // Atualizar senha
      await updatePassword(user, formData.newPassword);
      
      // Atualizar flag no Firestore
      if (isForced) {
        const { db } = await import('../config/firebase');
        const { doc, updateDoc } = await import('firebase/firestore');
        await updateDoc(doc(db, 'users', user.uid), {
          mustChangePassword: false,
        });
      }
      
      toast.success('✅ Senha alterada com sucesso!');
      
      // Resetar form e fechar modal
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowModal(false);
      
      // Callback para notificar que senha foi alterada
      if (onPasswordChanged) {
        onPasswordChanged();
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      
      if (error.code === 'auth/wrong-password') {
        toast.error('❌ Senha atual incorreta');
      } else if (error.code === 'auth/requires-recent-login') {
        toast.error('⚠️ Por segurança, faça login novamente antes de alterar a senha');
      } else {
        toast.error('❌ Erro ao alterar senha: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Não permitir fechar se for troca forçada
    if (isForced) {
      toast.error('⚠️ Você precisa alterar sua senha antes de continuar');
      return;
    }
    
    setShowModal(false);
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  return (
    <>
      {!isForced && (
        <Button
          onClick={() => setShowModal(true)}
          variant="secondary"
          size="sm"
        >
          <Lock className="w-4 h-4 mr-2" />
          Alterar Senha
        </Button>
      )}

      <Modal
        isOpen={showModal}
        onClose={handleClose}
        title={isForced ? '🔒 Troca de Senha Obrigatória' : 'Alterar Senha'}
        closeOnOverlayClick={!isForced}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              label="Senha Atual"
              name="currentPassword"
              type={showCurrentPassword ? 'text' : 'password'}
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="Digite sua senha atual"
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-white transition-colors"
            >
              {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="relative">
            <Input
              label="Nova Senha"
              name="newPassword"
              type={showNewPassword ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
              required
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-white transition-colors"
            >
              {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="relative">
            <Input
              label="Confirmar Nova Senha"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Digite a nova senha novamente"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-white transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {isForced && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-sm text-yellow-300">
                <strong>⚠️ ATENÇÃO:</strong> Por segurança, você deve alterar sua senha temporária antes de usar a plataforma.
              </p>
            </div>
          )}
          
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-sm text-blue-300">
              ℹ️ Sua senha deve ter no mínimo 6 caracteres.
            </p>
          </div>

          <div className="flex gap-3">
            {!isForced && (
              <Button
                type="button"
                onClick={handleClose}
                variant="secondary"
                className="flex-1"
              >
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              loading={loading}
              disabled={loading}
              className={`${isForced ? 'w-full' : 'flex-1'} bg-gradient-to-r from-purple-600 to-pink-600`}
            >
              {loading ? 'Alterando...' : 'Alterar Senha'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default ChangePassword;
