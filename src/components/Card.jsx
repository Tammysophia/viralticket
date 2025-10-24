import { motion } from 'framer-motion';

const Card = ({ children, className = '', hover = true, gradient = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass rounded-xl p-6 ${
        hover ? 'glass-hover cursor-pointer' : ''
      } ${gradient ? 'border-purple-500/30' : 'border-white/10'} border ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default Card;
