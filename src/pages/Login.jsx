import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import toast, { Toaster } from 'react-hot-toast';
import Input from '../components/Input';
import Button from '../components/Button';
import { validateEmail, validatePassword } from '../utils/validation';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const { login, register, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    
    if (!validateEmail(email)) {
      newErrors.email = 'E-mail inválido';
    }
    
    if (!validatePassword(password)) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validações básicas
    if (!email || !password) {
      toast.error('📝 Preencha email e senha');
      return;
    }

    if (password.length < 6) {
      toast.error('🔐 Senha deve ter no mínimo 6 caracteres');
      return;
    }

    try {
      if (isLogin) {
        await login(email, password);
        // Toast já é mostrado no AuthContext
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      } else {
        await register(email, password);
        // Toast já é mostrado no AuthContext
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      }
    } catch (err) {
      // Erros já tratados no AuthContext com toasts específicos
      console.error('Auth error:', err);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      {/* Toast Notifications */}
      <Toaster 
        position="top-right" 
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(17, 17, 17, 0.95)',
            color: '#fff',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#8B5CF6',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      {/* Background Animated Circles */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-purple-600/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-pink-600/10 rounded-full blur-3xl"
        />
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass border border-white/20 rounded-2xl p-8 max-w-md w-full relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="inline-flex items-center gap-3 text-6xl font-bold mb-3"
          >
            <span className="text-7xl">🎟️</span>
            <span className="gradient-primary bg-clip-text text-transparent text-5xl">
              ViralTicket
            </span>
          </motion.div>
          <p className="text-gray-400 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Transforme comentários em ofertas virais</span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            error={errors.email}
            icon={Mail}
          />

          <Input
            label={t('password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            error={errors.password}
            icon={Lock}
          />

          <Button 
            type="submit" 
            loading={loading} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {isLogin ? 'Entrando...' : 'Cadastrando...'}
              </span>
            ) : (
              isLogin ? t('login') : t('register')
            )}
          </Button>
        </form>

        {/* Toggle */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setErrors({});
            }}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            {isLogin ? t('dontHaveAccount') : t('alreadyHaveAccount')}{' '}
            <span className="text-purple-400 font-semibold">
              {isLogin ? t('register') : t('login')}
            </span>
          </button>
        </div>

        {/* Features */}
        <div className="mt-8 pt-8 border-t border-white/10 space-y-3">
          <p className="text-sm text-gray-400 font-semibold mb-3">O que você terá acesso:</p>
          {[
            '✨ Extração de comentários do YouTube',
            '🤖 IA para criar ofertas virais',
            '📊 Kanban para organizar ofertas',
            '🌐 Multi-idioma (PT, EN, ES)',
          ].map((feature, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="text-sm text-gray-300"
            >
              {feature}
            </motion.p>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
