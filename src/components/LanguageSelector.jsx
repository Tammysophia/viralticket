import { useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { BrazilFlag, USAFlag, SpainFlag } from './FlagIcons';

const LanguageSelector = ({ variant = 'default' }) => {
  const { language, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { 
      code: 'pt-BR', 
      name: 'Português', 
      FlagComponent: BrazilFlag,
      shortName: 'PT'
    },
    { 
      code: 'en-US', 
      name: 'English', 
      FlagComponent: USAFlag,
      shortName: 'EN'
    },
    { 
      code: 'es-ES', 
      name: 'Español', 
      FlagComponent: SpainFlag,
      shortName: 'ES'
    },
  ];

  const currentLang = languages.find(lang => lang.code === language) || languages[0];

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    setIsOpen(false);
  };

  if (variant === 'compact') {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-purple-500 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/20"
        >
          <currentLang.FlagComponent className="w-5 h-5 rounded-sm shadow-sm" />
          <span className="text-sm font-medium text-gray-200">{currentLang.shortName}</span>
        </button>

        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute top-full mt-2 right-0 bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl z-50 overflow-hidden min-w-[180px]">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-600/20 transition-all duration-200 ${
                    language === lang.code ? 'bg-purple-600/30' : ''
                  }`}
                >
                  <lang.FlagComponent className="w-6 h-6 rounded-sm shadow-sm" />
                  <span className="text-sm font-medium text-gray-200">{lang.name}</span>
                  {language === lang.code && (
                    <Check className="ml-auto w-4 h-4 text-purple-400" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500 hover:bg-white/10 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/20 group"
      >
        <Globe className="w-4 h-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
        <currentLang.FlagComponent className="w-6 h-6 rounded shadow-sm" />
        <span className="text-sm font-medium text-gray-200">{currentLang.name}</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 right-0 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden min-w-[200px]">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-600/20 transition-all duration-200 ${
                  language === lang.code ? 'bg-purple-600/30 border-l-2 border-purple-500' : ''
                }`}
              >
                <lang.FlagComponent className="w-6 h-6 rounded shadow-sm" />
                <span className="text-sm font-medium text-gray-200">{lang.name}</span>
                {language === lang.code && (
                  <Check className="ml-auto w-4 h-4 text-purple-400" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSelector;
