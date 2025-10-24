import { motion } from 'framer-motion';

const Tabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex gap-2 glass border border-white/10 rounded-lg p-2 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className="relative flex-1 px-4 py-3 rounded-lg font-semibold transition-all"
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 gradient-primary rounded-lg shadow-lg shadow-primary-purple/30"
            />
          )}
          <span className="relative z-10 flex items-center justify-center gap-2">
            <tab.icon className="w-5 h-5" />
            <span className="hidden sm:inline">{tab.label}</span>
          </span>
        </button>
      ))}
    </div>
  );
};

export default Tabs;
