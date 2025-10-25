// Serviço Firebase para gerenciamento de dados
import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc,
  query,
  where 
} from 'firebase/firestore';

// Flag para usar Firebase real ou simulação
const USE_REAL_FIREBASE = true;

/**
 * Simula Firestore para desenvolvimento local (fallback)
 * Em produção, usar Firebase Firestore real
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

// Exportar instância simulada (fallback)
const simulatedDb = new FirestoreSimulator();

// Função helper para timestamp
export const serverTimestamp = () => new Date().toISOString();

/**
 * Salva uma chave API no Firestore
 * @param {string} service - Nome do serviço (youtube, openai, firebase)
 * @param {object} keyData - Dados da chave
 */
export const saveAPIKey = async (service, keyData) => {
  try {
    if (USE_REAL_FIREBASE) {
      // Usar Firebase real
      await setDoc(doc(db, 'apiKeys', service), {
        ...keyData,
        service,
        lastUpdated: serverTimestamp(),
      });
    } else {
      // Fallback para simulação
      await simulatedDb.collection('apiKeys').doc(service).set({
        ...keyData,
        service,
        lastUpdated: serverTimestamp(),
      });
    }
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
    if (USE_REAL_FIREBASE) {
      // Usar Firebase real
      const docRef = doc(db, 'apiKeys', service);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      return docSnap.data();
    } else {
      // Fallback para simulação
      const docData = await simulatedDb.collection('apiKeys').doc(service).get();
      if (!docData.exists) {
        return null;
      }
      return docData.data();
    }
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
    if (USE_REAL_FIREBASE) {
      // Usar Firebase real
      const keysRef = collection(db, 'apiKeys');
      const snapshot = await getDocs(keysRef);
      
      const keys = {};
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.status === 'active') {
          keys[docSnap.id] = data;
        }
      });
      return keys;
    } else {
      // Fallback para simulação
      const snapshot = await simulatedDb.collection('apiKeys').get();
      const keys = {};
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.status === 'active') {
          keys[doc.id] = data;
        }
      });
      return keys;
    }
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
    if (USE_REAL_FIREBASE) {
      // Usar Firebase real
      await deleteDoc(doc(db, 'apiKeys', service));
    } else {
      // Fallback para simulação
      await simulatedDb.collection('apiKeys').doc(service).delete();
    }
    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar chave:', error);
    throw error;
  }
};
