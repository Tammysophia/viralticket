import { useState, useEffect } from 'react';
import { TrendingUp, Users, Key, Activity } from 'lucide-react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import Card from './Card';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

const AdminOverview = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    offersToday: 0,
    activeAPIs: 0,
    conversionRate: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [planDistribution, setPlanDistribution] = useState({});

  // Proteção adicional - não renderizar se não for admin
  if (!user?.isAdmin) {
    return (
      <Card>
        <p className="text-center text-gray-400">🎯 O sistema está em operação normal.</p>
      </Card>
    );
  }

  // ✅ VT: Buscar dados reais do Firestore
  useEffect(() => {
    loadRealData();
  }, []);

  const loadRealData = async () => {
    setLoading(true);
    try {
      // 1. Total de usuários
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      const totalUsers = usersSnapshot.size;

      // 2. Contabilizar distribuição de planos
      const plans = { FREE: 0, BRONZE: 0, PRATA: 0, OURO: 0, ADMIN: 0 };
      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        const plan = userData.plan || 'FREE';
        if (plans[plan] !== undefined) {
          plans[plan]++;
        }
      });

      // 3. Ofertas geradas hoje
      const offersRef = collection(db, 'offers');
      const offersSnapshot = await getDocs(offersRef);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let offersToday = 0;
      offersSnapshot.forEach((doc) => {
        const offerData = doc.data();
        if (offerData.createdAt) {
          const createdDate = offerData.createdAt.toDate ? offerData.createdAt.toDate() : new Date(offerData.createdAt);
          if (createdDate >= today) {
            offersToday++;
          }
        }
      });

      // 4. APIs ativas (localStorage)
      const savedKeys = localStorage.getItem('viralticket_api_keys');
      let activeAPIs = 0;
      if (savedKeys) {
        const keys = JSON.parse(savedKeys);
        activeAPIs = keys.filter(k => k.status === 'active').length;
      }

      // 5. Taxa de conversão (exemplo: ofertas/usuários * 100)
      const conversionRate = totalUsers > 0 ? ((offersSnapshot.size / totalUsers) * 100).toFixed(1) : 0;

      // 6. Atividades recentes (últimas 5 ofertas criadas)
      const recentOffers = [];
      offersSnapshot.forEach((doc) => {
        const offerData = doc.data();
        if (offerData.userId && offerData.createdAt) {
          recentOffers.push({
            id: doc.id,
            userId: offerData.userId,
            title: offerData.title || 'Sem título',
            createdAt: offerData.createdAt.toDate ? offerData.createdAt.toDate() : new Date(offerData.createdAt),
          });
        }
      });
      
      // Ordenar por data e pegar as 5 mais recentes
      recentOffers.sort((a, b) => b.createdAt - a.createdAt);
      const top5 = recentOffers.slice(0, 5);

      // Buscar nomes dos usuários
      const activities = [];
      for (const offer of top5) {
        const userDoc = await getDocs(query(collection(db, 'users'), where('__name__', '==', offer.userId), limit(1)));
        let userName = 'Usuário';
        let userPlan = 'FREE';
        
        if (!userDoc.empty) {
          const userData = userDoc.docs[0].data();
          userName = userData.name || userData.email?.split('@')[0] || 'Usuário';
          userPlan = userData.plan || 'FREE';
        }

        const timeAgo = getTimeAgo(offer.createdAt);
        activities.push({
          user: userName,
          action: 'Gerou oferta',
          time: timeAgo,
          plan: userPlan,
        });
      }

      // Atualizar estados
      setStats({
        totalUsers,
        offersToday,
        activeAPIs,
        conversionRate,
      });

      setPlanDistribution(plans);
      setRecentActivity(activities);

      console.log('✅ VT: Dados reais carregados:', { totalUsers, offersToday, activeAPIs, plans, activities });
    } catch (error) {
      console.error('❌ VT: Erro ao carregar dados reais:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'agora';
    if (diffMins < 60) return `há ${diffMins} min`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `há ${diffHours}h`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `há ${diffDays}d`;
  };

  const statsData = [
    {
      icon: Users,
      label: 'Total de Usuários',
      value: loading ? '...' : stats.totalUsers.toLocaleString(),
      change: '+0%',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Activity,
      label: 'Ofertas Geradas Hoje',
      value: loading ? '...' : stats.offersToday.toString(),
      change: '+0%',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Key,
      label: 'APIs Ativas',
      value: loading ? '...' : stats.activeAPIs.toString(),
      change: '0%',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: TrendingUp,
      label: 'Taxa de Conversão',
      value: loading ? '...' : `${stats.conversionRate}%`,
      change: '+0%',
      color: 'from-yellow-500 to-orange-500',
    },
  ];

  // Calcular percentuais de distribuição
  const totalForPlans = Object.values(planDistribution).reduce((acc, val) => acc + val, 0);
  const planPercentages = totalForPlans > 0 ? {
    FREE: Math.round((planDistribution.FREE / totalForPlans) * 100),
    BRONZE: Math.round((planDistribution.BRONZE / totalForPlans) * 100),
    PRATA: Math.round((planDistribution.PRATA / totalForPlans) * 100),
    OURO: Math.round((planDistribution.OURO / totalForPlans) * 100),
  } : { FREE: 0, BRONZE: 0, PRATA: 0, OURO: 0 };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <Card key={index} hover={false}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-green-400 mt-1">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-xl font-bold mb-4">Crescimento de Usuários</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <p>Gráfico em desenvolvimento</p>
          </div>
        </Card>

        <Card>
          <h3 className="text-xl font-bold mb-4">Distribuição de Planos</h3>
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { plan: 'FREE', percentage: planPercentages.FREE, color: 'gray', count: planDistribution.FREE },
                { plan: 'BRONZE', percentage: planPercentages.BRONZE, color: 'orange', count: planDistribution.BRONZE },
                { plan: 'PRATA', percentage: planPercentages.PRATA, color: 'gray', count: planDistribution.PRATA },
                { plan: 'OURO', percentage: planPercentages.OURO, color: 'yellow', count: planDistribution.OURO },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>{item.plan} ({item.count})</span>
                    <span>{item.percentage}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ delay: i * 0.1 }}
                      className={`h-full bg-${item.color}-500`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <h3 className="text-xl font-bold mb-4">Atividades Recentes</h3>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : recentActivity.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>Nenhuma atividade recente</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((activity, i) => (
              <div key={i} className="flex items-center justify-between glass border border-white/5 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center font-bold">
                    {activity.user[0]}
                  </div>
                  <div>
                    <p className="font-semibold">{activity.user}</p>
                    <p className="text-sm text-gray-400">{activity.action}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{activity.time}</p>
                  <p className="text-xs font-semibold text-purple-400">{activity.plan}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminOverview;
