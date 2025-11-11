import { useState, useEffect } from 'react';
import { TrendingUp, Users, Key, Activity } from 'lucide-react';
import Card from './Card';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { getSystemStats, getPlanDistribution, getRecentActivities, getUserGrowth } from '../services/statsService';

const AdminOverview = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState([]);
  const [planDistribution, setPlanDistribution] = useState({ FREE: 0, BRONZE: 0, PRATA: 0, OURO: 0 });
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Buscar estatísticas reais
        const systemStats = await getSystemStats();
        
        setStats([
          {
            icon: Users,
            label: t('totalUsers'),
            value: systemStats.totalUsers.toString(),
            change: '+0%',
            color: 'from-blue-500 to-cyan-500',
          },
          {
            icon: Activity,
            label: t('offersToday'),
            value: systemStats.offersToday.toString(),
            change: '+0%',
            color: 'from-purple-500 to-pink-500',
          },
          {
            icon: Key,
            label: t('activeAPIs'),
            value: systemStats.activeAPIs.toString(),
            change: '0%',
            color: 'from-green-500 to-emerald-500',
          },
          {
            icon: TrendingUp,
            label: t('conversionRate'),
            value: `${systemStats.conversionRate}%`,
            change: '+0%',
            color: 'from-yellow-500 to-orange-500',
          },
        ]);

        // Buscar distribuição de planos
        const plans = await getPlanDistribution();
        setPlanDistribution(plans);

        // Buscar atividades recentes
        const activities = await getRecentActivities();
        setRecentActivity(activities.length > 0 ? activities : [
          { user: 'Nenhuma', action: 'atividade recente', time: '-', plan: '-' }
        ]);

        // Buscar crescimento de usuários
        const growth = await getUserGrowth();
        setUserGrowth(growth);
      } catch (error) {
        console.error('❌ Erro ao carregar dados do painel:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">{t('loadingRealData')}</p>
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
          <h3 className="text-xl font-bold mb-4">{t('userGrowth')}</h3>
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
          <h3 className="text-xl font-bold mb-4">{t('planDistribution')}</h3>
          <div className="space-y-3">
            {(() => {
              const total = Object.values(planDistribution).reduce((a, b) => a + b, 0);
              return [
                { plan: 'FREE', count: planDistribution.FREE, percentage: total > 0 ? Math.round((planDistribution.FREE / total) * 100) : 0, color: 'gray' },
                { plan: 'BRONZE', count: planDistribution.BRONZE, percentage: total > 0 ? Math.round((planDistribution.BRONZE / total) * 100) : 0, color: 'orange' },
                { plan: 'PRATA', count: planDistribution.PRATA, percentage: total > 0 ? Math.round((planDistribution.PRATA / total) * 100) : 0, color: 'gray' },
                { plan: 'OURO', count: planDistribution.OURO, percentage: total > 0 ? Math.round((planDistribution.OURO / total) * 100) : 0, color: 'yellow' },
              ];
            })().map((item, i) => (
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
        <h3 className="text-xl font-bold mb-4">{t('recentActivities')}</h3>
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
