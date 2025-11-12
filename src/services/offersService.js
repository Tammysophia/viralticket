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

// VT: Função para buscar as ofertas de um usuário
export const getUserOffers = async (userId) => {
  const q = query(
    collection(db, 'offers'),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  );

  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Erro ao buscar ofertas do usuário:', error);
    return [];
  }
};

// Outras funções de manipulação de ofertas
export const createOfferFromAI = async (data) => { ... }
export const updateOffer = async (id, patch) => { ... }
export const deleteOffer = async (id) => { ... }
export const addYoutubeLink = async (offerId, url) => { ... }
export const removeYoutubeLink = async (offerId, url) => { ... }
export const attachFiles = async (offerId, filesMeta) => { ... }

// Exporte todas as funções corretamente
export {
  getUserOffers, // Esta é a exportação que faltava
  createOfferFromAI,
  updateOffer,
  deleteOffer,
  addYoutubeLink,
  removeYoutubeLink,
  attachFiles,
};
