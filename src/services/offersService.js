// VT: Serviço de gerenciamento de ofertas com Firestore
import { db } from "../config/firebase";
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
  onSnapshot,
} from "firebase/firestore";

// VT: Flag para usar mocks (ler do .env)
const USE_MOCKS = import.meta.env.VITE_VT_MOCKS === "true";

// VT: Normaliza ofertas para garantir que type sempre exista
const normalizeOfferType = (offer = {}) => ({
  ...offer,
  type: offer?.type || "oferta",
});

// VT: Builder helper para snapshots do Firestore
const buildOfferFromSnapshot = (snapshot) =>
  normalizeOfferType({
    id: snapshot.id,
    ...snapshot.data(),
  });

// VT: Log específico para instruir criação de índice composto
const logIndexInstruction = (error) => {
  if (error?.message?.includes("requires an index")) {
    console.error(
      '⚠️ Firestore requires an index. Crie um índice composto para a coleção "offers" com os campos userId (Ascendente), type (Ascendente) e updatedAt (Descendente).',
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
    console.log("VT: [MOCK] Criando oferta:", data);
    const mockId = `mock_${Date.now()}`;
    // VT: Salvar no localStorage para simular
    const offers = JSON.parse(localStorage.getItem("vt_offers") || "[]");
    offers.push({
      id: mockId,
      ...data,
      status: "execucao",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: "oferta",
      modeling: {
        fanpageUrl: "",
        salesPageUrl: "",
        checkoutUrl: "",
        creativesCount: 0,
        monitorStart: null,
        monitorDays: 7,
        trend: null,
        modelavel: false,
      },
      attachments: { files: [] },
    });
    localStorage.setItem("vt_offers", JSON.stringify(offers));
    return mockId;
  }

  try {
    const offerRef = doc(collection(db, "offers"));
    const offerData = {
      ...data,
      status: "execucao", // VT: Nova oferta começa em execução
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      type: "oferta",
      modeling: {
        fanpageUrl: "",
        salesPageUrl: "",
        checkoutUrl: "",
        creativesCount: 0,
        monitorStart: null,
        monitorDays: 7,
        trend: null,
        modelavel: false,
      },
      youtubeLinks: data.youtubeLinks || [],
      attachments: { files: [] },
    };

    await setDoc(offerRef, offerData);
    console.log("VT: Oferta criada:", offerRef.id);
    return offerRef.id;
  } catch (error) {
    console.error("VT: Erro ao criar oferta:", error);
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
    console.log("VT: [MOCK] Atualizando oferta:", id, patch);
    const offers = JSON.parse(localStorage.getItem("vt_offers") || "[]");
    const index = offers.findIndex((o) => o.id === id);
    if (index !== -1) {
      offers[index] = {
        ...offers[index],
        ...patch,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem("vt_offers", JSON.stringify(offers));
    }
    return;
  }

  try {
    const offerRef = doc(db, "offers", id);
    await updateDoc(offerRef, {
      ...patch,
      updatedAt: Timestamp.now(),
    });
    console.log("VT: Oferta atualizada:", id);
  } catch (error) {
    console.error("VT: Erro ao atualizar oferta:", error);
    throw error;
  }
};

/**
 * VT: Exclui uma oferta
 * @param {string} id - ID da oferta
 */
export const deleteOffer = async (id) => {
  if (USE_MOCKS) {
    console.log("VT: [MOCK] Excluindo oferta:", id);
    const offers = JSON.parse(localStorage.getItem("vt_offers") || "[]");
    const filtered = offers.filter((o) => o.id !== id);
    localStorage.setItem("vt_offers", JSON.stringify(filtered));
    return;
  }

  try {
    await deleteDoc(doc(db, "offers", id));
    console.log("VT: Oferta excluída:", id);
  } catch (error) {
    console.error("VT: Erro ao excluir oferta:", error);
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
    console.log("VT: [MOCK] Adicionando link:", offerId, url);
    const offers = JSON.parse(localStorage.getItem("vt_offers") || "[]");
    const offer = offers.find((o) => o.id === offerId);
    if (offer) {
      if (!offer.youtubeLinks) offer.youtubeLinks = [];
      if (!offer.youtubeLinks.includes(url)) {
        offer.youtubeLinks.push(url);
      }
      localStorage.setItem("vt_offers", JSON.stringify(offers));
    }
    return;
  }

  try {
    const offerRef = doc(db, "offers", offerId);
    const offerSnap = await getDoc(offerRef);
    if (offerSnap.exists()) {
      const links = offerSnap.data().youtubeLinks || [];
      if (!links.includes(url)) {
        links.push(url);
        await updateDoc(offerRef, {
          youtubeLinks: links,
          updatedAt: Timestamp.now(),
        });
      }
    }
  } catch (error) {
    console.error("VT: Erro ao adicionar link:", error);
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
    console.log("VT: [MOCK] Removendo link:", offerId, url);
    const offers = JSON.parse(localStorage.getItem("vt_offers") || "[]");
    const offer = offers.find((o) => o.id === offerId);
    if (offer && offer.youtubeLinks) {
      offer.youtubeLinks = offer.youtubeLinks.filter((l) => l !== url);
      localStorage.setItem("vt_offers", JSON.stringify(offers));
    }
    return;
  }

  try {
    const offerRef = doc(db, "offers", offerId);
    const offerSnap = await getDoc(offerRef);
    if (offerSnap.exists()) {
      const links = offerSnap.data().youtubeLinks || [];
      const filtered = links.filter((l) => l !== url);
      await updateDoc(offerRef, {
        youtubeLinks: filtered,
        updatedAt: Timestamp.now(),
      });
    }
  } catch (error) {
    console.error("VT: Erro ao remover link:", error);
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
    console.log("VT: [MOCK] Anexando arquivos:", offerId, filesMeta);
    const offers = JSON.parse(localStorage.getItem("vt_offers") || "[]");
    const offer = offers.find((o) => o.id === offerId);
    if (offer) {
      if (!offer.attachments) offer.attachments = { files: [] };
      offer.attachments.files.push(...filesMeta);
      localStorage.setItem("vt_offers", JSON.stringify(offers));
    }
    return;
  }

  try {
    const offerRef = doc(db, "offers", offerId);
    const offerSnap = await getDoc(offerRef);
    if (offerSnap.exists()) {
      const currentFiles = offerSnap.data().attachments?.files || [];
      await updateDoc(offerRef, {
        "attachments.files": [...currentFiles, ...filesMeta],
        updatedAt: Timestamp.now(),
      });
    }
  } catch (error) {
    console.error("VT: Erro ao anexar arquivos:", error);
    throw error;
  }
};

/**
 * VT: Busca todas as ofertas do usuário
 * @param {string} userId - ID do usuário
 * @returns {Promise<Array>} - Lista de ofertas
 */
export const getUserOffers = async (userId, options = {}) => {
  const { type, applyTypeFilterInQuery = Boolean(type) } = options;

  if (USE_MOCKS) {
    console.log("VT: [MOCK] Buscando ofertas do usuário:", userId);
    const offers = JSON.parse(localStorage.getItem("vt_offers") || "[]")
      .filter((o) => o.userId === userId)
      .map(normalizeOfferType);
    if (!type) {
      return offers;
    }
    return offers.filter((offer) => offer.type === type);
  }

  try {
    const constraints = [where("userId", "==", userId)];

    if (applyTypeFilterInQuery && type) {
      constraints.push(where("type", "==", type));
    }

    constraints.push(orderBy("updatedAt", "desc"));

    const q = query(collection(db, "offers"), ...constraints);
    const snapshot = await getDocs(q);
    let offers = snapshot.docs.map(buildOfferFromSnapshot);

    if (type) {
      offers = offers.filter((offer) => offer.type === type);
    }

    return offers;
  } catch (error) {
    logIndexInstruction(error);
    console.error("VT: Erro ao buscar ofertas:", error);
    return [];
  }
};

/**
 * VT: Listener em tempo real para ofertas do usuário
 * @param {string} userId - ID do usuário
 * @param {Function} callback - Função chamada quando ofertas mudam
 * @returns {Function} - Função para cancelar o listener
 */
export const subscribeToUserOffers = (userId, callback, options = {}) => {
  const { type, applyTypeFilterInQuery = Boolean(type) } = options;

  if (USE_MOCKS) {
    console.log("VT: [MOCK] Listener de ofertas iniciado");
    // VT: Simular listener com setInterval
    const interval = setInterval(() => {
      const offers = JSON.parse(localStorage.getItem("vt_offers") || "[]");
      let userOffers = offers
        .filter((o) => o.userId === userId)
        .map(normalizeOfferType);

      if (type) {
        userOffers = userOffers.filter((offer) => offer.type === type);
      }

      callback(userOffers);
    }, 2000);
    return () => clearInterval(interval);
  }

  const constraints = [where("userId", "==", userId)];

  if (applyTypeFilterInQuery && type) {
    constraints.push(where("type", "==", type));
  }

  constraints.push(orderBy("updatedAt", "desc"));

  const q = query(collection(db, "offers"), ...constraints);

  return onSnapshot(
    q,
    (snapshot) => {
      let offers = snapshot.docs.map(buildOfferFromSnapshot);
      if (type) {
        offers = offers.filter((offer) => offer.type === type);
      }
      callback(offers);
    },
    (error) => {
      logIndexInstruction(error);
      console.error("VT: Erro no listener de ofertas:", error);
    },
  );
};

/**
 * VT: Duplica uma oferta de IA para modelagem
 * @param {Object} offer - Oferta original
 * @returns {Promise<string>} - ID da nova oferta
 */
export const duplicateOfferToModeling = async (offer) => {
  if (!offer?.id) {
    throw new Error("VT: Oferta inválida para duplicação");
  }

  const normalizedOffer = normalizeOfferType(offer);

  if (USE_MOCKS) {
    console.log(
      "VT: [MOCK] Duplicando oferta para modelagem:",
      normalizedOffer.id,
    );
    const offers = JSON.parse(localStorage.getItem("vt_offers") || "[]");
    const newOffer = {
      ...normalizedOffer,
      id: `mock_${Date.now()}`,
      status: "pendente",
      type: "modelagem",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    offers.push(newOffer);
    localStorage.setItem("vt_offers", JSON.stringify(offers));
    return newOffer.id;
  }

  try {
    const newOfferRef = doc(collection(db, "offers"));
    const {
      id: _id,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      ...rest
    } = normalizedOffer;

    const duplicatedData = {
      ...rest,
      status: "pendente",
      type: "modelagem",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDoc(newOfferRef, duplicatedData);
    console.log("VT: Oferta duplicada para modelagem:", newOfferRef.id);
    return newOfferRef.id;
  } catch (error) {
    logIndexInstruction(error);
    console.error("VT: Erro ao duplicar oferta para modelagem:", error);
    throw error;
  }
};
