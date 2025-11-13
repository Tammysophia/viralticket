export const PLANS = {
  PRATA: {
    name: 'PRATA',
    offers: 3,              // Por dia - Plano inicial
    offersMonthly: 90,      // Por mês (30 dias × 3/dia)
    urls: 'unlimited',      // ILIMITADO - YouTube extractor sem limites
    urlsMonthly: 'unlimited',
    color: 'silver',
    badge: '🥈',
    price: 29.90,
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
  return PLANS[planName] || PLANS.PRATA;
};

export const getPlanColor = (planName) => {
  const colors = {
    PRATA: 'from-gray-400 to-gray-600',
    OURO: 'from-yellow-500 to-yellow-700',
    DIAMANTE: 'from-purple-500 to-pink-600',
  };
  return colors[planName] || colors.PRATA;
};
