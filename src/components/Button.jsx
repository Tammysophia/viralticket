import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  onClick,
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  icon: Icon,
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700',
    secondary: 'glass glass-hover text-white',
    danger: 'bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30',
    success: 'bg-green-500/20 border-green-500/50 text-green-400 hover:bg-green-500/30',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={`px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : Icon ? (
        <Icon className="w-5 h-5" />
      ) : null}
      {children}
    </motion.button>
  );
};

export default Button;
