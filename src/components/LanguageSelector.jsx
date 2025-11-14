import { useState } from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

const LanguageSelector = ({ variant = 'default' }) => {
  const { language, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { 
      code: 'pt-BR', 
      name: 'Português', 
      flag: '🇧🇷',
      shortName: 'PT'
    },
    { 
      code: 'en-US', 
      name: 'English', 
      flag: '🇺🇸',
      shortName: 'EN'
    },
    { 
      code: 'es-ES', 
      name: 'Español', 
      flag: '🇪🇸',
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
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-purple-500 transition-colors"
        >
          <span className="text-2xl">{currentLang.flag}</span>
          <span className="text-sm font-medium">{currentLang.shortName}</span>
        </button>

        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute top-full mt-2 right-0 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden min-w-[160px]">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-600/20 transition-colors ${
                    language === lang.code ? 'bg-purple-600/30' : ''
                  }`}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="text-sm font-medium">{lang.name}</span>
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
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-purple-500 transition-all"
      >
        <Globe className="w-4 h-4" />
        <span className="text-2xl">{currentLang.flag}</span>
        <span className="text-sm font-medium">{currentLang.name}</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 right-0 bg-gray-900 border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden min-w-[180px]">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-600/20 transition-colors ${
                  language === lang.code ? 'bg-purple-600/30 border-l-2 border-purple-500' : ''
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className="text-sm font-medium">{lang.name}</span>
                {language === lang.code && (
                  <span className="ml-auto text-purple-400 text-xs">✓</span>
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
