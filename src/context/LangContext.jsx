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
    online: 'Online',

    // Dashboard
    dashboard: 'Painel',
    youtubeExtractor: 'Extrator YouTube',
    aiChat: 'Chat IA',
    offersKanban: 'Kanban de Ofertas',
    welcome: 'Bem-vindo(a)',
    letsCreateOffers: 'Vamos criar ofertas incríveis hoje?',
    offersGeneratedToday: 'Ofertas geradas hoje',
    youtubeExtraction: 'Extração do YouTube',
    unlimited: 'Ilimitado',
    urlsPerDay: 'URLs por dia',
    extractUnlimited: 'Extraia sem limites',
    offerMonitoring: 'Monitoramento',
    creativesLabel: 'Criativos',
    monitoringProgress: 'Progresso do monitoramento',
    monitoringRemaining: 'Dias restantes',
    monitoringEmpty: 'Nenhuma oferta em monitoramento no momento.',
    monitoringStartedAt: 'Iniciado em',
    stopMonitoring: 'Parar monitoramento',
    monitoringStopped: 'Monitoramento encerrado.',
    monitoringStopError: 'Erro ao interromper monitoramento.',
    modeledOffer: 'Oferta modelável',
    days: 'dias',

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
    selectAI: 'Selecione a IA',
    commentOrText: 'Comentário ou Texto',
    offerGenerated: 'Oferta Gerada',
    clearPanel: 'Limpar painel',
    completeAnalysis: 'Análise completa da',
    chooseDeliveryFormats: 'Escolha os formatos de entrega',
    clickOptionsBelow: 'Clique nas opções abaixo para gerar formatos específicos',
    howBuildSalesPage: 'Como você quer construir a página de vendas?',
    wordpress: 'WordPress',
    wordpressDesc: '17 blocos prontos para Elementor/WordPress',
    quiz: 'Quiz',
    quizDesc: 'Funil diagnóstico com 15 perguntas',
    iaBuilder: 'IA Builder',
    iaBuilderDesc: 'Prompt completo para builders de IA',
    howStructureEbook: 'Como você quer estruturar o ebook?',
    canva: 'Canva',
    canvaDesc: 'Layout visual simples para Canva',
    gama: 'Gama',
    gamaDesc: 'Estrutura detalhada para Gama',
    generateCreativesCopy: 'Gerar criativos (posts + vídeos)',
    creativesDesc: 'Receba 5 posts estáticos e 5 roteiros de vídeos prontos',
    generateCreatives: 'Gerar criativos',
    creativesCount: '5 posts + 5 vídeos',
    copyCompleteAnalysis: 'Copiar análise completa',

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
    gptAgents: 'Agentes GPT',

    // Plans
    plan: 'Plano',
    silver: 'PRATA',
    gold: 'OURO',
    diamond: 'DIAMANTE',
    mentorship: 'MENTORIA',
    planSilver: 'Prata',
    planGold: 'Ouro',
    planDiamond: 'Diamante',
    planMentorship: 'Mentoria',
    planAdmin: 'Admin',

    // Common
    loading: 'Carregando...',
    save: 'Salvar',
    cancel: 'Cancelar',
    delete: 'Excluir',
    edit: 'Editar',
    status: 'Status',
    active: 'Ativo',
    inactive: 'Inativo',
    close: 'Fechar',
    creating: 'Criando...',
    changing: 'Alterando...',
    
    // User Management
    createUser: 'Cadastrar Usuário',
    createUserButton: 'Criar Usuário',
    changePassword: 'Alterar Senha',
    forcePasswordChange: '🔒 Troca de Senha Obrigatória',
  },
  'en-US': {
    login: 'Login',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    online: 'Online',

    dashboard: 'Dashboard',
    youtubeExtractor: 'YouTube Extractor',
    aiChat: 'AI Chat',
    offersKanban: 'Offers Kanban',
    welcome: 'Welcome',
    letsCreateOffers: "Let's create winning offers today?",
    offersGeneratedToday: 'Offers generated today',
    youtubeExtraction: 'YouTube extraction',
    unlimited: 'Unlimited',
    urlsPerDay: 'URLs per day',
    extractUnlimited: 'Extract without limits',
    offerMonitoring: 'Offer Monitoring',
    creativesLabel: 'Creatives',
    monitoringProgress: 'Monitoring progress',
    monitoringRemaining: 'Days remaining',
    monitoringEmpty: 'No offers under monitoring right now.',
    monitoringStartedAt: 'Started on',
    stopMonitoring: 'Stop monitoring',
    monitoringStopped: 'Monitoring stopped.',
    monitoringStopError: 'Unable to stop monitoring.',
    modeledOffer: 'Modeled offer',
    days: 'days',

    youtubeUrl: 'YouTube URL',
    extractComments: 'Extract Comments',
    copyAll: 'Copy All',
    useWithAI: 'Use with AI',
    comments: 'comments',
    likes: 'likes',

    enterText: 'Enter or paste comment...',
    generate: 'Generate Offer',
    copy: 'Copy',
    selectAI: 'Select the AI',
    commentOrText: 'Comment or Text',
    offerGenerated: 'Offer Generated',
    clearPanel: 'Clear panel',
    completeAnalysis: 'Complete analysis by',
    chooseDeliveryFormats: 'Choose delivery formats',
    clickOptionsBelow: 'Click the options below to generate specific formats',
    howBuildSalesPage: 'How do you want to build the sales page?',
    wordpress: 'WordPress',
    wordpressDesc: '17 blocks ready for Elementor/WordPress',
    quiz: 'Quiz',
    quizDesc: 'Diagnostic funnel with 15 questions',
    iaBuilder: 'AI Builder',
    iaBuilderDesc: 'Full prompt for AI page builders',
    howStructureEbook: 'How do you want to structure the ebook?',
    canva: 'Canva',
    canvaDesc: 'Simple visual layout for Canva',
    gama: 'Gama',
    gamaDesc: 'Detailed structure for Gama',
    generateCreativesCopy: 'Generate creatives (posts + videos)',
    creativesDesc: 'Get 5 static posts and 5 video scripts ready to use',
    generateCreatives: 'Generate creatives',
    creativesCount: '5 posts + 5 videos',
    copyCompleteAnalysis: 'Copy complete analysis',

    pending: 'Pending',
    inExecution: 'In Progress',
    modeling: 'Modeling',
    completed: 'Completed',

    admin: 'Admin',
    overview: 'Overview',
    users: 'Users',
    apiKeys: 'API Keys',
    webhooks: 'Webhooks',
    gptAgents: 'GPT Agents',

    plan: 'Plan',
    
    
    silver: "SILVER",
    gold: "GOLD",
    diamond: "DIAMOND",
    mentorship: "MENTORSHIP",
    planSilver: "Silver",
    
    planDiamond: "Diamond",
    planMentorship: "Mentorship",
    
    planAdmin: 'Admin',

    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    close: 'Close',
    creating: 'Creating...',
    changing: 'Changing...',
    
    createUser: 'Create User',
    createUserButton: 'Create User',
    changePassword: 'Change Password',
    forcePasswordChange: '🔒 Required Password Change',
  },
  'es-ES': {
    login: 'Iniciar sesión',
    register: 'Registrarse',
    email: 'Correo electrónico',
    password: 'Contraseña',
    dontHaveAccount: '¿No tienes una cuenta?',
    alreadyHaveAccount: '¿Ya tienes una cuenta?',
    online: 'En línea',

    dashboard: 'Panel',
    youtubeExtractor: 'Extractor YouTube',
    aiChat: 'Chat IA',
    offersKanban: 'Kanban de Ofertas',
    welcome: 'Bienvenido(a)',
    letsCreateOffers: '¿Creamos ofertas ganadoras hoy?',
    offersGeneratedToday: 'Ofertas generadas hoy',
    youtubeExtraction: 'Extracción de YouTube',
    unlimited: 'Ilimitado',
    urlsPerDay: 'URLs por día',
    extractUnlimited: 'Extrae sin límites',
    offerMonitoring: 'Monitoreo',
    creativesLabel: 'Creativos',
    monitoringProgress: 'Progreso del monitoreo',
    monitoringRemaining: 'Días restantes',
    monitoringEmpty: 'No hay ofertas en monitoreo en este momento.',
    monitoringStartedAt: 'Iniciado el',
    stopMonitoring: 'Detener monitoreo',
    monitoringStopped: 'Monitoreo finalizado.',
    monitoringStopError: 'Error al detener el monitoreo.',
    modeledOffer: 'Oferta modelable',
    days: 'días',

    youtubeUrl: 'URL de YouTube',
    extractComments: 'Extraer Comentarios',
    copyAll: 'Copiar Todos',
    useWithAI: 'Usar con IA',
    comments: 'comentarios',
    likes: 'me gusta',

    enterText: 'Ingrese o pegue el comentario...',
    generate: 'Generar Oferta',
    copy: 'Copiar',
    selectAI: 'Selecciona la IA',
    commentOrText: 'Comentario o Texto',
    offerGenerated: 'Oferta Generada',
    clearPanel: 'Limpiar panel',
    completeAnalysis: 'Análisis completo de',
    chooseDeliveryFormats: 'Elige los formatos de entrega',
    clickOptionsBelow: 'Haz clic en las opciones abajo para generar formatos específicos',
    howBuildSalesPage: '¿Cómo quieres construir la página de ventas?',
    wordpress: 'WordPress',
    wordpressDesc: '17 bloques listos para Elementor/WordPress',
    quiz: 'Quiz',
    quizDesc: 'Embudo diagnóstico con 15 preguntas',
    iaBuilder: 'IA Builder',
    iaBuilderDesc: 'Prompt completo para builders de IA',
    howStructureEbook: '¿Cómo quieres estructurar el ebook?',
    canva: 'Canva',
    canvaDesc: 'Layout visual simple para Canva',
    gama: 'Gama',
    gamaDesc: 'Estructura detallada para Gama',
    generateCreativesCopy: 'Generar creativos (posts + videos)',
    creativesDesc: 'Recibe 5 posts estáticos y 5 guiones de videos listos',
    generateCreatives: 'Generar creativos',
    creativesCount: '5 posts + 5 videos',
    copyCompleteAnalysis: 'Copiar análisis completo',

    pending: 'Pendiente',
    inExecution: 'En Ejecución',
    modeling: 'Modelando',
    completed: 'Completado',

    admin: 'Administrador',
    overview: 'Resumen',
    users: 'Usuarios',
    apiKeys: 'Claves API',
    webhooks: 'Webhooks',
    gptAgents: 'Agentes GPT',

    plan: 'Plan',
    free: 'GRATIS',
    bronze: 'BRONCE',
    silver: 'PLATA',
    gold: 'ORO',
    planFree: 'Gratis',
    planBronze: 'Bronce',
    planSilver: 'Plata',
    planGold: 'Oro',
    planAdmin: 'Admin',

    loading: 'Cargando...',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    status: 'Estado',
    active: 'Activo',
    inactive: 'Inactivo',
    close: 'Cerrar',
    creating: 'Creando...',
    changing: 'Cambiando...',
    
    createUser: 'Registrar Usuario',
    createUserButton: 'Crear Usuario',
    changePassword: 'Cambiar Contraseña',
    forcePasswordChange: '🔒 Cambio de Contraseña Obligatorio',
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

  const getLanguageForAI = () => {
    switch (language) {
      case 'pt-BR':
        return 'pt-BR';
      case 'en-US':
        return 'en-US';
      case 'es-ES':
        return 'es-ES';
      default:
        return 'pt-BR';
    }
  };

  return (
    <LangContext.Provider value={{ language, changeLanguage, t, getLanguageForAI }}>
      {children}
    </LangContext.Provider>
  );
};
