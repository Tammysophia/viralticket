// VT: Serviço de gerenciamento de ofertas com Firestore
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

/**
 * VT: Cria uma oferta a partir da IA
 * @param {Object} data - { title, copy: { page, adPrimary, adHeadline, adDescription }, youtubeLinks, userId }
 * @returns {Promise<string>} - ID da oferta criada
 */
export const createOfferFromAI = async (data) => {
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
 * VT: Atualiza uma oferta
 * @param {string} id - ID da oferta
 * @param {Object} patch - Dados para atualizar
 */
export const updateOffer = async (id, patch) => {
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
  try {
    await deleteDoc(doc(db, 'offers', id));
    console.log('VT: Oferta excluída:', id);
  } catch (error) {
    console.error('VT: Erro ao excluir oferta:', error);
    throw error;
  }
};

/**
 * VT: Busca todas as ofertas do usuário
 * @param {string} userId - ID do usuário
 * @returns {Promise<Array>} - Lista de ofertas
 */
export const getUserOffers = async (userId) => {
  try {
    const q = query(
      collection(db, 'offers'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('VT: Erro ao buscar ofertas:', error);
    return [];
  }
};

/**
 * VT: Listener em tempo real para ofertas do usuário
 * @param {string} userId - ID do usuário
 * @param {Function} callback - Função chamada quando ofertas mudam
 * @returns {Function} - Função para cancelar o listener
 */
export const subscribeToUserOffers = (userId, callback) => {
  const q = query(
    collection(db, 'offers'),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const offers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(offers);
  });
};
