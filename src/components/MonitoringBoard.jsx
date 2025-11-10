// VT: Quadro de Monitoramento de Modelagem (independente do Kanban)
import { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Award, XCircle, Clock } from 'lucide-react';
import Card from './Card';
import { useAuth } from '../hooks/useAuth';
import { subscribeToMonitoring, checkMonitoringStatus } from '../services/monitoringService';
import { formatDate } from '../utils/validation';

const MonitoringBoard = () => {
  const { user } = useAuth();
  const [monitorings, setMonitorings] = useState([]);
  const [loading, setLoading] = useState(true);

  // VT: Listener em tempo real
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = subscribeToMonitoring(user.id, (data) => {
      setMonitorings(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.id]);

  // VT: Verificar status a cada hora
  useEffect(() => {
    if (!user?.id) return;

    // Verificar imediatamente
    checkMonitoringStatus(user.id);

    // Verificar a cada 1 hora
    const interval = setInterval(() => {
      checkMonitoringStatus(user.id);
    }, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user?.id]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'monitorando':
        return 'border-blue-500/30 bg-blue-900/10';
      case 'modelada':
        return 'border-green-500/30 bg-green-900/10';
      case 'nao_modelada':
        return 'border-red-500/30 bg-red-900/10';
      default:
        return 'border-gray-500/30';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'monitorando':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold">
            <Clock className="w-3 h-3" />
            Monitorando
          </span>
        );
      case 'modelada':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-xs font-semibold">
            <Award className="w-3 h-3" />
            Oferta Modelada
          </span>
        );
      case 'nao_modelada':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-semibold">
            <XCircle className="w-3 h-3" />
            Não Modelada
          </span>
        );
      default:
        return null;
    }
  };

  const calculateDaysRemaining = (endDate) => {
    if (!endDate) return 0;
    const remaining = Math.ceil((endDate - new Date()) / (24 * 60 * 60 * 1000));
    return Math.max(0, remaining);
  };

  const calculateProgress = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const total = endDate - startDate;
    const elapsed = new Date() - startDate;
    return Math.min(100, (elapsed / total) * 100);
  };

  if (loading) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Carregando monitoramentos...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-cyan-400" />
          <h3 className="text-xl font-bold">Monitoramento de Modelagem</h3>
        </div>
        <span className="text-xs text-gray-400">
          {monitorings.length} {monitorings.length === 1 ? 'oferta' : 'ofertas'} em monitoramento
        </span>
      </div>

      {monitorings.length === 0 ? (
        <div className="text-center py-12">
          <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4 opacity-50" />
          <p className="text-gray-400">Nenhuma oferta em monitoramento</p>
          <p className="text-xs text-gray-500 mt-2">
            Preencha dados de modelagem em uma oferta para iniciar o monitoramento automático
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {monitorings.map((item) => (
            <div
              key={item.id}
              className={`glass border rounded-xl p-5 ${getStatusColor(item.status)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-bold text-white mb-1">{item.offerTitle}</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    <span>Iniciado em: {formatDate(item.startDate)}</span>
                  </div>
                </div>
                {getStatusBadge(item.status)}
              </div>

              {item.status === 'monitorando' && (
                <div className="space-y-3">
                  {/* Progresso */}
                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                      <span>Progresso do Monitoramento</span>
                      <span>{calculateDaysRemaining(item.endDate)} dias restantes</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all"
                        style={{ width: `${calculateProgress(item.startDate, item.endDate)}%` }}
                      />
                    </div>
                  </div>

                  {/* Criativos */}
                  <div className="flex items-center justify-between p-3 glass border border-cyan-500/20 rounded-lg">
                    <span className="text-sm text-gray-300">Criativos Adicionados:</span>
                    <span className={`text-lg font-bold ${item.creativesAdded >= 1 ? 'text-green-400' : 'text-gray-400'}`}>
                      {item.creativesAdded}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="text-xs text-gray-400 text-center">
                    {item.creativesAdded >= 1 ? (
                      <span className="text-green-400">✓ Pelo menos 1 criativo adicionado - será marcada como Modelada</span>
                    ) : (
                      <span>Aguardando adição de criativos...</span>
                    )}
                  </div>
                </div>
              )}

              {item.status === 'modelada' && (
                <div className="mt-3 p-3 glass border border-green-500/20 rounded-lg">
                  <p className="text-sm text-green-400 text-center">
                    ✅ Oferta modelada com sucesso! {item.creativesAdded} {item.creativesAdded === 1 ? 'criativo' : 'criativos'} adicionados em 7 dias.
                  </p>
                </div>
              )}

              {item.status === 'nao_modelada' && (
                <div className="mt-3 p-3 glass border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-400 text-center">
                    ❌ Nenhum criativo foi adicionado durante o período de 7 dias.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default MonitoringBoard;
