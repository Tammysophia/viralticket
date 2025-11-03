import { TrendingUp, Users, Key, Activity, Database } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useToast } from './Toast';
import { initializePrompts, getPromptsInfo } from '../utils/initializePrompts';
import { getAllPrompts } from '../services/promptsService';
import { useState } from 'react';

const AdminOverview = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [initializingPrompts, setInitializingPrompts] = useState(false);
  const [checkingPrompts, setCheckingPrompts] = useState(false);
  const [promptsStatus, setPromptsStatus] = useState(null);

  // Proteção adicional - não renderizar se não for admin
  if (!user?.isAdmin) {
    return (
      <Card>
        <p className="text-center text-gray-400">🎯 O sistema está em operação normal.</p>
      </Card>
    );
  }

  const handleInitializePrompts = async () => {
    setInitializingPrompts(true);
    try {
      const result = await initializePrompts();
      if (result.success) {
        success('✅ Prompts inicializados com sucesso!');
        console.log('[ADMIN] Prompts inicializados:', result.details);
        // Atualizar status
        await handleCheckPrompts();
      } else {
        error(`❌ Erro ao inicializar prompts: ${result.message}`);
      }
    } catch (err) {
      error(`❌ Erro: ${err.message}`);
      console.error('[ADMIN] Erro ao inicializar prompts:', err);
    } finally {
      setInitializingPrompts(false);
    }
  };

  const handleCheckPrompts = async () => {
    setCheckingPrompts(true);
    try {
      const prompts = await getAllPrompts();
      const info = getPromptsInfo();
      
      const status = {
        sophia: {
          loaded: prompts.sophia ? prompts.sophia.length : 0,
          expected: info.sophia.charCount,
          status: prompts.sophia ? '✅ Carregado' : '❌ Não encontrado',
        },
        sofia: {
          loaded: prompts.sofia ? prompts.sofia.length : 0,
          expected: info.sofia.charCount,
          status: prompts.sofia ? '✅ Carregado' : '❌ Não encontrado',
        }
      };
      
      setPromptsStatus(status);
      
      if (prompts.sophia && prompts.sofia) {
        success(`✅ Prompts OK: SOPHIA (${status.sophia.loaded} chars), SOFIA (${status.sofia.loaded} chars)`);
      } else {
        error('⚠️ Prompts não encontrados no Firestore. Clique em "Inicializar Prompts"');
      }
      
      console.log('[ADMIN] Status dos prompts:', status);
    } catch (err) {
      error(`❌ Erro ao verificar prompts: ${err.message}`);
      console.error('[ADMIN] Erro ao verificar prompts:', err);
    } finally {
      setCheckingPrompts(false);
    }
  };
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

      {/* Prompts Management */}
      <Card gradient>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-purple-400" />
            <h3 className="text-xl font-bold">Gerenciamento de Prompts de IA</h3>
          </div>
        </div>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            Os prompts são carregados do Firestore em tempo real. Se ainda não foram inicializados, 
            clique no botão abaixo para popular a coleção <code className="glass px-2 py-1 rounded text-purple-400">agent_templates</code> no Firestore.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={handleInitializePrompts}
              loading={initializingPrompts}
              icon={Database}
              variant="primary"
              className="w-full"
            >
              🔄 Inicializar Prompts no Firestore
            </Button>

            <Button
              onClick={handleCheckPrompts}
              loading={checkingPrompts}
              icon={Activity}
              variant="secondary"
              className="w-full"
            >
              🔍 Verificar Status dos Prompts
            </Button>
          </div>

          {promptsStatus && (
            <div className="glass border border-purple-500/30 rounded-lg p-4 space-y-3">
              <h4 className="font-bold text-purple-400">Status dos Prompts</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* SOPHIA */}
                <div className="glass border border-white/10 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">🔥 Sophia Fênix</span>
                    <span className="text-sm">{promptsStatus.sophia.status}</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    <p>Carregado: {promptsStatus.sophia.loaded} chars</p>
                    <p>Esperado: ~{promptsStatus.sophia.expected} chars</p>
                  </div>
                </div>

                {/* SOFIA */}
                <div className="glass border border-white/10 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">🌟 Sofia Universal</span>
                    <span className="text-sm">{promptsStatus.sofia.status}</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    <p>Carregado: {promptsStatus.sofia.loaded} chars</p>
                    <p>Esperado: ~{promptsStatus.sofia.expected} chars</p>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 border-t border-white/10 pt-3">
                ℹ️ Os prompts são carregados automaticamente quando um usuário gera uma oferta. 
                Se houver erro de permissão no Firestore, o sistema usa fallback MVP hardcoded.
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500 space-y-1">
            <p>📝 <strong>Importante:</strong> As regras do Firestore devem permitir leitura da coleção <code className="text-purple-400">agent_templates</code> para todos os usuários autenticados.</p>
            <p>🔒 <strong>Segurança:</strong> Apenas admins podem escrever/atualizar prompts.</p>
            <p>⚠️ <strong>Crítico:</strong> Prompts devem ter 3500+ caracteres para funcionar corretamente.</p>
            <p>📚 <strong>Documentação:</strong> Ver arquivo <code className="text-purple-400">CORREÇÃO_CRÍTICA_FIRESTORE.md</code> para mais detalhes.</p>
          </div>
        </div>
      </Card>

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
