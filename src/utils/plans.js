export const PLANS = {
  PRATA: {
    name: 'PRATA',
    offers: 3,              // Por dia - 3 ofertas diárias
    offersMonthly: 90,      // Por mês (30 dias × 3/dia)
    urls: 'unlimited',      // ILIMITADO - YouTube extractor sem limites
    urlsMonthly: 'unlimited',
    color: 'gray',
    badge: '🥈',
    price: 19.90,
  },
  OURO: {
    name: 'OURO',
    offers: 10,             // Por dia - 10 ofertas diárias
    offersMonthly: 300,     // Por mês (30 dias × 10/dia)
    urls: 'unlimited',      // ILIMITADO - YouTube extractor sem limites
    urlsMonthly: 'unlimited',
    color: 'yellow',
    badge: '🥇',
    price: 49.90,
  },
  DIAMANTE: {
    name: 'DIAMANTE',
    offers: 'unlimited',    // ILIMITADO
    offersMonthly: 'unlimited',
    urls: 'unlimited',      // ILIMITADO
    urlsMonthly: 'unlimited',
    color: 'cyan',
    badge: '💎',
    price: 99.90,
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
  };
  return colors[planName] || colors.PRATA;
};
