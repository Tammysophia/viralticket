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

// Função para criar a oferta (já existente)
export const createOfferFromAI = async (data) => { ... };

// Função para atualizar a oferta (já existente)
export const updateOffer = async (id, patch) => { ... };

// Função para excluir a oferta (já existente)
export const deleteOffer = async (id) => { ... };

// Função para adicionar link do YouTube a uma oferta (já existente)
export const addYoutubeLink = async (offerId, url) => { ... };

// Função para remover link do YouTube de uma oferta (já existente)
export const removeYoutubeLink = async (offerId, url) => { ... };

// Função para adicionar arquivos à oferta (já existente)
export const attachFiles = async (offerId, filesMeta) => { ... };

// Função para buscar as ofertas de um usuário
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

// Função para inscrever-se nas ofertas de um usuário em tempo real
export const subscribeToUserOffers = (userId, callback, filterType = null) => {
  const q = query(
    collection(db, 'offers'),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    let offers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      type: doc.data().type || 'oferta'
    }));
    
    if (filterType) {
      offers = offers.filter(o => o.type === filterType);
    }
    
    callback(offers);
  });
};

// Exporte todas as funções corretamente
export {
  createOfferFromAI,
  updateOffer,
  deleteOffer,
  addYoutubeLink,
  removeYoutubeLink,
  attachFiles,
  getUserOffers,  // Aqui estamos exportando a função
  subscribeToUserOffers
};
