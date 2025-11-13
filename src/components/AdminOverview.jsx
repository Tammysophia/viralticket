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
    {
      icon: Users,
      label: 'Total de Usuários',
      value: '0',
      change: '+0%',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Activity,
      label: 'Ofertas Geradas Hoje',
      value: '0',
      change: '+0%',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Key,
      label: 'APIs Ativas',
      value: '0',
      change: '0%',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: TrendingUp,
      label: 'Taxa de Conversão',
      value: '0%',
      change: '+0%',
      color: 'from-yellow-500 to-orange-500',
    },
  ]);
  const [planDistribution, setPlanDistribution] = useState([
    { plan: 'PRATA', percentage: 0, color: 'gray' },
    { plan: 'OURO', percentage: 0, color: 'yellow' },
    { plan: 'DIAMANTE', percentage: 0, color: 'cyan' },
    { plan: 'MENTORIA', percentage: 0, color: 'purple' },
  ]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [userGrowth, setUserGrowth] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRealData = async () => {
      if (!db) {
        console.warn('VT: Firebase indisponível, mantendo dados mockados');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const usersSnapshot = await getDocs(collection(db, 'users'));
        const totalUsers = usersSnapshot.size;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const offersSnapshot = await getDocs(collection(db, 'offers'));
        let offersToday = 0;
        offersSnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const offerDate = data.createdAt?.toDate?.() || new Date(data.createdAt);
          if (offerDate && offerDate >= today) {
            offersToday += 1;
          }
        });

        const apiKeysSnapshot = await getDocs(collection(db, 'apiKeys'));
        let activeAPIs = 0;
        apiKeysSnapshot.forEach((docSnap) => {
          if (docSnap.data().status === 'active') activeAPIs += 1;
        });

        const conversionRate =
          totalUsers > 0 ? Math.round((offersToday / totalUsers) * 100) : 0;

        const plans = { PRATA: 0, OURO: 0, DIAMANTE: 0, MENTORIA: 0 };
        usersSnapshot.forEach((docSnap) => {
          const plan = docSnap.data().plan || 'PRATA';
          if (plans[plan] !== undefined) {
            plans[plan] += 1;
          }
        });
        const totalPlans = Object.values(plans).reduce((a, b) => a + b, 0);
        setPlanDistribution([
          {
            plan: 'PRATA',
            percentage:
              totalPlans > 0 ? Math.round((plans.PRATA / totalPlans) * 100) : 0,
            color: 'gray',
          },
          {
            plan: 'OURO',
            percentage:
              totalPlans > 0 ? Math.round((plans.OURO / totalPlans) * 100) : 0,
            color: 'yellow',
          },
          {
            plan: 'DIAMANTE',
            percentage:
              totalPlans > 0 ? Math.round((plans.DIAMANTE / totalPlans) * 100) : 0,
            color: 'cyan',
          },
          {
            plan: 'MENTORIA',
            percentage:
              totalPlans > 0 ? Math.round((plans.MENTORIA / totalPlans) * 100) : 0,
            color: 'purple',
          },
        ]);

        const recentOffers = [];
        offersSnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          recentOffers.push({
            id: docSnap.id,
            userId: data.userId,
            createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
          });
        });
        recentOffers.sort((a, b) => b.createdAt - a.createdAt);

        const activities = [];
        for (let i = 0; i < Math.min(4, recentOffers.length); i += 1) {
          const offer = recentOffers[i];
          const userQuery = query(
            collection(db, 'users'),
            where('__name__', '==', offer.userId),
          );
          const userDoc = await getDocs(userQuery);
          if (!userDoc.empty) {
            const userData = userDoc.docs[0].data();
            const diffMinutes = Math.floor(
              (new Date().getTime() - offer.createdAt.getTime()) / 60000,
            );
            activities.push({
              user:
                userData.name ||
                userData.email?.split('@')[0] ||
                'Usuário',
              action: 'Gerou oferta',
              time:
                diffMinutes < 60
                  ? `há ${diffMinutes} min`
                  : `há ${Math.floor(diffMinutes / 60)}h`,
              plan: userData.plan || 'PRATA',
            });
          }
        }

        const growth = [0, 0, 0, 0, 0, 0, 0];
        usersSnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.createdAt) {
            const createdDate = new Date(data.createdAt);
            const diffDays = Math.floor(
              (today.getTime() - createdDate.getTime()) /
                (1000 * 60 * 60 * 24),
            );
            if (diffDays >= 0 && diffDays < 7) {
              growth[6 - diffDays] += 1;
            }
          }
        });
        const maxGrowth = Math.max(...growth, 1);
        const growthPercent = growth.map((value) =>
          Math.round((value / maxGrowth) * 100),
        );

        setStats([
          {
            icon: Users,
            label: 'Total de Usuários',
            value: totalUsers.toString(),
            change: '+0%',
            color: 'from-blue-500 to-cyan-500',
          },
          {
            icon: Activity,
            label: 'Ofertas Geradas Hoje',
            value: offersToday.toString(),
            change: '+0%',
            color: 'from-purple-500 to-pink-500',
          },
          {
            icon: Key,
            label: 'APIs Ativas',
            value: activeAPIs.toString(),
            change: '0%',
            color: 'from-green-500 to-emerald-500',
          },
          {
            icon: TrendingUp,
            label: 'Taxa de Conversão',
            value: `${conversionRate}%`,
            change: '+0%',
            color: 'from-yellow-500 to-orange-500',
          },
        ]);

        setRecentActivity(
          activities.length > 0
            ? activities
            : [
                {
                  user: 'Nenhuma',
                  action: 'atividade ainda',
                  time: '-',
                  plan: '-',
                },
              ],
        );
        setUserGrowth(growthPercent);
      } catch (error) {
        console.error('VT: Erro ao carregar dados reais:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRealData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Proteção adicional - não renderizar se não for admin
  if (!user?.isAdmin) {
    return (
      <Card>
        <p className="text-center text-gray-400">🎯 O sistema está em operação normal.</p>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
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
            {[65, 45, 75, 85, 60, 90, 95].map((height, i) => (
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
            {[
              { plan: 'PRATA', percentage: 30, color: 'gray' },
              { plan: 'OURO', percentage: 25, color: 'yellow' },
              { plan: 'DIAMANTE', percentage: 20, color: 'cyan' },
              { plan: 'MENTORIA', percentage: 25, color: 'purple' },
            ].map((item, i) => (
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
