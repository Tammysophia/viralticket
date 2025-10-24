import { motion } from 'framer-motion';

const ProgressBar = ({ value, max, label, color = 'purple' }) => {
  const percentage = max === 'unlimited' ? 0 : (value / max) * 100;
  
  const colors = {
    purple: 'from-primary-purple to-primary-lilac',
    green: 'from-green-500 to-emerald-600',
    yellow: 'from-yellow-500 to-orange-600',
    red: 'from-red-500 to-rose-600',
    gold: 'from-gold-500 to-gold-600',
  };

  const getColor = () => {
    if (percentage >= 90) return colors.red;
    if (percentage >= 70) return colors.yellow;
    return colors[color] || colors.purple;
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-400">{label}</span>
          <span className="font-semibold">
            {value} / {max === 'unlimited' ? '∞' : max}
          </span>
        </div>
      )}
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          className={`h-full bg-gradient-to-r ${getColor()}`}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
