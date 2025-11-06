export const PLANS = {
  FREE: {
    name: 'FREE',
    offers: 2,              // Por dia - APENAS geração de ofertas com IA
    offersMonthly: 60,      // Por mês (30 dias × 2/dia)
    urls: 'unlimited',      // ILIMITADO - YouTube extractor sem limites
    urlsMonthly: 'unlimited',
    color: 'gray',
    badge: '🆓',
    price: 0,
  },
  BRONZE: {
    name: 'BRONZE',
    offers: 5,              // Por dia
    offersMonthly: 150,     // Por mês
    urls: 'unlimited',      // ILIMITADO - YouTube extractor sem limites
    urlsMonthly: 'unlimited',
    color: 'orange',
    badge: '🥉',
    price: 9.90,
  },
  PRATA: {
    name: 'PRATA',
    offers: 10,             // Por dia
    offersMonthly: 300,     // Por mês
    urls: 'unlimited',      // ILIMITADO - YouTube extractor sem limites
    urlsMonthly: 'unlimited',
    color: 'gray',
    badge: '🥈',
    price: 19.90,
  },
  OURO: {
    name: 'OURO',
    offers: 'unlimited',    // ILIMITADO
    offersMonthly: 'unlimited',
    urls: 'unlimited',      // ILIMITADO
    urlsMonthly: 'unlimited',
    color: 'yellow',
    badge: '🥇',
    price: 49.90,
  },
};

export const getPlanLimits = (planName) => {
  return PLANS[planName] || PLANS.FREE;
};

export const getPlanColor = (planName) => {
  const colors = {
    FREE: 'from-gray-600 to-gray-800',
    BRONZE: 'from-orange-600 to-orange-800',
    PRATA: 'from-gray-400 to-gray-600',
    OURO: 'from-yellow-500 to-yellow-700',
  };
  return colors[planName] || colors.FREE;
};
