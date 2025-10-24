// Firebase service for managing offers
// Note: This is a mock implementation. Replace with actual Firebase when credentials are available.

let offersCache = {
  pending: [
    {
      id: '1',
      title: 'Oferta de Emagrecimento',
      description: 'Método comprovado para perder peso',
      agent: 'Sophia Fênix 🔥',
      status: 'pending',
      date: new Date().toISOString(),
      modeling: null,
    },
  ],
  inExecution: [
    {
      id: '2',
      title: 'Curso de Marketing Digital',
      description: 'Aprenda marketing do zero',
      agent: 'Sofia Universal 🌟',
      status: 'inExecution',
      date: new Date().toISOString(),
      modeling: null,
    },
  ],
  modeling: [
    {
      id: '3',
      title: 'Mentoria de Vendas',
      description: 'Venda mais e melhor',
      agent: 'Sophia Fênix 🔥',
      status: 'modeling',
      date: new Date().toISOString(),
      modeling: {
        salesPageUrl: 'https://example.com/vendas',
        checkoutUrl: 'https://example.com/checkout',
        fanpageUrl: 'https://facebook.com/page',
        creativesCount: 5,
        startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 7,
        status: 'modeling_well',
      },
    },
  ],
  completed: [
    {
      id: '4',
      title: 'Infoproduto de Finanças',
      description: 'Organização financeira pessoal',
      agent: 'Sofia Universal 🌟',
      status: 'completed',
      date: new Date().toISOString(),
      modeling: null,
    },
  ],
};

// Simulate Firebase listeners
let listeners = [];

// Get all offers by status
export const getOffersByStatus = async (status) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(offersCache[status] || []);
    }, 100);
  });
};

// Get all offers
export const getAllOffers = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(offersCache);
    }, 100);
  });
};

// Create new offer
export const createOffer = async (offerData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newOffer = {
        id: Date.now().toString(),
        ...offerData,
        date: new Date().toISOString(),
        status: offerData.status || 'pending',
        modeling: null,
      };
      
      const status = newOffer.status;
      if (!offersCache[status]) {
        offersCache[status] = [];
      }
      offersCache[status].push(newOffer);
      
      // Notify listeners
      notifyListeners();
      
      resolve(newOffer);
    }, 100);
  });
};

// Update offer
export const updateOffer = async (offerId, updates) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let updatedOffer = null;
      
      // Find and update offer in all statuses
      Object.keys(offersCache).forEach((status) => {
        const offerIndex = offersCache[status].findIndex(o => o.id === offerId);
        if (offerIndex !== -1) {
          offersCache[status][offerIndex] = {
            ...offersCache[status][offerIndex],
            ...updates,
          };
          updatedOffer = offersCache[status][offerIndex];
          
          // If status changed, move to new column
          if (updates.status && updates.status !== status) {
            const [removed] = offersCache[status].splice(offerIndex, 1);
            removed.status = updates.status;
            if (!offersCache[updates.status]) {
              offersCache[updates.status] = [];
            }
            offersCache[updates.status].push(removed);
            updatedOffer = removed;
          }
        }
      });
      
      // Notify listeners
      notifyListeners();
      
      resolve(updatedOffer);
    }, 100);
  });
};

// Delete offer
export const deleteOffer = async (offerId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let deleted = false;
      
      // Find and delete offer from all statuses
      Object.keys(offersCache).forEach((status) => {
        const offerIndex = offersCache[status].findIndex(o => o.id === offerId);
        if (offerIndex !== -1) {
          offersCache[status].splice(offerIndex, 1);
          deleted = true;
        }
      });
      
      // Notify listeners
      notifyListeners();
      
      resolve(deleted);
    }, 100);
  });
};

// Add modeling data to offer
export const addModeling = async (offerId, modelingData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const modeling = {
        ...modelingData,
        startDate: new Date().toISOString(),
        duration: 7,
        status: 'monitoring',
      };
      
      updateOffer(offerId, { modeling, status: 'modeling' }).then(resolve);
    }, 100);
  });
};

// Update modeling status
export const updateModelingStatus = async (offerId, creativesCount) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let offer = null;
      
      Object.keys(offersCache).forEach((status) => {
        const found = offersCache[status].find(o => o.id === offerId);
        if (found) offer = found;
      });
      
      if (offer && offer.modeling) {
        const daysPassed = Math.floor(
          (new Date() - new Date(offer.modeling.startDate)) / (1000 * 60 * 60 * 24)
        );
        
        let modelingStatus = 'monitoring';
        if (creativesCount > offer.modeling.creativesCount) {
          modelingStatus = 'modeling_well';
        } else if (creativesCount < offer.modeling.creativesCount) {
          modelingStatus = 'not_scalable';
        }
        
        const updatedModeling = {
          ...offer.modeling,
          creativesCount,
          daysPassed,
          status: modelingStatus,
        };
        
        updateOffer(offerId, { modeling: updatedModeling }).then(resolve);
      } else {
        resolve(null);
      }
    }, 100);
  });
};

// Subscribe to real-time updates
export const subscribeToOffers = (callback) => {
  listeners.push(callback);
  
  // Return unsubscribe function
  return () => {
    listeners = listeners.filter(l => l !== callback);
  };
};

// Notify all listeners
const notifyListeners = () => {
  listeners.forEach(callback => {
    callback(offersCache);
  });
};

// Initialize with cached data
export const initializeOffers = () => {
  return getAllOffers();
};
