import { motion } from 'framer-motion';
import { getPlanColor } from '../utils/plans';
import { useLanguage } from '../hooks/useLanguage';

const PLAN_LABEL_MAP = {
  PRATA: 'planSilver',
  OURO: 'planGold',
  DIAMANTE: 'planDiamond',
  MENTORIA: 'planMentorship',
  ADMIN: 'planAdmin',
};

const PlanBadge = ({ plan, size = 'md' }) => {
  const { t } = useLanguage();
  const normalizedPlan = (plan || 'PRATA').toUpperCase();

  const sizes = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const planLabelKey = PLAN_LABEL_MAP[normalizedPlan] || PLAN_LABEL_MAP.PRATA;
  const planLabel = t(planLabelKey);

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${getPlanColor(normalizedPlan)} font-bold ${sizes[size]}`}
    >
      <span>{planLabel}</span>
    </motion.div>
  );
};

export default PlanBadge;
