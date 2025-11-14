import { motion } from 'framer-motion';
import { Globe, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import { BrazilFlag, USAFlag, SpainFlag } from './FlagIcons';

const Navbar = () => {
  const { language, changeLanguage, t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const languages = [
    { code: 'pt-BR', FlagComponent: BrazilFlag, name: 'Português' },
    { code: 'en-US', FlagComponent: USAFlag, name: 'English' },
    { code: 'es-ES', FlagComponent: SpainFlag, name: 'Español' },
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
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-full ring-2 ring-purple-500/50"
              />
              <div>
                <p className="font-semibold">{user.name}</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-400">{t('online')}</span>
                </div>
              </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        {user?.isAdmin && (
          <button
            onClick={() => navigate('/admin')}
            className="px-3 py-1.5 rounded-lg text-sm transition-all glass-hover text-purple-400 flex items-center gap-1 mr-2"
          >
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        )}
        <Globe className="w-4 h-4 text-gray-400 mr-1" />
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${
              language === lang.code
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                : 'glass-hover text-gray-400 hover:text-gray-200'
            }`}
          >
            <lang.FlagComponent className="w-5 h-5 rounded-sm shadow-sm" />
            <span className="hidden sm:inline">{lang.name}</span>
          </button>
        ))}
      </div>
    </motion.nav>
  );
};

export default Navbar;
