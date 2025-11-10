// VT: Serviço de MONITORAMENTO DE MODELAGEM (separado das ofertas)
import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';

/**
 * VT: Estrutura de Monitoramento (collection separada)
 * monitoring/{monitoringId}
 * {
 *   userId: string,
 *   offerId: string,
 *   offerTitle: string,
 *   startDate: Timestamp,
 *   endDate: Timestamp (7 dias depois),
 *   creativesAdded: number,
 *   status: 'monitorando' | 'modelada' | 'nao_modelada',
 *   checkpoints: [{ date, creativesCount }],
 *   lastCheck: Timestamp
 * }
 */

/**
 * Inicia monitoramento de 7 dias para uma oferta
 * @param {string} userId - ID do usuário
 * @param {string} offerId - ID da oferta
 * @param {string} offerTitle - Título da oferta
 * @returns {Promise<string>} - ID do monitoramento
 */
export const startMonitoring = async (userId, offerId, offerTitle) => {
  try {
    const monitoringRef = doc(collection(db, 'monitoring'));
    const now = new Date();
    const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 dias
    
    const monitoringData = {
      userId,
      offerId,
      offerTitle,
      startDate: Timestamp.fromDate(now),
      endDate: Timestamp.fromDate(endDate),
      creativesAdded: 0,
      status: 'monitorando',
      checkpoints: [],
      lastCheck: Timestamp.now(),
      createdAt: Timestamp.now()
    };
    
    await setDoc(monitoringRef, monitoringData);
    console.log('✅ VT: Monitoramento iniciado:', monitoringRef.id);
    return monitoringRef.id;
  } catch (error) {
    console.error('❌ VT: Erro ao iniciar monitoramento:', error);
    throw error;
  }
};

/**
 * Atualiza checkpoint do monitoramento
 * @param {string} monitoringId - ID do monitoramento
 * @param {number} creativesCount - Quantidade atual de criativos
 */
export const updateMonitoringCheckpoint = async (monitoringId, creativesCount) => {
  try {
    const monitoringRef = doc(db, 'monitoring', monitoringId);
    
    await updateDoc(monitoringRef, {
      creativesAdded: creativesCount,
      checkpoints: [...checkpoints, {
        date: Timestamp.now(),
        count: creativesCount
      }],
      lastCheck: Timestamp.now()
    });
    
    console.log('📊 VT: Checkpoint atualizado:', monitoringId, creativesCount);
  } catch (error) {
    console.error('❌ VT: Erro ao atualizar checkpoint:', error);
  }
};

/**
 * Verifica monitoramentos e atualiza status automaticamente
 * @param {string} userId - ID do usuário
 */
export const checkMonitoringStatus = async (userId) => {
  try {
    const q = query(
      collection(db, 'monitoring'),
      where('userId', '==', userId),
      where('status', '==', 'monitorando')
    );
    
    const snapshot = await getDocs(q);
    
    snapshot.docs.forEach(async (docSnapshot) => {
      const data = docSnapshot.data();
      const now = new Date();
      const endDate = data.endDate.toDate();
      
      // Verificar se passou 7 dias
      if (now >= endDate) {
        const finalStatus = data.creativesAdded >= 1 ? 'modelada' : 'nao_modelada';
        
        await updateDoc(doc(db, 'monitoring', docSnapshot.id), {
          status: finalStatus,
          lastCheck: Timestamp.now()
        });
        
        console.log(`🏁 VT: Monitoramento finalizado: ${docSnapshot.id} → ${finalStatus}`);
      }
    });
  } catch (error) {
    console.error('❌ VT: Erro ao verificar monitoramentos:', error);
  }
};

/**
 * Listener em tempo real para monitoramentos do usuário
 * @param {string} userId - ID do usuário
 * @param {Function} callback - Função chamada quando monitoramentos mudam
 * @returns {Function} - Função para cancelar o listener
 */
export const subscribeToMonitoring = (userId, callback) => {
  const q = query(
    collection(db, 'monitoring'),
    where('userId', '==', userId)
  );
  
  return onSnapshot(q, (snapshot) => {
    const monitorings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate?.toDate(),
      endDate: doc.data().endDate?.toDate(),
      lastCheck: doc.data().lastCheck?.toDate()
    }));
    callback(monitorings);
  });
};

/**
 * Busca todos os monitoramentos do usuário
 * @param {string} userId - ID do usuário
 * @returns {Promise<Array>} - Lista de monitoramentos
 */
export const getUserMonitoring = async (userId) => {
  try {
    const q = query(
      collection(db, 'monitoring'),
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate?.toDate(),
      endDate: doc.data().endDate?.toDate()
    }));
  } catch (error) {
    console.error('❌ VT: Erro ao buscar monitoramentos:', error);
    return [];
  }
};
