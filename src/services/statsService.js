// Serviço para estatísticas do painel Admin
import { db } from '../config/firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

/**
 * Busca estatísticas reais do sistema
 */
export const getSystemStats = async () => {
  try {
    if (!db) {
      console.warn('⚠️ Firebase não configurado, retornando dados zerados');
      return {
        totalUsers: 0,
        offersToday: 0,
        activeAPIs: 0,
        conversionRate: 0
      };
    }

    // Buscar total de usuários
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const totalUsers = usersSnapshot.size;

    // Buscar ofertas geradas hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const offersQuery = query(
      collection(db, 'offers'),
      where('createdAt', '>=', today.toISOString())
    );
    const offersSnapshot = await getDocs(offersQuery);
    const offersToday = offersSnapshot.size;

    // Buscar APIs ativas
    const apiKeysSnapshot = await getDocs(collection(db, 'apiKeys'));
    let activeAPIs = 0;
    apiKeysSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.status === 'active') {
        activeAPIs++;
      }
    });

    // Calcular taxa de conversão (ofertas / usuários * 100)
    const conversionRate = totalUsers > 0 ? Math.round((offersToday / totalUsers) * 100) : 0;

    return {
      totalUsers,
      offersToday,
      activeAPIs,
      conversionRate
    };
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error);
    return {
      totalUsers: 0,
      offersToday: 0,
      activeAPIs: 0,
      conversionRate: 0
    };
  }
};

/**
 * Busca distribuição de planos dos usuários
 */
export const getPlanDistribution = async () => {
  try {
    if (!db) {
      return { FREE: 0, BRONZE: 0, PRATA: 0, OURO: 0 };
    }

    const usersSnapshot = await getDocs(collection(db, 'users'));
    const distribution = { FREE: 0, BRONZE: 0, PRATA: 0, OURO: 0 };

    usersSnapshot.forEach(doc => {
      const data = doc.data();
      const plan = data.plan || 'FREE';
      if (distribution.hasOwnProperty(plan)) {
        distribution[plan]++;
      }
    });

    return distribution;
  } catch (error) {
    console.error('❌ Erro ao buscar distribuição de planos:', error);
    return { FREE: 0, BRONZE: 0, PRATA: 0, OURO: 0 };
  }
};

/**
 * Busca atividades recentes dos usuários
 */
export const getRecentActivities = async () => {
  try {
    if (!db) {
      return [];
    }

    // Buscar ofertas recentes (últimas 10)
    const offersQuery = query(
      collection(db, 'offers'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    
    const offersSnapshot = await getDocs(offersQuery);
    const activities = [];

    for (const offerDoc of offersSnapshot.docs) {
      const offer = offerDoc.data();
      
      // Buscar dados do usuário
      const userDoc = await getDocs(query(
        collection(db, 'users'),
        where('__name__', '==', offer.userId),
        limit(1)
      ));

      if (!userDoc.empty) {
        const userData = userDoc.docs[0].data();
        const createdAt = new Date(offer.createdAt);
        const now = new Date();
        const diffMinutes = Math.floor((now - createdAt) / (1000 * 60));
        
        let timeAgo = '';
        if (diffMinutes < 60) {
          timeAgo = `há ${diffMinutes} min`;
        } else if (diffMinutes < 1440) {
          const hours = Math.floor(diffMinutes / 60);
          timeAgo = `há ${hours}h`;
        } else {
          const days = Math.floor(diffMinutes / 1440);
          timeAgo = `há ${days}d`;
        }

        activities.push({
          user: userData.name || userData.email.split('@')[0],
          action: 'Gerou oferta',
          time: timeAgo,
          plan: userData.plan || 'FREE'
        });
      }
    }

    return activities.length > 0 ? activities : [];
  } catch (error) {
    console.error('❌ Erro ao buscar atividades recentes:', error);
    return [];
  }
};

/**
 * Busca crescimento de usuários nos últimos 7 dias
 */
export const getUserGrowth = async () => {
  try {
    if (!db) {
      return [0, 0, 0, 0, 0, 0, 0];
    }

    const usersSnapshot = await getDocs(collection(db, 'users'));
    const growth = [0, 0, 0, 0, 0, 0, 0]; // Últimos 7 dias
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    usersSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.createdAt) {
        const createdDate = new Date(data.createdAt);
        const diffDays = Math.floor((today - createdDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays >= 0 && diffDays < 7) {
          growth[6 - diffDays]++;
        }
      }
    });

    // Normalizar para percentuais (0-100)
    const maxValue = Math.max(...growth, 1);
    return growth.map(value => Math.round((value / maxValue) * 100));
  } catch (error) {
    console.error('❌ Erro ao buscar crescimento:', error);
    return [0, 0, 0, 0, 0, 0, 0];
  }
};
