import { TrendingUp, Users, Key, Activity } from 'lucide-react';
import Card from './Card';
import { motion } from 'framer-motion';

const AdminOverview = () => {
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
      color: 'from-primary-purple to-primary-lilac',
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

  const recentActivity = [
    { user: 'João Silva', action: 'Gerou oferta', time: 'há 5 min', plan: 'OURO' },
    { user: 'Maria Santos', action: 'Novo cadastro', time: 'há 12 min', plan: 'FREE' },
    { user: 'Pedro Costa', action: 'Upgrade para PRATA', time: 'há 23 min', plan: 'PRATA' },
    { user: 'Ana Lima', action: 'Extraiu comentários', time: 'há 35 min', plan: 'BRONZE' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} hover={false}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-zinc-400 mb-1">{stat.label}</p>
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
                className="flex-1 bg-gradient-to-t from-primary-purple to-primary-lilac rounded-t-lg"
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
              { plan: 'OURO', percentage: 10, color: 'gold-500' },
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
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center font-bold"
                  {activity.user[0]}
                </div>
                <div>
                  <p className="font-semibold">{activity.user}</p>
                  <p className="text-sm text-zinc-400">{activity.action}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-500">{activity.time}</p>
                <p className="text-xs font-semibold text-primary-lilac">{activity.plan}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AdminOverview;
