// VT: Quadro de Monitoramento de Modelagem (independente do Kanban)
import { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Award, XCircle, Clock, Plus, Save, X } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import Input from './Input';
import Modal from './Modal';
import { useAuth } from '../hooks/useAuth';
import { subscribeToMonitoring, checkMonitoringStatus, startMonitoring } from '../services/monitoringService';
import { formatDate } from '../utils/validation';
import toast from 'react-hot-toast';

const MonitoringBoard = () => {
  const { user } = useAuth();
  const [monitorings, setMonitorings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    offerTitle: '',
    fanpageUrl: '',
    salesPageUrl: '',
    checkoutUrl: '',
    creativesCount: 0,
    monitorDays: 7
  });

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

  const handleCreateMonitoring = async () => {
    if (!formData.offerTitle) {
      toast.error('Digite o nome da oferta');
      return;
    }

    try {
      await startMonitoring(user.id, 'manual_' + Date.now(), formData.offerTitle);
      toast.success('✅ Monitoramento criado!');
      setShowForm(false);
      setFormData({
        offerTitle: '',
        fanpageUrl: '',
        salesPageUrl: '',
        checkoutUrl: '',
        creativesCount: 0,
        monitorDays: 7
      });
    } catch (error) {
      toast.error('❌ Erro ao criar monitoramento');
    }
  };

  return (
    <>
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-cyan-400" />
            <h3 className="text-xl font-bold">Monitoramento de Modelagem</h3>
          </div>
          <Button onClick={() => setShowForm(true)} icon={Plus}>
            Nova Modelagem
          </Button>
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

              {/* Botão Deletar */}
              <div className="mt-3 pt-3 border-t border-white/10">
                <button
                  onClick={async () => {
                    if (confirm('Tem certeza que deseja excluir este monitoramento?')) {
                      try {
                        const { deleteMonitoring } = await import('../services/monitoringService');
                        await deleteMonitoring(item.id);
                        toast.success('🗑️ Monitoramento excluído!');
                      } catch (error) {
                        toast.error('Erro ao excluir');
                      }
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 text-sm transition-colors"
                >
                  <X className="w-4 h-4" />
                  Deletar Monitoramento
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      </Card>

      {/* Modal de Nova Modelagem */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Nova Modelagem" size="lg">
        <div className="space-y-4">
          <Input
            label="Nome da Oferta"
            value={formData.offerTitle}
            onChange={(e) => setFormData(prev => ({ ...prev, offerTitle: e.target.value }))}
            placeholder="Ex: Curso de Emagrecimento"
          />

          <Input
            label="URL da Fanpage"
            type="url"
            value={formData.fanpageUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, fanpageUrl: e.target.value }))}
            placeholder="https://facebook.com/..."
          />

          <Input
            label="URL da Página de Vendas"
            type="url"
            value={formData.salesPageUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, salesPageUrl: e.target.value }))}
            placeholder="https://..."
          />

          <Input
            label="URL do Checkout"
            type="url"
            value={formData.checkoutUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, checkoutUrl: e.target.value }))}
            placeholder="https://..."
          />

          <Input
            label="Quantidade de Criativos"
            type="number"
            min="0"
            value={formData.creativesCount}
            onChange={(e) => setFormData(prev => ({ ...prev, creativesCount: parseInt(e.target.value) || 0 }))}
          />

          <Input
            label="Dias de Monitoramento"
            type="number"
            min="1"
            max="30"
            value={formData.monitorDays}
            onChange={(e) => setFormData(prev => ({ ...prev, monitorDays: parseInt(e.target.value) || 7 }))}
          />

          <div className="flex gap-2 pt-4">
            <Button onClick={handleCreateMonitoring} className="flex-1" icon={Save}>
              Salvar
            </Button>
            <Button onClick={() => setShowForm(false)} variant="secondary" className="flex-1" icon={X}>
              Fechar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default MonitoringBoard;
