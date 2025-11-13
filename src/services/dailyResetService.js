// VT: Serviço de Reset Automático de Uso Diário
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Verifica se precisa resetar o uso diário do usuário
 * Reseta automaticamente à meia-noite
 * @param {Object} user - Objeto do usuário
 * @returns {Promise<Object|null>} - Usuário atualizado ou null se não precisar resetar
 */
export const checkAndResetDailyUsage = async (user) => {
  if (!user || !user.id) {
    console.log('🔄 VT: Usuário inválido para reset');
    return null;
  }

  try {
    // Buscar dados atualizados do Firestore
    const userDocRef = doc(db, 'users', user.id);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.log('🔄 VT: Documento do usuário não encontrado');
      return null;
    }

    const userData = userDoc.data();
    const lastResetDate = userData.lastResetDate || null;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Meia-noite de hoje
    
    // Verificar se já resetou hoje
    let needsReset = false;
    
    if (!lastResetDate) {
      // Primeira vez - precisa resetar
      needsReset = true;
      console.log('🔄 VT: Primeira vez - resetando uso diário');
    } else {
      // Converter lastResetDate para Date
      const lastReset = new Date(lastResetDate);
      lastReset.setHours(0, 0, 0, 0);
      
      // Se lastReset é anterior a hoje, precisa resetar
      if (lastReset < today) {
        needsReset = true;
        console.log('🔄 VT: Novo dia detectado - resetando uso diário');
        console.log('🔄 VT: Último reset:', lastReset.toISOString());
        console.log('🔄 VT: Hoje:', today.toISOString());
      }
    }

    if (needsReset) {
      // Resetar uso diário
      const updatedData = {
        dailyUsage: {
          offers: 0,
          urls: 0
        },
        lastResetDate: today.toISOString()
      };

      await updateDoc(userDocRef, updatedData);
      
      console.log('✅ VT: Uso diário resetado com sucesso!');
      console.log('✅ VT: Ofertas: 0, URLs: 0');
      console.log('✅ VT: Data do reset:', today.toISOString());

      // Retornar usuário atualizado
      return {
        ...user,
        dailyUsage: {
          offers: 0,
          urls: 0
        },
        lastResetDate: today.toISOString()
      };
    }

    console.log('ℹ️ VT: Uso diário já está atualizado para hoje');
    return null; // Não precisa atualizar
  } catch (error) {
    console.error('❌ VT: Erro ao verificar/resetar uso diário:', error);
    return null;
  }
};

/**
 * Verifica e reseta uso mensal (a cada mudança de mês)
 * @param {Object} user - Objeto do usuário
 * @returns {Promise<Object|null>} - Usuário atualizado ou null se não precisar resetar
 */
export const checkAndResetMonthlyUsage = async (user) => {
  if (!user || !user.id) {
    return null;
  }

  try {
    const userDocRef = doc(db, 'users', user.id);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      return null;
    }

    const userData = userDoc.data();
    const currentMonth = new Date().getMonth();
    const lastMonth = userData.monthlyUsage?.month;

    if (lastMonth === undefined || lastMonth !== currentMonth) {
      // Mudou de mês - resetar uso mensal
      const updatedData = {
        monthlyUsage: {
          offers: 0,
          urls: 0,
          month: currentMonth
        }
      };

      await updateDoc(userDocRef, updatedData);
      
      console.log('✅ VT: Uso mensal resetado com sucesso!');
      console.log('✅ VT: Mês atual:', currentMonth);

      return {
        ...user,
        monthlyUsage: {
          offers: 0,
          urls: 0,
          month: currentMonth
        }
      };
    }

    return null; // Não precisa atualizar
  } catch (error) {
    console.error('❌ VT: Erro ao verificar/resetar uso mensal:', error);
    return null;
  }
};

/**
 * Verifica e reseta uso diário e mensal
 * Deve ser chamado sempre que o usuário faz login ou carrega a aplicação
 * @param {Object} user - Objeto do usuário
 * @returns {Promise<Object>} - Usuário atualizado
 */
export const checkAndResetUsage = async (user) => {
  if (!user || !user.id) {
    return user;
  }

  try {
    // Verificar e resetar uso diário
    const dailyUpdated = await checkAndResetDailyUsage(user);
    
    // Verificar e resetar uso mensal
    const monthlyUpdated = await checkAndResetMonthlyUsage(dailyUpdated || user);
    
    // Retornar usuário atualizado (se houver atualizações)
    return monthlyUpdated || dailyUpdated || user;
  } catch (error) {
    console.error('❌ VT: Erro ao verificar/resetar uso:', error);
    return user;
  }
};
