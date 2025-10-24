import { motion } from 'framer-motion';
import { getPlanColor, PLANS } from '../utils/plans';

const PlanBadge = ({ plan, size = 'md' }) => {
  const planData = PLANS[plan] || PLANS.FREE;
  
  const sizes = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const isGold = plan === 'OURO';

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${getPlanColor(plan)} font-bold ${sizes[size]} ${
        isGold ? 'shadow-lg shadow-gold-500/50 border border-gold-500/30' : ''
      }`}
    >
      <span>{planData.badge}</span>
      <span>{planData.name}</span>
    </motion.div>
  );
};

export default PlanBadge;
