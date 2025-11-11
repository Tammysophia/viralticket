import { useState, useEffect } from 'react';
import { TrendingUp, Users, Key, Activity } from 'lucide-react';
import Card from './Card';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

const AdminOverview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState([
    { icon: Users, label: 'Total de Usuários', value: '0', change: '+0%', color: 'from-blue-500 to-cyan-500' },
    { icon: Activity, label: 'Ofertas Geradas Hoje', value: '0', change: '+0%', color: 'from-purple-500 to-pink-500' },
    { icon: Key, label: 'APIs Ativas', value: '0', change: '0%', color: 'from-green-500 to-emerald-500' },
    { icon: TrendingUp, label: 'Taxa de Conversão', value: '0%', change: '+0%', color: 'from-yellow-500 to-orange-500' },
  ]);
  const [planDistribution, setPlanDistribution] = useState([
    { plan: 'FREE', percentage: 0, color: 'gray' },
    { plan: 'BRONZE', percentage: 0, color: 'orange' },
    { plan: 'PRATA', percentage: 0, color: 'gray' },
    { plan: 'OURO', percentage: 0, color: 'yellow' },
  ]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [userGrowth, setUserGrowth] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [loading, setLoading] = useState(true);

  // Proteção adicional - não renderizar se não for admin
  if (!user?.isAdmin) {
    return (
      <Card>
        <p className="text-center text-gray-400">🎯 O sistema está em operação normal.</p>
      </Card>
    );
  }

  // ✅ VT: Buscar dados REAIS do Firestore
  useEffect(() => {
    const fetchRealData = async () => {
      try {
        setLoading(true);

        // 1. Total de usuários REAL
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const totalUsers = usersSnapshot.size;

        // 2. Ofertas geradas hoje REAL
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const offersSnapshot = await getDocs(collection(db, 'offers'));
        let offersToday = 0;
        offersSnapshot.forEach(doc => {
          const data = doc.data();
          const offerDate = data.createdAt?.toDate?.() || new Date(data.createdAt);
          if (offerDate >= today) offersToday++;
        });

        // 3. APIs ativas REAL
        const apiKeysSnapshot = await getDocs(collection(db, 'apiKeys'));
        let activeAPIs = 0;
        apiKeysSnapshot.forEach(doc => {
          if (doc.data().status === 'active') activeAPIs++;
        });

        // 4. Taxa de conversão REAL (ofertas/usuários)
        const conversionRate = totalUsers > 0 ? Math.round((offersToday / totalUsers) * 100) : 0;

        // 5. Distribuição de planos REAL
        const plans = { FREE: 0, BRONZE: 0, PRATA: 0, OURO: 0 };
        usersSnapshot.forEach(doc => {
          const plan = doc.data().plan || 'FREE';
          if (plans.hasOwnProperty(plan)) plans[plan]++;
        });
        const totalPlans = Object.values(plans).reduce((a, b) => a + b, 0);
        const planPercentages = [
          { plan: 'FREE', percentage: totalPlans > 0 ? Math.round((plans.FREE / totalPlans) * 100) : 0, color: 'gray' },
          { plan: 'BRONZE', percentage: totalPlans > 0 ? Math.round((plans.BRONZE / totalPlans) * 100) : 0, color: 'orange' },
          { plan: 'PRATA', percentage: totalPlans > 0 ? Math.round((plans.PRATA / totalPlans) * 100) : 0, color: 'gray' },
          { plan: 'OURO', percentage: totalPlans > 0 ? Math.round((plans.OURO / totalPlans) * 100) : 0, color: 'yellow' },
        ];

        // 6. Atividades recentes REAL (últimas 4 ofertas)
        const recentOffers = [];
        offersSnapshot.forEach(doc => {
          const data = doc.data();
          recentOffers.push({
            id: doc.id,
            userId: data.userId,
            createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
          });
        });
        recentOffers.sort((a, b) => b.createdAt - a.createdAt);
        
        const activities = [];
        for (let i = 0; i < Math.min(4, recentOffers.length); i++) {
          const offer = recentOffers[i];
          const userDoc = await getDocs(query(collection(db, 'users'), where('__name__', '==', offer.userId)));
          if (!userDoc.empty) {
            const userData = userDoc.docs[0].data();
            const diffMin = Math.floor((new Date() - offer.createdAt) / 60000);
            activities.push({
              user: userData.name || userData.email?.split('@')[0] || 'Usuário',
              action: 'Gerou oferta',
              time: diffMin < 60 ? `há ${diffMin} min` : `há ${Math.floor(diffMin/60)}h`,
              plan: userData.plan || 'FREE',
            });
          }
        }

        // 7. Crescimento de usuários REAL (últimos 7 dias)
        const growth = [0, 0, 0, 0, 0, 0, 0];
        usersSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.createdAt) {
            const createdDate = new Date(data.createdAt);
            const diffDays = Math.floor((today - createdDate) / (1000 * 60 * 60 * 24));
            if (diffDays >= 0 && diffDays < 7) growth[6 - diffDays]++;
          }
        });
        const maxGrowth = Math.max(...growth, 1);
        const growthPercent = growth.map(v => Math.round((v / maxGrowth) * 100));

        // ✅ Atualizar estado com dados REAIS
        setStats([
          { icon: Users, label: 'Total de Usuários', value: totalUsers.toString(), change: '+0%', color: 'from-blue-500 to-cyan-500' },
          { icon: Activity, label: 'Ofertas Geradas Hoje', value: offersToday.toString(), change: '+0%', color: 'from-purple-500 to-pink-500' },
          { icon: Key, label: 'APIs Ativas', value: activeAPIs.toString(), change: '0%', color: 'from-green-500 to-emerald-500' },
          { icon: TrendingUp, label: 'Taxa de Conversão', value: `${conversionRate}%`, change: '+0%', color: 'from-yellow-500 to-orange-500' },
        ]);
        setPlanDistribution(planPercentages);
        setRecentActivity(activities.length > 0 ? activities : [{ user: 'Nenhuma', action: 'atividade ainda', time: '-', plan: '-' }]);
        setUserGrowth(growthPercent);

        console.log('✅ VT: Dados reais carregados do Firestore');
      } catch (error) {
        console.error('❌ VT: Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRealData();
  }, []);

  if (loading) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando dados reais...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
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

      {/* Charts Mock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-xl font-bold mb-4">Crescimento de Usuários</h3>
          <div className="h-64 flex items-end justify-around gap-2">
            {userGrowth.map((height, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: i * 0.1 }}
                className="flex-1 bg-gradient-to-t from-purple-600 to-pink-600 rounded-t-lg"
              />
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-xl font-bold mb-4">Distribuição de Planos</h3>
          <div className="space-y-3">
            {planDistribution.map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>{item.plan}</span>
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
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <h3 className="text-xl font-bold mb-4">Atividades Recentes</h3>
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
      </Card>
    </div>
  );
};

export default AdminOverview;
