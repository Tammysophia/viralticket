export const PLANS = {
  FREE: {
    name: 'FREE',
    offers: 2,              // Por dia
    offersMonthly: 15,      // Por mês (NOVO!)
    urls: 3,                // Por dia
    urlsMonthly: 30,        // Por mês (NOVO!)
    color: 'gray',
    badge: '🆓',
    price: 0,
  },
  BRONZE: {
    name: 'BRONZE',
    offers: 5,              // Por dia
    offersMonthly: 60,      // Por mês
    urls: 10,               // Por dia
    urlsMonthly: 100,       // Por mês
    color: 'orange',
    badge: '🥉',
    price: 9.90,
  },
  PRATA: {
    name: 'PRATA',
    offers: 10,             // Por dia
    offersMonthly: 150,     // Por mês
    urls: 20,               // Por dia
    urlsMonthly: 300,       // Por mês
    color: 'gray',
    badge: '🥈',
    price: 19.90,
  },
  OURO: {
    name: 'OURO',
    offers: 'unlimited',    // Por dia
    offersMonthly: 500,     // Por mês (limite de segurança)
    urls: 'unlimited',      // Por dia
    urlsMonthly: 1000,      // Por mês (limite de segurança)
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
