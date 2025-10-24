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
        await login(email, password);
        success('Login realizado com sucesso!');
        navigate('/dashboard');
      } else {
        await register(email, password);
        success('Cadastro realizado com sucesso!');
        navigate('/dashboard');
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
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-primary-purple/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-primary-lilac/10 rounded-full blur-3xl"
        />
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-8 max-w-md w-full relative z-10 shadow-[0_4px_30px_rgba(139,92,246,0.15)]"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="inline-flex flex-col items-center gap-3 mb-4"
          >
            <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-4xl shadow-lg shadow-primary-purple/30">
              🎟️
            </div>
            <span className="text-4xl font-bold gradient-primary bg-clip-text text-transparent">
              ViralTicket
            </span>
          </motion.div>
          <p className="text-zinc-400 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-primary-lilac" />
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
            <span className="text-primary-lilac font-semibold">
              {isLogin ? t('register') : t('login')}
            </span>
          </button>
        </div>

      </motion.div>
    </div>
  );
};

export default Login;
