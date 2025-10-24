import { createContext, useState, useEffect } from 'react';

export const LangContext = createContext();

const translations = {
  'pt-BR': {
    // Login
    login: 'Entrar',
    register: 'Registrar',
    email: 'E-mail',
    password: 'Senha',
    dontHaveAccount: 'Não tem uma conta?',
    alreadyHaveAccount: 'Já tem uma conta?',
    
    // Dashboard
    dashboard: 'Painel',
    youtubeExtractor: 'Extrator YouTube',
    aiChat: 'Chat IA',
    offersKanban: 'Kanban de Ofertas',
    
    // YouTube Tab
    youtubeUrl: 'URL do YouTube',
    extractComments: 'Extrair Comentários',
    copyAll: 'Copiar Todos',
    useWithAI: 'Usar com IA',
    comments: 'comentários',
    likes: 'curtidas',
    
    // AI Chat
    enterText: 'Digite ou cole o comentário...',
    generate: 'Gerar Oferta',
    copy: 'Copiar',
    
    // Kanban
    pending: 'Pendente',
    inExecution: 'Em Execução',
    modeling: 'Modelando',
    completed: 'Concluído',
    
    // Admin
    admin: 'Administrador',
    overview: 'Visão Geral',
    users: 'Usuários',
    apiKeys: 'Chaves API',
    webhooks: 'Webhooks',
    
    // Plans
    plan: 'Plano',
    free: 'FREE',
    bronze: 'BRONZE',
    silver: 'PRATA',
    gold: 'OURO',
    
    // Common
    loading: 'Carregando...',
    save: 'Salvar',
    cancel: 'Cancelar',
    delete: 'Excluir',
    edit: 'Editar',
    status: 'Status',
    active: 'Ativo',
    inactive: 'Inativo',
  },
  'en-US': {
    login: 'Login',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    
    dashboard: 'Dashboard',
    youtubeExtractor: 'YouTube Extractor',
    aiChat: 'AI Chat',
    offersKanban: 'Offers Kanban',
    
    youtubeUrl: 'YouTube URL',
    extractComments: 'Extract Comments',
    copyAll: 'Copy All',
    useWithAI: 'Use with AI',
    comments: 'comments',
    likes: 'likes',
    
    enterText: 'Enter or paste comment...',
    generate: 'Generate Offer',
    copy: 'Copy',
    
    pending: 'Pending',
    inExecution: 'In Progress',
    modeling: 'Modeling',
    completed: 'Completed',
    
    admin: 'Admin',
    overview: 'Overview',
    users: 'Users',
    apiKeys: 'API Keys',
    webhooks: 'Webhooks',
    
    plan: 'Plan',
    free: 'FREE',
    bronze: 'BRONZE',
    silver: 'SILVER',
    gold: 'GOLD',
    
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
  },
  'es-ES': {
    login: 'Iniciar sesión',
    register: 'Registrarse',
    email: 'Correo electrónico',
    password: 'Contraseña',
    dontHaveAccount: '¿No tienes una cuenta?',
    alreadyHaveAccount: '¿Ya tienes una cuenta?',
    
    dashboard: 'Panel',
    youtubeExtractor: 'Extractor YouTube',
    aiChat: 'Chat IA',
    offersKanban: 'Kanban de Ofertas',
    
    youtubeUrl: 'URL de YouTube',
    extractComments: 'Extraer Comentarios',
    copyAll: 'Copiar Todos',
    useWithAI: 'Usar con IA',
    comments: 'comentarios',
    likes: 'me gusta',
    
    enterText: 'Ingrese o pegue el comentario...',
    generate: 'Generar Oferta',
    copy: 'Copiar',
    
    pending: 'Pendiente',
    inExecution: 'En Ejecución',
    modeling: 'Modelando',
    completed: 'Completado',
    
    admin: 'Administrador',
    overview: 'Resumen',
    users: 'Usuarios',
    apiKeys: 'Claves API',
    webhooks: 'Webhooks',
    
    plan: 'Plan',
    free: 'GRATIS',
    bronze: 'BRONCE',
    silver: 'PLATA',
    gold: 'ORO',
    
    loading: 'Cargando...',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    status: 'Estado',
    active: 'Activo',
    inactive: 'Inactivo',
  },
};

export const LangProvider = ({ children }) => {
  const [language, setLanguage] = useState('pt-BR');

  useEffect(() => {
    const savedLang = localStorage.getItem('viralticket_language');
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('viralticket_language', lang);
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LangContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LangContext.Provider>
  );
};
