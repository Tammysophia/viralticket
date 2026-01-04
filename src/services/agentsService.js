export const getActiveAgents = async () => {
  return [
    {
      id: 'sophia',
      name: 'Sophia Fênix',
      description: 'Especialista em ofertas de alto impacto',
      icon: '🔥',
      active: true,
      order: 1
    },
    {
      id: 'sofia',
      name: 'Sofia Universal',
      description: 'IA versátil para todos os nichos',
      icon: '🌟',
      active: true,
      order: 2
    }
  ];
};

export const getAllAgents = async () => {
  return getActiveAgents();
};

export const subscribeToActiveAgents = (callback) => {
  getActiveAgents().then(callback);
  return () => {};
};

export const createAgent = async () => {};
export const updateAgent = async () => {};
export const deleteAgent = async () => {};
export const initializeDefaultAgents = async () => {};
