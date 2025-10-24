import { useContext } from 'react';
import { LangContext } from '../context/LangContext';

export const useLanguage = () => {
  const context = useContext(LangContext);
  
  if (!context) {
    throw new Error('useLanguage must be used within LangProvider');
  }
  
  return context;
};
