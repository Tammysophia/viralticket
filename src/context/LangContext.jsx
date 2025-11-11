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
    selectAI: 'Selecione a IA',
    commentOrText: 'Comentário ou Texto',
    enterText: 'Digite ou cole o comentário...',
    generate: 'Gerar Oferta',
    copy: 'Copiar',
    offerGenerated: 'Oferta Gerada',
    clearPanel: 'Limpar Painel',
    completeAnalysis: 'Análise Completa de',
    copyCompleteAnalysis: 'Copiar Análise Completa',
    chooseDeliveryFormats: 'Escolha os Formatos de Entrega',
    clickOptionsBelow: 'Clique nas opções abaixo para gerar',
    howBuildSalesPage: 'Como deseja construir a Página de Vendas?',
    wordpress: 'WordPress',
    wordpressDesc: 'Manual/Elementor',
    quiz: 'Quiz',
    quizDesc: 'Funil diagnóstico',
    iaBuilder: 'IA Builder',
    iaBuilderDesc: 'Lovable/Gama',
    howStructureEbook: 'Como deseja estruturar o Ebook?',
    canva: 'Canva',
    canvaDesc: 'Design visual simples',
    gama: 'Gama',
    gamaDesc: 'Estrutura completa',
    generateCreativesCopy: 'Gerar Criativos e Copy?',
    creativesDesc: '5 posts estáticos + 5 vídeos curtos',
    generateCreatives: 'Gerar Criativos',
    creativesCount: '5 Posts + 5 Vídeos',
    
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
    
    selectAI: 'Select AI',
    commentOrText: 'Comment or Text',
    enterText: 'Enter or paste comment...',
    generate: 'Generate Offer',
    copy: 'Copy',
    offerGenerated: 'Offer Generated',
    clearPanel: 'Clear Panel',
    completeAnalysis: 'Complete Analysis by',
    copyCompleteAnalysis: 'Copy Complete Analysis',
    chooseDeliveryFormats: 'Choose Delivery Formats',
    clickOptionsBelow: 'Click options below to generate',
    howBuildSalesPage: 'How do you want to build the Sales Page?',
    wordpress: 'WordPress',
    wordpressDesc: 'Manual/Elementor',
    quiz: 'Quiz',
    quizDesc: 'Diagnostic funnel',
    iaBuilder: 'AI Builder',
    iaBuilderDesc: 'Lovable/Gama',
    howStructureEbook: 'How do you want to structure the Ebook?',
    canva: 'Canva',
    canvaDesc: 'Simple visual design',
    gama: 'Gama',
    gamaDesc: 'Complete structure',
    generateCreativesCopy: 'Generate Creatives & Copy?',
    creativesDesc: '5 static posts + 5 short videos',
    generateCreatives: 'Generate Creatives',
    creativesCount: '5 Posts + 5 Videos',
    
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
    
    selectAI: 'Seleccionar IA',
    commentOrText: 'Comentario o Texto',
    enterText: 'Ingrese o pegue el comentario...',
    generate: 'Generar Oferta',
    copy: 'Copiar',
    offerGenerated: 'Oferta Generada',
    clearPanel: 'Limpiar Panel',
    completeAnalysis: 'Análisis Completo de',
    copyCompleteAnalysis: 'Copiar Análisis Completo',
    chooseDeliveryFormats: 'Elige los Formatos de Entrega',
    clickOptionsBelow: 'Haz clic en las opciones para generar',
    howBuildSalesPage: '¿Cómo deseas construir la Página de Ventas?',
    wordpress: 'WordPress',
    wordpressDesc: 'Manual/Elementor',
    quiz: 'Quiz',
    quizDesc: 'Embudo diagnóstico',
    iaBuilder: 'AI Builder',
    iaBuilderDesc: 'Lovable/Gama',
    howStructureEbook: '¿Cómo deseas estructurar el Ebook?',
    canva: 'Canva',
    canvaDesc: 'Diseño visual simple',
    gama: 'Gama',
    gamaDesc: 'Estructura completa',
    generateCreativesCopy: '¿Generar Creativos y Copy?',
    creativesDesc: '5 posts estáticos + 5 videos cortos',
    generateCreatives: 'Generar Creativos',
    creativesCount: '5 Posts + 5 Videos',
    
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

  // Função para retornar o idioma atual para a IA
  const getLanguageForAI = () => {
    return language;
  };

  return (
    <LangContext.Provider value={{ language, changeLanguage, t, getLanguageForAI }}>
      {children}
    </LangContext.Provider>
  );
};
