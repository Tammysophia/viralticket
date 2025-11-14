import { useLanguage } from '../hooks/useLanguage';
import { BrazilFlag, USAFlag, SpainFlag } from './FlagIcons';

const LanguageSelectorCompact = () => {
  const { language, changeLanguage } = useLanguage();

  const languages = [
    { 
      code: 'pt-BR', 
      FlagComponent: BrazilFlag,
      name: 'PT'
    },
    { 
      code: 'en-US', 
      FlagComponent: USAFlag,
      name: 'EN'
    },
    { 
      code: 'es-ES', 
      FlagComponent: SpainFlag,
      name: 'ES'
    },
  ];

  return (
    <div className="flex items-center justify-center gap-2">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 ${
            language === lang.code
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/30 scale-105'
              : 'bg-white/5 hover:bg-white/10 border border-white/10'
          }`}
          title={lang.name}
        >
          <lang.FlagComponent className="w-5 h-5 rounded-sm shadow-sm" />
          <span className="text-xs font-medium">{lang.name}</span>
        </button>
      ))}
    </div>
  );
};

export default LanguageSelectorCompact;
