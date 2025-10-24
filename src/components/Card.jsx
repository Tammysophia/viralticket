import { motion } from 'framer-motion';

const Card = ({ children, className = '', hover = true, gradient = false, dark = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${dark ? 'glass-dark' : 'glass'} rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.4)] ${
        hover ? 'glass-hover cursor-pointer' : ''
      } ${gradient ? 'border-primary-purple/30' : 'border-white/10'} border ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default Card;
