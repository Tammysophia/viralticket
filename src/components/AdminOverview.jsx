import { TrendingUp, Users, Key, Activity, DollarSign, Zap, Globe, Clock } from 'lucide-react';
import Card from './Card';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const AdminOverview = () => {
  const [stats, setStats] = useState([
    {
      icon: Users,
      label: 'Total de Usuários',
      value: '1,234',
      change: '+12%',
      changeValue: 132,
      color: 'from-blue-500 to-cyan-500',
      trend: 'up',
    },
    {
      icon: Activity,
      label: 'Ofertas Geradas Hoje',
      value: '567',
      change: '+8%',
      changeValue: 42,
      color: 'from-purple-500 to-pink-500',
      trend: 'up',
    },
    {
      icon: Key,
      label: 'APIs Ativas',
      value: '8',
      change: '0%',
      changeValue: 0,
      color: 'from-green-500 to-emerald-500',
      trend: 'stable',
    },
    {
      icon: DollarSign,
      label: 'Receita Mensal',
      value: 'R$ 15.2k',
      change: '+15%',
      changeValue: 1980,
      color: 'from-yellow-500 to-orange-500',
      trend: 'up',
    },
  ]);

  const extraStats = [
    {
      icon: Zap,
      label: 'Plano mais Popular',
      value: 'OURO',
      badge: '🥇',
    },
    {
      icon: Globe,
      label: 'Integrações Ativas',
      value: '4/6',
      badge: '🔌',
    },
    {
      icon: Clock,
      label: 'Uptime Sistema',
      value: '99.9%',
      badge: '✅',
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
      {/* Stats Grid Principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card hover={false} className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16" />
              
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    stat.trend === 'up' ? 'bg-green-500/20 text-green-400' :
                    stat.trend === 'down' ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                
                <p className="text-sm text-gray-400 mb-2">{stat.label}</p>
                <div className="flex items-end gap-2">
                  <p className="text-3xl font-bold">{stat.value}</p>
                  {stat.changeValue > 0 && (
                    <span className="text-sm text-green-400 mb-1">+{stat.changeValue}</span>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Stats Secundários */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {extraStats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
          >
            <Card hover={false} className="glass border-purple-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <stat.icon className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{stat.label}</p>
                    <p className="text-lg font-bold">{stat.value}</p>
                  </div>
                </div>
                <span className="text-2xl">{stat.badge}</span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts e Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Gráfico de Crescimento */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full -mr-20 -mt-20" />
          
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Crescimento de Usuários</h3>
              <span className="text-sm text-gray-400">Últimos 7 dias</span>
            </div>
            
            <div className="h-64 flex items-end justify-around gap-2 px-2">
              {[
                { value: 65, label: 'Seg' },
                { value: 45, label: 'Ter' },
                { value: 75, label: 'Qua' },
                { value: 85, label: 'Qui' },
                { value: 60, label: 'Sex' },
                { value: 90, label: 'Sáb' },
                { value: 95, label: 'Dom' },
              ].map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${day.value}%` }}
                    transition={{ delay: 0.8 + i * 0.1, type: "spring" }}
                    className="w-full bg-gradient-to-t from-purple-600 via-purple-500 to-pink-500 rounded-t-lg hover:from-purple-500 hover:to-pink-400 transition-all cursor-pointer relative group"
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {Math.floor(day.value * 15)} usuários
                    </div>
                  </motion.div>
                  <span className="text-xs text-gray-400">{day.label}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-sm">
              <span className="text-gray-400">Total esta semana</span>
              <span className="font-bold text-green-400">+789 usuários</span>
            </div>
          </div>
        </Card>

        {/* Distribuição de Planos */}
        <Card>
          <h3 className="text-xl font-bold mb-4">Distribuição de Planos</h3>
          
          <div className="space-y-4">
            {[
              { plan: 'FREE', percentage: 45, users: 555, color: 'from-gray-500 to-gray-600', icon: '🆓' },
              { plan: 'BRONZE', percentage: 25, users: 308, color: 'from-orange-500 to-orange-600', icon: '🥉' },
              { plan: 'PRATA', percentage: 20, users: 247, color: 'from-gray-400 to-gray-500', icon: '🥈' },
              { plan: 'OURO', percentage: 10, users: 124, color: 'from-yellow-500 to-yellow-600', icon: '🥇' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + i * 0.1 }}
              >
                <div className="flex items-center justify-between text-sm mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-semibold">{item.plan}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400">{item.users} usuários</span>
                    <span className="font-bold">{item.percentage}%</span>
                  </div>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ delay: 1.2 + i * 0.1, duration: 0.8 }}
                    className={`h-full bg-gradient-to-r ${item.color} relative`}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-purple-400">R$ 15.2k</p>
                <p className="text-xs text-gray-400">Receita/mês</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">+15%</p>
                <p className="text-xs text-gray-400">vs mês anterior</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Atividades Recentes</h3>
          <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
            Ver todas →
          </button>
        </div>
        
        <div className="space-y-3">
          {recentActivity.map((activity, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.6 + i * 0.1 }}
              className="flex items-center justify-between glass border border-white/5 rounded-lg p-3 hover:border-purple-500/30 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center font-bold shadow-lg group-hover:scale-110 transition-transform">
                  {activity.user[0]}
                </div>
                <div>
                  <p className="font-semibold group-hover:text-purple-400 transition-colors">
                    {activity.user}
                  </p>
                  <p className="text-sm text-gray-400">{activity.action}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">{activity.time}</p>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  activity.plan === 'OURO' ? 'bg-yellow-500/20 text-yellow-400' :
                  activity.plan === 'PRATA' ? 'bg-gray-400/20 text-gray-400' :
                  activity.plan === 'BRONZE' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {activity.plan}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Resumo Executivo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
      >
        <Card className="bg-gradient-to-br from-purple-900/20 via-purple-800/10 to-pink-900/20 border-purple-500/30">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold mb-2">📊 Resumo Executivo</h3>
              <p className="text-sm text-gray-400">Métricas principais do sistema</p>
            </div>
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
              Atualizado agora
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass border border-white/5 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span className="text-sm text-gray-400">Crescimento</span>
              </div>
              <p className="text-2xl font-bold text-green-400">+23.5%</p>
              <p className="text-xs text-gray-500 mt-1">vs mês anterior</p>
            </div>

            <div className="glass border border-white/5 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-gray-400">Engajamento</span>
              </div>
              <p className="text-2xl font-bold text-blue-400">87.3%</p>
              <p className="text-xs text-gray-500 mt-1">taxa de retenção</p>
            </div>

            <div className="glass border border-white/5 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-gray-400">LTV Médio</span>
              </div>
              <p className="text-2xl font-bold text-yellow-400">R$ 847</p>
              <p className="text-xs text-gray-500 mt-1">por usuário</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm text-gray-400">Sistema operacional</span>
            </div>
            <span className="text-sm text-purple-400 font-semibold">Uptime: 99.9%</span>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminOverview;
