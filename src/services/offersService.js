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

// VT: Flag para usar mocks (ler do .env)
const USE_MOCKS = import.meta.env.VITE_VT_MOCKS === 'true';

/**
 * VT: Estrutura de uma oferta no Firestore
 * offers/{offerId}
 * {
 *   userId: string,
 *   title: string,
 *   status: 'pendente' | 'execucao' | 'modelando' | 'concluido',
 *   createdAt: Timestamp,
 *   updatedAt: Timestamp,
 *   copy: { page, adPrimary, adHeadline, adDescription },
 *   modeling: { fanpageUrl, salesPageUrl, checkoutUrl, creativesCount, monitorStart, monitorDays, trend, modelavel },
 *   youtubeLinks: string[],
 *   attachments: { files: [] }
 * }
 */

/**
 * VT: Cria uma oferta a partir da IA
 * @param {Object} data - { title, copy: { page, adPrimary, adHeadline, adDescription }, youtubeLinks, userId }
 * @returns {Promise<string>} - ID da oferta criada
 */
export const createOfferFromAI = async (data) => {
  // 🚀 MODO EMERGÊNCIA: Sempre usar localStorage (não depende do Firestore)
  console.log('VT: Salvando oferta no localStorage (modo emergência)');
  const offerId = `offer_${Date.now()}`;
  const offers = JSON.parse(localStorage.getItem('vt_offers') || '[]');
  offers.push({
    id: offerId,
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
  console.log('VT: ✅ Oferta salva com sucesso:', offerId);
  return offerId;
  
  /* DESABILITADO TEMPORARIAMENTE - Firestore
  if (USE_MOCKS) {
    console.log('VT: [MOCK] Criando oferta:', data);
    const mockId = `mock_${Date.now()}`;
    // VT: Salvar no localStorage para simular
    const offers = JSON.parse(localStorage.getItem('vt_offers') || '[]');
    offers.push({
      id: mockId,
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
      status: 'execucao', // VT: Nova oferta começa em execução
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
  */
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

/**
 * VT: Adiciona link do YouTube a uma oferta
 * @param {string} offerId - ID da oferta
 * @param {string} url - URL do YouTube
 */
export const addYoutubeLink = async (offerId, url) => {
  if (USE_MOCKS) {
    console.log('VT: [MOCK] Adicionando link:', offerId, url);
    const offers = JSON.parse(localStorage.getItem('vt_offers') || '[]');
    const offer = offers.find(o => o.id === offerId);
    if (offer) {
      if (!offer.youtubeLinks) offer.youtubeLinks = [];
      if (!offer.youtubeLinks.includes(url)) {
        offer.youtubeLinks.push(url);
      }
      localStorage.setItem('vt_offers', JSON.stringify(offers));
    }
    return;
  }

  try {
    const offerRef = doc(db, 'offers', offerId);
    const offerSnap = await getDoc(offerRef);
    if (offerSnap.exists()) {
      const links = offerSnap.data().youtubeLinks || [];
      if (!links.includes(url)) {
        links.push(url);
        await updateDoc(offerRef, { youtubeLinks: links, updatedAt: Timestamp.now() });
      }
    }
  } catch (error) {
    console.error('VT: Erro ao adicionar link:', error);
    throw error;
  }
};

/**
 * VT: Remove link do YouTube de uma oferta
 * @param {string} offerId - ID da oferta
 * @param {string} url - URL do YouTube
 */
export const removeYoutubeLink = async (offerId, url) => {
  if (USE_MOCKS) {
    console.log('VT: [MOCK] Removendo link:', offerId, url);
    const offers = JSON.parse(localStorage.getItem('vt_offers') || '[]');
    const offer = offers.find(o => o.id === offerId);
    if (offer && offer.youtubeLinks) {
      offer.youtubeLinks = offer.youtubeLinks.filter(l => l !== url);
      localStorage.setItem('vt_offers', JSON.stringify(offers));
    }
    return;
  }

  try {
    const offerRef = doc(db, 'offers', offerId);
    const offerSnap = await getDoc(offerRef);
    if (offerSnap.exists()) {
      const links = offerSnap.data().youtubeLinks || [];
      const filtered = links.filter(l => l !== url);
      await updateDoc(offerRef, { youtubeLinks: filtered, updatedAt: Timestamp.now() });
    }
  } catch (error) {
    console.error('VT: Erro ao remover link:', error);
    throw error;
  }
};

/**
 * VT: Anexa metadados de arquivos à oferta
 * @param {string} offerId - ID da oferta
 * @param {Array} filesMeta - [{ name, url, size, type }]
 */
export const attachFiles = async (offerId, filesMeta) => {
  if (USE_MOCKS) {
    console.log('VT: [MOCK] Anexando arquivos:', offerId, filesMeta);
    const offers = JSON.parse(localStorage.getItem('vt_offers') || '[]');
    const offer = offers.find(o => o.id === offerId);
    if (offer) {
      if (!offer.attachments) offer.attachments = { files: [] };
      offer.attachments.files.push(...filesMeta);
      localStorage.setItem('vt_offers', JSON.stringify(offers));
    }
    return;
  }

  try {
    const offerRef = doc(db, 'offers', offerId);
    const offerSnap = await getDoc(offerRef);
    if (offerSnap.exists()) {
      const currentFiles = offerSnap.data().attachments?.files || [];
      await updateDoc(offerRef, {
        'attachments.files': [...currentFiles, ...filesMeta],
        updatedAt: Timestamp.now()
      });
    }
  } catch (error) {
    console.error('VT: Erro ao anexar arquivos:', error);
    throw error;
  }
};

/**
 * VT: Busca todas as ofertas do usuário
 * @param {string} userId - ID do usuário
 * @returns {Promise<Array>} - Lista de ofertas
 */
export const getUserOffers = async (userId) => {
  if (USE_MOCKS) {
    console.log('VT: [MOCK] Buscando ofertas do usuário:', userId);
    const offers = JSON.parse(localStorage.getItem('vt_offers') || '[]');
    return offers.filter(o => o.userId === userId);
  }

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
  if (USE_MOCKS) {
    console.log('VT: [MOCK] Listener de ofertas iniciado');
    // VT: Simular listener com setInterval
    const interval = setInterval(() => {
      const offers = JSON.parse(localStorage.getItem('vt_offers') || '[]');
      callback(offers.filter(o => o.userId === userId));
    }, 2000);
    return () => clearInterval(interval);
  }

  const q = query(
    collection(db, 'offers'),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const offers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(offers);
  });
};
