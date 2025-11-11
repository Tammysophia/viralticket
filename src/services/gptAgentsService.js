// VT: Serviço de gerenciamento de agentes GPTs
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
  orderBy,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';

// VT: Flag para usar mocks (ler do .env)
const USE_MOCKS = import.meta.env.VITE_VT_MOCKS === 'true';

/**
 * VT: Estrutura de um agente GPT no Firestore
 * gptAgents/{agentId}
 * {
 *   name: string,
 *   description: string,
 *   icon: string (emoji),
 *   url: string (link do ChatGPT),
 *   active: boolean,
 *   order: number,
 *   createdAt: Timestamp,
 *   updatedAt: Timestamp
 * }
 */

/**
 * VT: Busca todos os agentes ativos
 * @returns {Promise<Array>} - Lista de agentes
 */
export const getActiveAgents = async () => {
  if (USE_MOCKS) {
    console.log('VT: [MOCK] Buscando agentes ativos');
    const agents = JSON.parse(localStorage.getItem('vt_gpt_agents') || '[]');
    return agents.filter(a => a.active);
  }

  try {
    const q = query(collection(db, 'gptAgents'), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    const agents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return agents.filter(a => a.active);
  } catch (error) {
    console.error('VT: Erro ao buscar agentes:', error);
    return [];
  }
};

/**
 * VT: Busca todos os agentes (admin)
 * @returns {Promise<Array>} - Lista de todos os agentes
 */
export const getAllAgents = async () => {
  if (USE_MOCKS) {
    console.log('VT: [MOCK] Buscando todos os agentes');
    return JSON.parse(localStorage.getItem('vt_gpt_agents') || '[]');
  }

  try {
    const q = query(collection(db, 'gptAgents'), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('VT: Erro ao buscar agentes:', error);
    return [];
  }
};

/**
 * VT: Cria um novo agente
 * @param {Object} data - { name, description, icon, url, active, order }
 * @returns {Promise<string>} - ID do agente criado
 */
export const createAgent = async (data) => {
  if (USE_MOCKS) {
    console.log('VT: [MOCK] Criando agente:', data);
    const mockId = `agent_${Date.now()}`;
    const agents = JSON.parse(localStorage.getItem('vt_gpt_agents') || '[]');
    agents.push({
      id: mockId,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    localStorage.setItem('vt_gpt_agents', JSON.stringify(agents));
    return mockId;
  }

  try {
    const agentRef = doc(collection(db, 'gptAgents'));
    const agentData = {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    await setDoc(agentRef, agentData);
    console.log('VT: Agente criado:', agentRef.id);
    return agentRef.id;
  } catch (error) {
    console.error('VT: Erro ao criar agente:', error);
    throw error;
  }
};

/**
 * VT: Atualiza um agente
 * @param {string} id - ID do agente
 * @param {Object} patch - Dados para atualizar
 */
export const updateAgent = async (id, patch) => {
  if (USE_MOCKS) {
    console.log('VT: [MOCK] Atualizando agente:', id, patch);
    const agents = JSON.parse(localStorage.getItem('vt_gpt_agents') || '[]');
    const index = agents.findIndex(a => a.id === id);
    if (index !== -1) {
      agents[index] = { ...agents[index], ...patch, updatedAt: new Date().toISOString() };
      localStorage.setItem('vt_gpt_agents', JSON.stringify(agents));
    }
    return;
  }

  try {
    const agentRef = doc(db, 'gptAgents', id);
    await updateDoc(agentRef, {
      ...patch,
      updatedAt: Timestamp.now()
    });
    console.log('VT: Agente atualizado:', id);
  } catch (error) {
    console.error('VT: Erro ao atualizar agente:', error);
    throw error;
  }
};

/**
 * VT: Exclui um agente
 * @param {string} id - ID do agente
 */
export const deleteAgent = async (id) => {
  if (USE_MOCKS) {
    console.log('VT: [MOCK] Excluindo agente:', id);
    const agents = JSON.parse(localStorage.getItem('vt_gpt_agents') || '[]');
    const filtered = agents.filter(a => a.id !== id);
    localStorage.setItem('vt_gpt_agents', JSON.stringify(filtered));
    return;
  }

  try {
    await deleteDoc(doc(db, 'gptAgents', id));
    console.log('VT: Agente excluído:', id);
  } catch (error) {
    console.error('VT: Erro ao excluir agente:', error);
    throw error;
  }
};

/**
 * VT: Listener em tempo real para agentes ativos
 * @param {Function} callback - Função chamada quando agentes mudam
 * @returns {Function} - Função para cancelar o listener
 */
export const subscribeToActiveAgents = (callback) => {
  if (USE_MOCKS) {
    console.log('VT: [MOCK] Listener de agentes iniciado');
    const interval = setInterval(() => {
      const agents = JSON.parse(localStorage.getItem('vt_gpt_agents') || '[]');
      callback(agents.filter(a => a.active));
    }, 2000);
    return () => clearInterval(interval);
  }

  const q = query(collection(db, 'gptAgents'), orderBy('order', 'asc'));
  
  return onSnapshot(q, (snapshot) => {
    const agents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(agents.filter(a => a.active));
  });
};

/**
 * VT: Inicializar agentes padrão (executar uma vez)
 */
export const initializeDefaultAgents = async () => {
  const defaultAgents = [
    {
      name: 'Coach Modelar',
      description: 'Especialista em modelagem de ofertas vencedoras',
      icon: '🎯',
      url: '',
      active: false,
      order: 1
    },
    {
      name: 'Analista de Ofertas',
      description: 'Analisa e otimiza suas ofertas para máximo resultado',
      icon: '📊',
      url: '',
      active: false,
      order: 2
    },
    {
      name: 'Andrômeda Power',
      description: 'IA poderosa para estratégias avançadas de marketing',
      icon: '⚡',
      url: '',
      active: false,
      order: 3
    },
    {
      name: 'Agente Dólar',
      description: 'Especialista em monetização e precificação estratégica',
      icon: '💰',
      url: '',
      active: false,
      order: 4
    }
  ];

  try {
    const existing = await getAllAgents();
    if (existing.length === 0) {
      console.log('VT: Inicializando agentes padrão...');
      for (const agent of defaultAgents) {
        await createAgent(agent);
      }
      console.log('VT: Agentes padrão criados!');
    }
  } catch (error) {
    console.error('VT: Erro ao inicializar agentes:', error);
  }
};
