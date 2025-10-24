export const PLANS = {
  FREE: {
    name: 'FREE',
    offers: 3,
    urls: 3,
    color: 'gray',
    badge: '🆓',
  },
  BRONZE: {
    name: 'BRONZE',
    offers: 5,
    urls: 5,
    color: 'orange',
    badge: '🥉',
  },
  PRATA: {
    name: 'PRATA',
    offers: 10,
    urls: 10,
    color: 'gray',
    badge: '🥈',
  },
  OURO: {
    name: 'OURO',
    offers: 'unlimited',
    urls: 'unlimited',
    color: 'yellow',
    badge: '🥇',
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
