import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../components/Toast';
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
  const { success, error: showError } = useToast();
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
    
    if (!validate()) return;

    try {
      if (isLogin) {
        const user = await login(email, password);
        success('Login realizado com sucesso!');
        
        // Redirecionar admin para /admin, outros para /dashboard
        if (email === 'tamara14@gmail.com') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        const user = await register(email, password);
        success('Cadastro realizado com sucesso!');
        
        // Redirecionar admin para /admin, outros para /dashboard
        if (email === 'tamara14@gmail.com') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      showError('Erro ao processar solicitação');
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
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
            className="inline-flex items-center gap-2 text-4xl font-bold mb-2"
          >
            <span>🎟️</span>
            <span className="gradient-primary bg-clip-text text-transparent">
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

          <Button type="submit" loading={loading} className="w-full">
            {isLogin ? t('login') : t('register')}
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
