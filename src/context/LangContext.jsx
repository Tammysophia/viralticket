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
    loginSuccess: 'Login efetuado com sucesso!',
    registerSuccess: 'Cadastro realizado com sucesso!',
    
    // Dashboard
    dashboard: 'Painel',
    youtubeExtractor: 'Extrator YouTube',
    aiChat: 'Chat IA',
    offersKanban: 'Kanban de Ofertas',
    welcome: 'Bem-vindo',
    letsCreateOffers: 'Vamos criar ofertas incríveis hoje?',
    offersGeneratedToday: 'Ofertas Geradas Hoje',
    youtubeExtraction: 'Extração YouTube',
    unlimited: 'ILIMITADO',
    urlsPerDay: 'URLs/dia',
    extractUnlimited: 'Extraia comentários sem limites! 🎉',
    
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
    generatedOffer: 'Oferta Gerada',
    offerCopied: 'Oferta copiada!',
    sophiaPhoenix: 'Sophia Fênix',
    sophiaDesc: 'Especialista em ofertas de alto impacto',
    sofiaUniversal: 'Sofia Universal',
    sofiaDesc: 'IA versátil para todos os nichos',
    
    // Kanban
    pending: 'Pendente',
    inExecution: 'Em Execução',
    modeling: 'Modelando',
    completed: 'Concluído',
    newOffer: 'Nova Oferta',
    
    // Admin
    admin: 'Administrador',
    overview: 'Visão Geral',
    users: 'Usuários',
    apiKeys: 'Chaves API',
    webhooks: 'Webhooks',
    managePlatform: 'Gerencie sua plataforma ViralTicket',
    totalUsers: 'Total de Usuários',
    offersToday: 'Ofertas Geradas Hoje',
    activeAPIs: 'APIs Ativas',
    conversionRate: 'Taxa de Conversão',
    userGrowth: 'Crescimento de Usuários',
    planDistribution: 'Distribuição de Planos',
    recentActivities: 'Atividades Recentes',
    loadingRealData: 'Carregando dados reais...',
    
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
    logout: 'Sair',
    online: 'Online',
    adminPanel: 'Painel Admin',
    
    // AI Chat Extended
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
  },
  'en-US': {
    login: 'Login',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    loginSuccess: 'Login successful!',
    registerSuccess: 'Registration successful!',
    
    dashboard: 'Dashboard',
    youtubeExtractor: 'YouTube Extractor',
    aiChat: 'AI Chat',
    offersKanban: 'Offers Kanban',
    welcome: 'Welcome',
    letsCreateOffers: "Let's create amazing offers today?",
    offersGeneratedToday: 'Offers Generated Today',
    youtubeExtraction: 'YouTube Extraction',
    unlimited: 'UNLIMITED',
    urlsPerDay: 'URLs/day',
    extractUnlimited: 'Extract comments without limits! 🎉',
    
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
    generatedOffer: 'Generated Offer',
    offerCopied: 'Offer copied!',
    sophiaPhoenix: 'Sophia Phoenix',
    sophiaDesc: 'High-impact offers specialist',
    sofiaUniversal: 'Sofia Universal',
    sofiaDesc: 'Versatile AI for all niches',
    
    pending: 'Pending',
    inExecution: 'In Progress',
    modeling: 'Modeling',
    completed: 'Completed',
    newOffer: 'New Offer',
    
    admin: 'Admin',
    overview: 'Overview',
    users: 'Users',
    apiKeys: 'API Keys',
    webhooks: 'Webhooks',
    managePlatform: 'Manage your ViralTicket platform',
    totalUsers: 'Total Users',
    offersToday: 'Offers Generated Today',
    activeAPIs: 'Active APIs',
    conversionRate: 'Conversion Rate',
    userGrowth: 'User Growth',
    planDistribution: 'Plan Distribution',
    recentActivities: 'Recent Activities',
    loadingRealData: 'Loading real data...',
    
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
    logout: 'Logout',
    online: 'Online',
    adminPanel: 'Admin Panel',
    
    // AI Chat Extended
    clearPanel: 'Clear Panel',
    completeAnalysis: 'Complete Analysis by',
    copyCompleteAnalysis: 'Copy Complete Analysis',
    chooseDeliveryFormats: 'Choose Delivery Formats',
    clickOptionsBelow: 'Click on options below to generate',
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
  },
  'es-ES': {
    login: 'Iniciar sesión',
    register: 'Registrarse',
    email: 'Correo electrónico',
    password: 'Contraseña',
    dontHaveAccount: '¿No tienes una cuenta?',
    alreadyHaveAccount: '¿Ya tienes una cuenta?',
    loginSuccess: '¡Inicio de sesión exitoso!',
    registerSuccess: '¡Registro exitoso!',
    
    dashboard: 'Panel',
    youtubeExtractor: 'Extractor YouTube',
    aiChat: 'Chat IA',
    offersKanban: 'Kanban de Ofertas',
    welcome: 'Bienvenido',
    letsCreateOffers: '¿Creamos ofertas increíbles hoy?',
    offersGeneratedToday: 'Ofertas Generadas Hoy',
    youtubeExtraction: 'Extracción YouTube',
    unlimited: 'ILIMITADO',
    urlsPerDay: 'URLs/día',
    extractUnlimited: '¡Extrae comentarios sin límites! 🎉',
    
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
    generatedOffer: 'Oferta Generada',
    offerCopied: '¡Oferta copiada!',
    sophiaPhoenix: 'Sophia Fénix',
    sophiaDesc: 'Especialista en ofertas de alto impacto',
    sofiaUniversal: 'Sofia Universal',
    sofiaDesc: 'IA versátil para todos los nichos',
    
    pending: 'Pendiente',
    inExecution: 'En Ejecución',
    modeling: 'Modelando',
    completed: 'Completado',
    newOffer: 'Nueva Oferta',
    
    admin: 'Administrador',
    overview: 'Resumen',
    users: 'Usuarios',
    apiKeys: 'Claves API',
    webhooks: 'Webhooks',
    managePlatform: 'Gestiona tu plataforma ViralTicket',
    totalUsers: 'Total de Usuarios',
    offersToday: 'Ofertas Generadas Hoy',
    activeAPIs: 'APIs Activas',
    conversionRate: 'Tasa de Conversión',
    userGrowth: 'Crecimiento de Usuarios',
    planDistribution: 'Distribución de Planes',
    recentActivities: 'Actividades Recientes',
    loadingRealData: 'Cargando datos reales...',
    
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
    logout: 'Salir',
    online: 'En línea',
    adminPanel: 'Panel Admin',
    
    // AI Chat Extended
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

  // Retornar idioma formatado para a IA (pt-BR, en-US, es-ES)
  const getLanguageForAI = () => {
    return language;
  };

  return (
    <LangContext.Provider value={{ language, changeLanguage, t, getLanguageForAI }}>
      {children}
    </LangContext.Provider>
  );
};
