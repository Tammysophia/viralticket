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

const normalizeOfferType = (offer) =>
  offer?.type || (offer?.status === 'modelando' ? 'modelagem' : 'oferta');

const toMillis = (value) => {
  if (!value) return 0;
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
  }
  if (value?.toDate) return value.toDate().getTime();
  return 0;
};

const normalizeOffer = (offer) => ({
  ...offer,
  type: normalizeOfferType(offer),
});

const dedupeAndSortOffers = (offers) => {
  const map = new Map();
  offers.forEach((offer) => {
    if (offer?.id) {
      map.set(offer.id, normalizeOffer(offer));
    }
  });
  return Array.from(map.values()).sort(
    (a, b) => toMillis(b.updatedAt) - toMillis(a.updatedAt),
  );
};

const logIndexReminder = (error) => {
  if (
    error?.code === 'failed-precondition' &&
    typeof error?.message === 'string' &&
    error.message.includes('index')
  ) {
    console.warn(
      'VT: Crie o índice composto no Firestore com userId (Asc), type (Asc) e updatedAt (Desc).',
    );
  }
};

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
  if (USE_MOCKS) {
    console.log('VT: [MOCK] Criando oferta:', data);
    const mockId = `mock_${Date.now()}`;
    // VT: Salvar no localStorage para simular
    const offers = JSON.parse(localStorage.getItem('vt_offers') || '[]');
      offers.push({
        id: mockId,
        ...data,
        // VT: Tipamos explicitamente a oferta criada pela IA para separação nos Kanbans
        type: 'oferta',
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
        // VT: Tipamos explicitamente a oferta criada pela IA para separação nos Kanbans
        type: 'oferta',
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
      offers[index] = {
        ...offers[index],
        ...patch,
        // VT: Garante que o tipo sempre permaneça definido mesmo durante atualizações parciais
        type: patch.type || offers[index].type || 'oferta',
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('vt_offers', JSON.stringify(offers));
    }
    return;
  }

    try {
      const offerRef = doc(db, 'offers', id);
      const currentSnapshot = await getDoc(offerRef);
      const currentData = currentSnapshot.exists() ? currentSnapshot.data() : {};

      await updateDoc(offerRef, {
        ...patch,
        // VT: Garante que o tipo sempre permaneça definido mesmo durante atualizações parciais
        type: patch.type || currentData.type || 'oferta',
        updatedAt: Timestamp.now(),
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
export const getUserOffers = async (userId, type) => {
  if (USE_MOCKS) {
    console.log('VT: [MOCK] Buscando ofertas do usuário:', userId);
    const offers = JSON.parse(localStorage.getItem('vt_offers') || '[]');
    return dedupeAndSortOffers(
      offers.filter((o) => {
        const offerType = normalizeOfferType(o);
        const matchesUser = o.userId === userId;
        const matchesType = type ? offerType === type : true;
        return matchesUser && matchesType;
      }),
    );
  }

  const collected = [];
  const runQuery = async (constraints) => {
    const q = query(
      collection(db, 'offers'),
      ...constraints,
      orderBy('updatedAt', 'desc'),
    );
    try {
      const snapshot = await getDocs(q);
      collected.push(
        ...snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      );
    } catch (error) {
      logIndexReminder(error);
      throw error;
    }
  };

  try {
    const mainConstraints = [where('userId', '==', userId)];
    if (type) {
      mainConstraints.push(where('type', '==', type));
    }
    await runQuery(mainConstraints);

    // VT: Incluímos ofertas antigas sem campo `type` quando o filtro é para ofertas da IA
    if (type === 'oferta') {
      try {
        await runQuery([where('userId', '==', userId), where('type', '==', null)]);
      } catch (fallbackError) {
        // VT: Já registramos o lembrete de índice dentro de runQuery
      }
    }
  } catch (error) {
    console.error('VT: Erro ao buscar ofertas:', error);
    try {
      const legacySnapshot = await getDocs(
        query(
          collection(db, 'offers'),
          where('userId', '==', userId),
          orderBy('updatedAt', 'desc'),
        ),
      );
      collected.push(
        ...legacySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      );
    } catch (legacyError) {
      console.error('VT: Erro no fallback de ofertas:', legacyError);
      return [];
    }
  }

  const filtered = collected.filter((offer) => {
    const offerType = normalizeOfferType(offer);
    return type ? offerType === type : true;
  });

  return dedupeAndSortOffers(filtered);
};

/**
 * VT: Listener em tempo real para ofertas do usuário
 * @param {string} userId - ID do usuário
 * @param {Function} callback - Função chamada quando ofertas mudam
 * @returns {Function} - Função para cancelar o listener
 */
export const subscribeToUserOffers = (userId, callback, type = 'oferta') => {
  if (USE_MOCKS) {
    console.log('VT: [MOCK] Listener de ofertas iniciado');
    // VT: Simular listener com setInterval
    const interval = setInterval(() => {
      const offers = JSON.parse(localStorage.getItem('vt_offers') || '[]');
      const filtered = offers.filter((o) => {
        const offerType = normalizeOfferType(o);
        return o.userId === userId && (type ? offerType === type : true);
      });

      callback(dedupeAndSortOffers(filtered));
    }, 2000);
    return () => clearInterval(interval);
  }

  const unsubscribers = [];
  const listenerState = {
    main: [],
    legacy: [],
  };

  const emit = () => {
    const merged = dedupeAndSortOffers([
      ...listenerState.main,
      ...listenerState.legacy,
    ]).filter((offer) => {
      const offerType = normalizeOfferType(offer);
      return type ? offerType === type : true;
    });
    callback(merged);
  };

  const registerListener = (constraints, key) => {
    const q = query(
      collection(db, 'offers'),
      ...constraints,
      orderBy('updatedAt', 'desc'),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        listenerState[key] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        emit();
      },
      (error) => {
        logIndexReminder(error);
        console.error('VT: Erro no listener de ofertas:', error);
      },
    );

    unsubscribers.push(unsubscribe);
  };

  const mainConstraints = [where('userId', '==', userId)];
  if (type) {
    mainConstraints.push(where('type', '==', type));
  }
  registerListener(mainConstraints, 'main');

  if (type === 'oferta') {
    registerListener([where('userId', '==', userId), where('type', '==', null)], 'legacy');
  }

  return () => {
    unsubscribers.forEach((unsubscribe) => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
  };
};

/**
 * VT: Duplica uma oferta de IA para modelagem
 * @param {Object} offer - Oferta original
 * @returns {Promise<string>} - ID da nova oferta duplicada
 */
export const duplicateOfferForModeling = async (offer) => {
  if (!offer || !offer.id) {
    throw new Error('VT: Oferta inválida para duplicação');
  }

  const createdAtValue = USE_MOCKS ? new Date().toISOString() : Timestamp.now();
  const updatedAtValue = USE_MOCKS ? createdAtValue : Timestamp.now();
  const duplicated = {
    ...offer,
    status: 'pendente',
    type: 'modelagem',
    createdAt: createdAtValue,
    updatedAt: updatedAtValue,
  };
  delete duplicated.id;

  if (USE_MOCKS) {
    const mockId = `mock_model_${Date.now()}`;
    const offers = JSON.parse(localStorage.getItem('vt_offers') || '[]');
    offers.push({
      id: mockId,
      ...duplicated,
    });
    localStorage.setItem('vt_offers', JSON.stringify(offers));
    return mockId;
  }

  const newDocRef = doc(collection(db, 'offers'));
  await setDoc(newDocRef, duplicated);
  return newDocRef.id;
};
