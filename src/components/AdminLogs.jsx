import { useState } from 'react';
import { Activity, User, Key, Webhook, TrendingUp, AlertCircle, CheckCircle, XCircle, Filter } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import { motion } from 'framer-motion';

const AdminLogs = () => {
  const [filter, setFilter] = useState('all');
  
  const [logs] = useState([
    {
      id: '1',
      type: 'user',
      action: 'Novo cadastro',
      user: 'João Silva',
      email: 'joao@email.com',
      details: 'Usuário criou conta com plano FREE',
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      status: 'success',
      ip: '192.168.1.100',
    },
    {
      id: '2',
      type: 'offer',
      action: 'Oferta gerada',
      user: 'Maria Santos',
      email: 'maria@email.com',
      details: 'Gerou oferta usando template de e-commerce',
      timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
      status: 'success',
      ip: '192.168.1.101',
    },
    {
      id: '3',
      type: 'api',
      action: 'Chave API adicionada',
      user: 'Admin',
      email: 'tamara14@gmail.com',
      details: 'Nova chave YouTube Data API configurada',
      timestamp: new Date(Date.now() - 23 * 60000).toISOString(),
      status: 'success',
      ip: '192.168.1.1',
    },
    {
      id: '4',
      type: 'webhook',
      action: 'Webhook disparado',
      user: 'System',
      email: 'system@viralticket.com',
      details: 'Webhook Stripe: payment_success',
      timestamp: new Date(Date.now() - 35 * 60000).toISOString(),
      status: 'success',
      ip: '192.168.1.2',
    },
    {
      id: '5',
      type: 'user',
      action: 'Upgrade de plano',
      user: 'Pedro Costa',
      email: 'pedro@email.com',
      details: 'Upgrade de FREE para PRATA',
      timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
      status: 'success',
      ip: '192.168.1.102',
    },
    {
      id: '6',
      type: 'api',
      action: 'Erro na API',
      user: 'Ana Lima',
      email: 'ana@email.com',
      details: 'Quota excedida na YouTube API',
      timestamp: new Date(Date.now() - 58 * 60000).toISOString(),
      status: 'error',
      ip: '192.168.1.103',
    },
    {
      id: '7',
      type: 'webhook',
      action: 'Webhook falhou',
      user: 'System',
      email: 'system@viralticket.com',
      details: 'Timeout ao conectar com Hotmart',
      timestamp: new Date(Date.now() - 72 * 60000).toISOString(),
      status: 'error',
      ip: '192.168.1.2',
    },
    {
      id: '8',
      type: 'offer',
      action: 'URL extraída',
      user: 'Carlos Souza',
      email: 'carlos@email.com',
      details: 'Extraiu 150 comentários do YouTube',
      timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
      status: 'success',
      ip: '192.168.1.104',
    },
  ]);

  const getIcon = (type) => {
    const icons = {
      user: User,
      offer: TrendingUp,
      api: Key,
      webhook: Webhook,
    };
    return icons[type] || Activity;
  };

  const getStatusIcon = (status) => {
    if (status === 'success') return CheckCircle;
    if (status === 'error') return XCircle;
    return AlertCircle;
  };

  const getStatusColor = (status) => {
    if (status === 'success') return 'text-green-400 bg-green-500/20';
    if (status === 'error') return 'text-red-400 bg-red-500/20';
    return 'text-yellow-400 bg-yellow-500/20';
  };

  const getTypeColor = (type) => {
    const colors = {
      user: 'from-blue-500 to-cyan-500',
      offer: 'from-purple-500 to-pink-500',
      api: 'from-green-500 to-emerald-500',
      webhook: 'from-orange-500 to-yellow-500',
    };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'agora mesmo';
    if (diffMins < 60) return `há ${diffMins} min`;
    if (diffMins < 1440) return `há ${Math.floor(diffMins / 60)}h`;
    return date.toLocaleDateString('pt-BR');
  };

  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.type === filter);

  const stats = {
    total: logs.length,
    success: logs.filter(l => l.status === 'success').length,
    error: logs.filter(l => l.status === 'error').length,
    users: logs.filter(l => l.type === 'user').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card hover={false}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total de Logs</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card hover={false}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Sucesso</p>
              <p className="text-2xl font-bold">{stats.success}</p>
            </div>
          </div>
        </Card>

        <Card hover={false}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-gradient-to-br from-red-500 to-pink-500">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Erros</p>
              <p className="text-2xl font-bold">{stats.error}</p>
            </div>
          </div>
        </Card>

        <Card hover={false}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Ações de Usuários</p>
              <p className="text-2xl font-bold">{stats.users}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-400">Filtrar por:</span>
          
          {['all', 'user', 'offer', 'api', 'webhook'].map((type) => (
            <Button
              key={type}
              variant={filter === type ? 'primary' : 'secondary'}
              onClick={() => setFilter(type)}
              className="text-sm"
            >
              {type === 'all' ? 'Todos' : type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </div>
      </Card>

      {/* Logs List */}
      <Card>
        <h3 className="text-xl font-bold mb-4">Atividades Recentes</h3>
        
        <div className="space-y-3">
          {filteredLogs.map((log, index) => {
            const Icon = getIcon(log.type);
            const StatusIcon = getStatusIcon(log.status);
            
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass border border-white/5 rounded-lg p-4 hover:border-purple-500/30 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${getTypeColor(log.type)}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{log.action}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${getStatusColor(log.status)}`}>
                          <StatusIcon className="w-3 h-3" />
                          {log.status}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-400 mb-2">{log.details}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {log.user}
                        </span>
                        <span>{log.email}</span>
                        <span>IP: {log.ip}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right text-sm text-gray-400 ml-4">
                    {formatTimestamp(log.timestamp)}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default AdminLogs;
