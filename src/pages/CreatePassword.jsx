import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import toast from 'react-hot-toast';
import { supabase } from '../services/supabase/supabaseClient';

const CreatePassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [creating, setCreating] = useState(false);

  const validatePassword = () => {
    if (password.length < 6) {
      toast.error('Senha deve ter no mínimo 6 caracteres');
      return false;
    }
    
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return false;
    }
    
    return true;
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (!validatePassword()) return;
    
    setCreating(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;
      
      toast.success('✅ Senha atualizada com sucesso!');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      toast.error('❌ Erro ao atualizar senha: ' + error.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Atualizar Senha</h2>
            <p className="text-gray-400">
              Defina uma nova senha segura para sua conta
            </p>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                label="Nova Senha"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                label="Confirmar Senha"
                placeholder="Digite a senha novamente"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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

            {password && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className={`w-4 h-4 ${password.length >= 6 ? 'text-green-500' : 'text-gray-500'}`} />
                  <span className={password.length >= 6 ? 'text-green-500' : 'text-gray-400'}>
                    Mínimo 6 caracteres
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className={`w-4 h-4 ${password === confirmPassword && password ? 'text-green-500' : 'text-gray-500'}`} />
                  <span className={password === confirmPassword && password ? 'text-green-500' : 'text-gray-400'}>
                    Senhas coincidem
                  </span>
                </div>
              </div>
            )}

            <Button
              type="submit"
              loading={creating}
              disabled={creating || !password || !confirmPassword}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
            >
              {creating ? 'Atualizando...' : 'Atualizar Senha'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            <button
              onClick={() => navigate('/login')}
              className="text-purple-400 hover:text-purple-300 font-medium"
            >
              Voltar para Login
            </button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default CreatePassword;
