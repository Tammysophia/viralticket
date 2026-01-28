import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { validatePasswordToken, markTokenAsUsed } from '../services/passwordTokenService';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import toast from 'react-hot-toast';

const CreatePassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [creating, setCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    setValidating(true);
    
    if (!token) {
      setErrorMessage('Token não fornecido na URL');
      setTokenValid(false);
      setValidating(false);
      setLoading(false);
      return;
    }

    const result = await validatePasswordToken(token);
    
    if (result.valid) {
      setTokenValid(true);
      setEmail(result.email);
      setErrorMessage('');
    } else {
      setTokenValid(false);
      setErrorMessage(result.message || 'Token inválido');
    }
    
    setValidating(false);
    setLoading(false);
  };

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

  const handleCreatePassword = async (e) => {
    e.preventDefault();
    
    if (!validatePassword()) return;
    
    setCreating(true);
    
    try {
      // Criar usuário no Firebase Auth
      await createUserWithEmailAndPassword(auth, email, password);
      
      // Marcar token como usado
      await markTokenAsUsed(token);
      
      toast.success('✅ Senha criada com sucesso!');
      
      // Aguardar 1 segundo e redirecionar
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      console.error('Erro ao criar senha:', error);
      
      // Se usuário já existe, fazer login
      if (error.code === 'auth/email-already-in-use') {
        try {
          await signInWithEmailAndPassword(auth, email, password);
          await markTokenAsUsed(token);
          toast.success('✅ Senha atualizada com sucesso!');
          setTimeout(() => {
            navigate('/dashboard');
          }, 1000);
        } catch (loginError) {
          toast.error('❌ Erro ao atualizar senha: ' + loginError.message);
        }
      } else {
        toast.error('❌ Erro ao criar senha: ' + error.message);
      }
    } finally {
      setCreating(false);
    }
  };

  if (loading || validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <Card className="w-full max-w-md">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 text-lg">Validando token...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card>
            <div className="text-center py-8">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Token Inválido</h2>
              <p className="text-gray-400 mb-6">{errorMessage}</p>
              <Button onClick={() => navigate('/login')} className="w-full">
                Voltar para Login
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

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
            <h2 className="text-3xl font-bold mb-2">Criar Senha</h2>
            <p className="text-gray-400">
              Defina uma senha segura para sua conta
            </p>
            <p className="text-sm text-purple-400 mt-2">
              {email}
            </p>
          </div>

          <form onSubmit={handleCreatePassword} className="space-y-4">
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

            {/* Indicador de força da senha */}
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
              {creating ? 'Criando...' : 'Criar Senha e Acessar'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            <p>Já tem uma senha?</p>
            <button
              onClick={() => navigate('/login')}
              className="text-purple-400 hover:text-purple-300 font-medium"
            >
              Fazer Login
            </button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default CreatePassword;
