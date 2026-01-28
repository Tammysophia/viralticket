import { motion } from 'framer-motion';

const Input = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  icon: Icon,
  ...props
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <motion.input
          whileFocus={{ scale: 1.01 }}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full glass border ${
            error ? 'border-red-500/50' : 'border-white/10'
          } rounded-lg px-4 py-3 ${
            Icon ? 'pl-12' : ''
          } focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all`}
          {...props}
        />
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-400"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default Input;
