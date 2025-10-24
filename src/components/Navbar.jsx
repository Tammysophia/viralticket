import { motion } from 'framer-motion';
import { Globe, Shield, Crown } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import PlanBadge from './PlanBadge';

const Navbar = () => {
  const { language, changeLanguage } = useLanguage();
  const { user } = useAuth();

  const languages = [
    { code: 'pt-BR', flag: '🇧🇷', name: 'Português' },
    { code: 'en-US', flag: '🇺🇸', name: 'English' },
    { code: 'es-ES', flag: '🇪🇸', name: 'Español' },
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="glass border-b border-white/10 px-6 py-4 flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        {user && (
          <>
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className={`w-10 h-10 rounded-full ring-2 ${
                  user.isAdmin 
                    ? 'ring-purple-500/70 shadow-lg shadow-purple-500/30' 
                    : 'ring-purple-500/50'
                }`}
              />
              {user.isAdmin && (
                <div className="absolute -top-1 -right-1 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full p-1 shadow-lg">
                  <Crown className="w-3 h-3 text-yellow-300" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">{user.name}</p>
                {user.isAdmin && (
                  <Shield className="w-4 h-4 text-purple-400" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-400">Online</span>
                {user.plan && <PlanBadge plan={user.plan} size="sm" />}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Globe className="w-4 h-4 text-gray-400" />
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
              language === lang.code
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'glass-hover text-gray-400'
            }`}
          >
            <span className="mr-1">{lang.flag}</span>
            <span className="hidden sm:inline">{lang.name}</span>
          </button>
        ))}
      </div>
    </motion.nav>
  );
};

export default Navbar;
