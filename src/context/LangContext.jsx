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
    
    // Offer Generation
    selectAI: 'Selecione a IA',
    commentOrText: 'Comentário ou Texto',
    offerGenerated: 'Oferta Gerada',
    clearPanel: 'Apagar',
    completeAnalysis: 'Análise Completa da',
    copyCompleteAnalysis: 'Copiar Análise Completa',
    chooseDeliveryFormats: 'Escolha os Formatos de Entrega',
    clickOptionsBelow: 'Clique nas opções abaixo para gerar os formatos específicos que você precisa',
    
    // Page Formats
    howBuildSalesPage: 'Como você deseja construir sua Página de Vendas?',
    wordpress: 'WordPress',
    wordpressDesc: 'Manual/Elementor',
    quiz: 'Quiz',
    quizDesc: 'Funil Diagnóstico',
    iaBuilder: 'IA Builder',
    iaBuilderDesc: 'Lovable/Gama',
    
    // Ebook Formats
    howStructureEbook: 'Como você deseja estruturar seu Ebook?',
    canva: 'Canva',
    canvaDesc: 'Design Visual Simples',
    gama: 'Gama',
    gamaDesc: 'Estrutura Completa',
    
    // Creatives
    generateCreativesCopy: 'Gerar Copy para Criativos?',
    creativesDesc: 'Posts estáticos (1080x1080) + Vídeos (Reels/TikTok) com copy, cores e ideias de imagens',
    generateCreatives: 'Gerar Criativos',
    creativesCount: '5 Posts + 5 Vídeos com copy completo',
    
    // Editor Tabs
    details: 'Detalhes',
    offer: 'Oferta',
    content: 'Conteúdo',
    videos: 'Vídeos',
    modelingTab: 'Modelagem',
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
    
    // Offer Generation
    selectAI: 'Select the AI',
    commentOrText: 'Comment or Text',
    offerGenerated: 'Offer Generated',
    clearPanel: 'Clear',
    completeAnalysis: 'Complete Analysis by',
    copyCompleteAnalysis: 'Copy Complete Analysis',
    chooseDeliveryFormats: 'Choose Delivery Formats',
    clickOptionsBelow: 'Click the options below to generate the specific formats you need',
    
    // Page Formats
    howBuildSalesPage: 'How do you want to build your Sales Page?',
    wordpress: 'WordPress',
    wordpressDesc: 'Manual/Elementor',
    quiz: 'Quiz',
    quizDesc: 'Diagnostic Funnel',
    iaBuilder: 'AI Builder',
    iaBuilderDesc: 'Lovable/Gama',
    
    // Ebook Formats
    howStructureEbook: 'How do you want to structure your Ebook?',
    canva: 'Canva',
    canvaDesc: 'Simple Visual Design',
    gama: 'Gama',
    gamaDesc: 'Complete Structure',
    
    // Creatives
    generateCreativesCopy: 'Generate Copy for Creatives?',
    creativesDesc: 'Static posts (1080x1080) + Videos (Reels/TikTok) with copy, colors and image ideas',
    generateCreatives: 'Generate Creatives',
    creativesCount: '5 Posts + 5 Videos with complete copy',
    
    // Editor Tabs
    details: 'Details',
    offer: 'Offer',
    content: 'Content',
    videos: 'Videos',
    modelingTab: 'Modeling',
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
    
    // Offer Generation
    selectAI: 'Selecciona la IA',
    commentOrText: 'Comentario o Texto',
    offerGenerated: 'Oferta Generada',
    clearPanel: 'Borrar',
    completeAnalysis: 'Análisis Completo de',
    copyCompleteAnalysis: 'Copiar Análisis Completo',
    chooseDeliveryFormats: 'Elige los Formatos de Entrega',
    clickOptionsBelow: 'Haz clic en las opciones a continuación para generar los formatos específicos que necesitas',
    
    // Page Formats
    howBuildSalesPage: '¿Cómo deseas construir tu Página de Ventas?',
    wordpress: 'WordPress',
    wordpressDesc: 'Manual/Elementor',
    quiz: 'Quiz',
    quizDesc: 'Embudo Diagnóstico',
    iaBuilder: 'IA Builder',
    iaBuilderDesc: 'Lovable/Gama',
    
    // Ebook Formats
    howStructureEbook: '¿Cómo deseas estructurar tu Ebook?',
    canva: 'Canva',
    canvaDesc: 'Diseño Visual Simple',
    gama: 'Gama',
    gamaDesc: 'Estructura Completa',
    
    // Creatives
    generateCreativesCopy: '¿Generar Copy para Creativos?',
    creativesDesc: 'Posts estáticos (1080x1080) + Videos (Reels/TikTok) con copy, colores e ideas de imágenes',
    generateCreatives: 'Generar Creativos',
    creativesCount: '5 Posts + 5 Videos con copy completo',
    
    // Editor Tabs
    details: 'Detalles',
    offer: 'Oferta',
    content: 'Contenido',
    videos: 'Videos',
    modelingTab: 'Modelado',
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

  // VT: Helper para obter nome do idioma para instrução da IA
  const getLanguageForAI = () => {
    const languageMap = {
      'pt-BR': 'português brasileiro',
      'en-US': 'English (American)',
      'es-ES': 'español'
    };
    return languageMap[language] || 'português brasileiro';
  };

  return (
    <LangContext.Provider value={{ language, changeLanguage, t, getLanguageForAI }}>
      {children}
    </LangContext.Provider>
  );
};
