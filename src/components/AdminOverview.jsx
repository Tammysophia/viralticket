import { TrendingUp, Users, Key, Activity } from 'lucide-react';
import Card from './Card';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

const AdminOverview = () => {
  const { user } = useAuth();

  // Proteção adicional - não renderizar se não for admin
  if (!user?.isAdmin) {
    return (
      <Card>
        <p className="text-center text-gray-400">🎯 O sistema está em operação normal.</p>
      </Card>
    );
  }
  const stats = [
    {
      icon: Users,
      label: 'Total de Usuários',
      value: '1,234',
      change: '+12%',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Activity,
      label: 'Ofertas Geradas Hoje',
      value: '567',
      change: '+8%',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Key,
      label: 'APIs Ativas',
      value: '8',
      change: '0%',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: TrendingUp,
      label: 'Taxa de Conversão',
      value: '23%',
      change: '+5%',
      color: 'from-yellow-500 to-orange-500',
    },
  ];

  // VT: Atividades recentes virão do Firestore em tempo real
  const recentActivity = [];

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
              { plan: 'FREE', percentage: 45, color: 'gray' },
              { plan: 'BRONZE', percentage: 25, color: 'orange' },
              { plan: 'PRATA', percentage: 20, color: 'gray' },
              { plan: 'OURO', percentage: 10, color: 'yellow' },
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
        <div className="text-center py-12 text-gray-400">
          <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>As atividades dos usuários reais aparecerão aqui.</p>
          <p className="text-sm mt-2">Sistema em operação normal.</p>
        </div>
      </Card>
    </div>
  );
};

export default AdminOverview;
