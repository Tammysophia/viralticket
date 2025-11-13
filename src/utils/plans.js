export const PLANS = {
  PRATA: {
    name: 'PRATA',
    offers: 3,              // 3 ofertas por dia
    offersMonthly: 90,      // Por mês (30 dias × 3/dia)
    urls: 'unlimited',      // ILIMITADO - YouTube extractor sem limites
    urlsMonthly: 'unlimited',
    color: 'gray',
    badge: '🥈',
    // Sem valor - definido na plataforma de pagamento
  },
  OURO: {
    name: 'OURO',
    offers: 10,             // 10 ofertas por dia
    offersMonthly: 300,     // Por mês (30 dias × 10/dia)
    urls: 'unlimited',      // ILIMITADO - YouTube extractor sem limites
    urlsMonthly: 'unlimited',
    color: 'yellow',
    badge: '🥇',
    // Sem valor - definido na plataforma de pagamento
  },
  DIAMANTE: {
    name: 'DIAMANTE',
    offers: 'unlimited',    // ILIMITADO
    offersMonthly: 'unlimited',
    urls: 'unlimited',      // ILIMITADO
    urlsMonthly: 'unlimited',
    color: 'cyan',
    badge: '💎',
    // Sem valor - definido na plataforma de pagamento
  },
  MENTORIA: {
    name: 'MENTORIA',
    offers: 'unlimited',    // ILIMITADO
    offersMonthly: 'unlimited',
    urls: 'unlimited',      // ILIMITADO
    urlsMonthly: 'unlimited',
    color: 'purple',
    badge: '🎓',
    duration: 365,          // 1 ano (365 dias)
    hasExpiration: true,    // Plano expira após 1 ano
    // Sem valor - definido na plataforma de pagamento
  },
};

export const getPlanLimits = (planName) => {
  return PLANS[planName] || PLANS.PRATA;
};

export const getPlanColor = (planName) => {
  const colors = {
    PRATA: 'from-gray-400 to-gray-600',
    OURO: 'from-yellow-500 to-yellow-700',
    DIAMANTE: 'from-cyan-400 to-blue-600',
    MENTORIA: 'from-purple-500 to-pink-600',
  };
  return colors[planName] || colors.PRATA;
};

/**
 * Verifica se um plano expirou
 * @param {Date} startDate - Data de início do plano
 * @param {string} planName - Nome do plano
 * @returns {boolean} - true se expirou, false se ainda está ativo
 */
export const isPlanExpired = (startDate, planName) => {
  const plan = PLANS[planName];
  
  // Se o plano não tem expiração, nunca expira
  if (!plan || !plan.hasExpiration) {
    return false;
  }
  
  const start = new Date(startDate);
  const now = new Date();
  const daysSinceStart = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  
  return daysSinceStart >= plan.duration;
};

/**
 * Calcula quantos dias faltam para o plano expirar
 * @param {Date} startDate - Data de início do plano
 * @param {string} planName - Nome do plano
 * @returns {number} - Dias restantes (ou -1 se não expira)
 */
export const getDaysUntilExpiration = (startDate, planName) => {
  const plan = PLANS[planName];
  
  // Se o plano não tem expiração, retorna -1
  if (!plan || !plan.hasExpiration) {
    return -1;
  }
  
  const start = new Date(startDate);
  const now = new Date();
  const daysSinceStart = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  const daysRemaining = plan.duration - daysSinceStart;
  
  return Math.max(0, daysRemaining);
};
