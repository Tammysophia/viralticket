// Serviço Firebase para gerenciamento de dados
// Nota: Substituir por Firebase SDK em produção

/**
 * Simula Firestore para desenvolvimento
 * Em produção, usar Firebase Firestore
 */
class FirestoreSimulator {
  constructor() {
    this.collections = {};
  }

  collection(name) {
    if (!this.collections[name]) {
      this.collections[name] = {};
    }
    return {
      doc: (id) => ({
        set: (data) => this.setDoc(name, id, data),
        get: () => this.getDoc(name, id),
        update: (data) => this.updateDoc(name, id, data),
        delete: () => this.deleteDoc(name, id),
      }),
      get: () => this.getCollection(name),
      add: (data) => this.addDoc(name, data),
    };
  }

  async setDoc(collectionName, docId, data) {
    const storageKey = `firestore_${collectionName}_${docId}`;
    const docData = {
      ...data,
      _id: docId,
      _collection: collectionName,
      _updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(storageKey, JSON.stringify(docData));
    return { success: true };
  }

  async getDoc(collectionName, docId) {
    const storageKey = `firestore_${collectionName}_${docId}`;
    const data = localStorage.getItem(storageKey);
    if (!data) {
      return { exists: false, data: () => null };
    }
    const parsed = JSON.parse(data);
    return {
      exists: true,
      id: docId,
      data: () => parsed,
    };
  }

  async updateDoc(collectionName, docId, data) {
    const existing = await this.getDoc(collectionName, docId);
    if (!existing.exists) {
      throw new Error('Document does not exist');
    }
    const merged = { ...existing.data(), ...data, _updatedAt: new Date().toISOString() };
    return this.setDoc(collectionName, docId, merged);
  }

  async deleteDoc(collectionName, docId) {
    const storageKey = `firestore_${collectionName}_${docId}`;
    localStorage.removeItem(storageKey);
    return { success: true };
  }

  async getCollection(collectionName) {
    const docs = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(`firestore_${collectionName}_`)) {
        const data = JSON.parse(localStorage.getItem(key));
        docs.push({
          id: data._id,
          data: () => data,
        });
      }
    }
    return { docs, empty: docs.length === 0 };
  }

  async addDoc(collectionName, data) {
    const id = Date.now().toString();
    await this.setDoc(collectionName, id, data);
    return { id };
  }

  serverTimestamp() {
    return new Date().toISOString();
  }
}

// Exportar instância simulada
export const db = new FirestoreSimulator();

// Função helper para timestamp
export const serverTimestamp = () => new Date().toISOString();

/**
 * Salva uma chave API no Firestore
 * @param {string} service - Nome do serviço (youtube, openai, firebase)
 * @param {object} keyData - Dados da chave
 */
export const saveAPIKey = async (service, keyData) => {
  try {
    await db.collection('apiKeys').doc(service).set({
      ...keyData,
      service,
      lastUpdated: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Erro ao salvar chave:', error);
    throw error;
  }
};

/**
 * Busca uma chave API do Firestore
 * @param {string} service - Nome do serviço
 */
export const getAPIKey = async (service) => {
  try {
    const doc = await db.collection('apiKeys').doc(service).get();
    if (!doc.exists) {
      return null;
    }
    return doc.data();
  } catch (error) {
    console.error('Erro ao buscar chave:', error);
    return null;
  }
};

/**
 * Busca todas as chaves API ativas
 */
export const getAllAPIKeys = async () => {
  try {
    const snapshot = await db.collection('apiKeys').get();
    const keys = {};
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.status === 'active') {
        keys[doc.id] = data;
      }
    });
    return keys;
  } catch (error) {
    console.error('Erro ao buscar chaves:', error);
    return {};
  }
};

/**
 * Deleta uma chave API do Firestore
 * @param {string} service - Nome do serviço
 */
export const deleteAPIKey = async (service) => {
  try {
    await db.collection('apiKeys').doc(service).delete();
    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar chave:', error);
    throw error;
  }
};
