import { db, isFirebaseConfigured } from '../config/firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { serverTimestamp } from './firebaseService';

const COLLECTION = 'gptAgents';
const LOCAL_STORAGE_KEY = 'viralticket_gpt_agents';

const defaultAgents = [
  {
    name: 'Sophia Fênix',
    description: 'Especialista em ofertas de alto impacto e estratégia de copy.',
    icon: '🔥',
    imageUrl: 'https://iili.io/KbegFWu.png',
    url: '',
    active: true,
    order: 1,
  },
  {
    name: 'Sofia Universal',
    description: 'IA versátil para todos os nichos e ideias de campanhas.',
    icon: '🌟',
    imageUrl: 'https://iili.io/KieLs1V.png',
    url: '',
    active: true,
    order: 2,
  },
];

const isUsingFirestore = () => isFirebaseConfigured && db;

const getLocalAgents = () => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (error) {
    console.warn('VT: Erro ao parsear agentes locais:', error);
    return [];
  }
};

const saveLocalAgents = (agents) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(agents));
};

export const getAllAgents = async () => {
  try {
    if (isUsingFirestore()) {
      const agentsRef = collection(db, COLLECTION);
      const q = query(agentsRef, orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
    }

    const agents = getLocalAgents();
    return agents.sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (error) {
    console.error('VT: Erro ao buscar agentes:', error);
    return [];
  }
};

export const createAgent = async (agentData) => {
  const payload = {
    ...agentData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (isUsingFirestore()) {
    const docRef = doc(collection(db, COLLECTION));
    await setDoc(docRef, payload);
    return docRef.id;
  }

  const agents = getLocalAgents();
  const id = Date.now().toString();
  agents.push({ id, ...payload });
  saveLocalAgents(agents);
  return id;
};

export const updateAgent = async (agentId, updates) => {
  const payload = {
    ...updates,
    updatedAt: serverTimestamp(),
  };

  if (isUsingFirestore()) {
    await updateDoc(doc(db, COLLECTION, agentId), payload);
    return;
  }

  const agents = getLocalAgents();
  const updatedAgents = agents.map((agent) =>
    agent.id === agentId ? { ...agent, ...payload } : agent
  );
  saveLocalAgents(updatedAgents);
};

export const deleteAgent = async (agentId) => {
  if (isUsingFirestore()) {
    await deleteDoc(doc(db, COLLECTION, agentId));
    return;
  }

  const agents = getLocalAgents();
  const filtered = agents.filter((agent) => agent.id !== agentId);
  saveLocalAgents(filtered);
};

export const initializeDefaultAgents = async () => {
  const existing = await getAllAgents();
  if (existing.length > 0) return;

  if (isUsingFirestore()) {
    await Promise.all(
      defaultAgents.map(async (agent) => {
        const docRef = doc(collection(db, COLLECTION));
        await setDoc(docRef, {
          ...agent,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      })
    );
  } else {
    const seeded = defaultAgents.map((agent, index) => ({
      id: (Date.now() + index).toString(),
      ...agent,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }));
    saveLocalAgents(seeded);
  }
};
