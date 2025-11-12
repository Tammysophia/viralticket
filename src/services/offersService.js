import { db } from '../config/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';

// VT: Flag para usar mocks (ler do .env)
const USE_MOCKS = import.meta.env.VITE_VT_MOCKS === 'true';

/**
 * VT: Cria uma oferta a partir da IA
 * @param {Object} data - { title, copy: { page, adPrimary, adHeadline, adDescription }, youtubeLinks, userId }
 * @returns {Promise<string>} - ID da oferta criada
 */
export const createOfferFromAI = async (data) => {
  if (USE_MOCKS) {
    console.log('VT: [MOCK] Criando oferta:', data);
    const mockId = `mock_${Date.now()}`;
    const offers = JSON.parse(localStorage.getItem('vt_offers') || '[]');
    offers.push({
      id: mockId,
      type: 'oferta',
      ...data,
      status: 'execucao',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      modeling: {
        fanpageUrl: '',
        salesPageUrl: '',
        checkoutUrl: '',
        creativesCount: 0,
        monitorStart: null,
        monitorDays: 7,
        trend: null,
        modelavel: false
      },
      attachments: { files: [] }
    });
    localStorage.setItem('vt_offers', JSON.stringify(offers));
    return mockId;
  }

  try {
    const offerRef = doc(collection(db, 'offers'));
    const offerData = {
      ...data,
      type: data.type || 'oferta',
      status: 'execucao',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      modeling: {
        fanpageUrl: '',
        salesPageUrl: '',
        checkoutUrl: '',
        creativesCount: 0,
        monitorStart: null,
        monitorDays: 7,
        trend: null,
        modelavel: false
      },
      youtubeLinks: data.youtubeLinks || [],
      attachments: { files: [] }
    };
    
    await setDoc(offerRef, offerData);
    console.log('VT: Oferta criada:', offerRef.id);
    return offerRef.id;
  } catch (error) {
    console.error('VT: Erro ao criar oferta:', error);
    throw error;
  }
};

/**
 * VT: Função para duplicar uma oferta para modelagem
 * @param {Object} offer - A oferta a ser duplicada
 * @returns {Promise<string>} - ID da nova oferta de modelagem criada
 */
export const duplicateOfferForModeling = async (offer) => {
  try {
    const offerRef = doc(collection(db, 'offers'));
    const newOffer = {
      ...offer,
      type: 'modelagem',  // Alterando o tipo para modelagem
      status: 'pendente', // Definindo status como pendente
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    await setDoc(offerRef, newOffer);
    console.log('VT: Oferta duplicada para modelagem com sucesso!');
    return offerRef.id;
  } catch (error) {
    console.error('VT: Erro ao duplicar oferta para modelagem:', error);
    throw error;
  }
};

/**
 * VT: Atualiza uma oferta
 * @param {string} id - ID da oferta
 * @param {Object} patch - Dados para atualizar
 */
export const updateOffer = async (id, patch) => {
  if (USE_MOCKS) {
    console.log('VT: [MOCK] Atualizando oferta:', id, patch);
    const offers = JSON.parse(localStorage.getItem('vt_offers') || '[]');
    const index = offers.findIndex(o => o.id === id);
    if (index !== -1) {
      offers[index] = { ...offers[index], ...patch, updatedAt: new Date().toISOString() };
      localStorage.setItem('vt_offers', JSON.stringify(offers));
    }
    return;
  }

  try {
    const offerRef = doc(db, 'offers', id);
    await updateDoc(offerRef, {
      ...patch,
      updatedAt: Timestamp.now()
    });
    console.log('VT: Oferta atualizada:', id);
  } catch (error) {
    console.error('VT: Erro ao atualizar oferta:', error);
    throw error;
  }
};

/**
 * VT: Exclui uma oferta
 * @param {string} id - ID da oferta
 */
export const deleteOffer = async (id) => {
  if (USE_MOCKS) {
    console.log('VT: [MOCK] Excluindo oferta:', id);
    const offers = JSON.parse(localStorage.getItem('vt_offers') || '[]');
    const filtered = offers.filter(o => o.id !== id);
    localStorage.setItem('vt_offers', JSON.stringify(filtered));
    return;
  }

  try {
    await deleteDoc(doc(db, 'offers', id));
    console.log('VT: Oferta excluída:', id);
  } catch (error) {
    console.error('VT: Erro ao excluir oferta:', error);
    throw error;
  }
};

// Continue com os outros métodos do arquivo...
