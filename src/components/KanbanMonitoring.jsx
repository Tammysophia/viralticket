// VT: Kanban de Monitoramento - Ofertas da biblioteca do Facebook em teste de 7 dias
import { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Calendar, Edit2, Trash2, AlertCircle, TrendingUp, ArrowRight } from 'lucide-react';
import Card from './Card';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils/validation';
import toast from 'react-hot-toast';
import { subscribeToUserOffers, updateOffer, deleteOffer } from '../services/offersService';

const DAYS_IN_MS = 24 * 60 * 60 * 1000;

const KanbanMonitoring = ({ onEditOffer, onMoveToModeling }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const STATUS_MAP = {
    monitorando: 'monitoring',
    aprovado: 'approved',
    reprovado: 'rejected',
  };

  const REVERSE_STATUS_MAP = {
    monitoring: 'monitorando',
    approved: 'aprovado',
    rejected: 'reprovado',
  };

  const [columns, setColumns] = useState({
    monitoring: { id: 'monitoring', title: 'Monitorando (7 dias)', items: [] },
    approved: { id: 'approved', title: 'Aprovado', items: [] },
    rejected: { id: 'rejected', title: 'Reprovado', items: [] },
  });

  const offersRef = useRef([]);
  const columnsRef = useRef(columns);
  useEffect(() => { columnsRef.current = columns; }, [columns]);
  useEffect(() => { offersRef.current = offers; }, [offers]);

  // Listener real-time: APENAS monitoramento (type: 'monitoramento')
  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);

    const unsubscribe = subscribeToUserOffers(
      user.id,
      (updatedOffers) => {
        setOffers(updatedOffers);
        offersRef.current = updatedOffers;
        organizeOffersByStatus(updatedOffers);
        setLoading(false);
      },
      'monitoramento' // filtrar somente monitoramento
    );

    return () => unsubscribe();
  }, [user?.id]);

  const organizeOffersByStatus = (allOffers) => {
    const organized = {
      monitoring: { ...columnsRef.current.monitoring, items: [] },
      approved: { ...columnsRef.current.approved, items: [] },
      rejected: { ...columnsRef.current.rejected, items: [] },
    };

    allOffers.forEach((offer) => {
      const columnId = STATUS_MAP[offer.status] || 'monitoring';
      const item = {
        id: offer.id,
        title: offer.title,
        subtitle: offer.subtitle || offer.copy?.adDescription || '',
        agent: offer.agent || 'Manual',
        date: offer.createdAt?.toDate?.() || offer.createdAt || new Date(),
        status: offer.status,
        monitoring: offer.monitoring,
        type: offer.type || 'monitoramento',
        full: offer
      };
      organized[columnId].items.push(item);
    });

    setColumns(organized);
    columnsRef.current = organized;
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceColumn = columnsRef.current[source.droppableId];
    const destColumn = columnsRef.current[destination.droppableId];
    const sourceItems = [...sourceColumn.items];
    const destItems = source.droppableId === destination.droppableId ? sourceItems : [...destColumn.items];

    const [removed] = sourceItems.splice(source.index, 1);
    destItems.splice(destination.index, 0, removed);

    setColumns({
      ...columnsRef.current,
      [source.droppableId]: { ...sourceColumn, items: sourceItems },
      [destination.droppableId]: { ...destColumn, items: destItems },
    });

    try {
      const newStatus = REVERSE_STATUS_MAP[destination.droppableId];
      await updateOffer(draggableId, { status: newStatus });
      toast.success('Status atualizado!');
    } catch (error) {
      toast.error('Erro ao mover');
      console.error(error);
      organizeOffersByStatus(offersRef.current);
    }
  };

  const handleDelete = async (offerId, offerTitle) => {
    if (!window.confirm(`Tem certeza que deseja excluir "${offerTitle}"?`)) return;
    try {
      await deleteOffer(offerId);
      setOffers(prev => prev.filter(o => o.id !== offerId));
      organizeOffersByStatus(offers.filter(o => o.id !== offerId));
      toast.success('Oferta excluída');
    } catch (err) {
      toast.error('Erro ao excluir');
      console.error(err);
    }
  };

  const handleEditClick = (offerId) => {
    const full = offersRef.current.find(o => o.id === offerId);
    if (!full) {
      toast.error('Oferta não encontrada');
      return;
    }
    if (typeof onEditOffer === 'function') {
      onEditOffer(offerId, full);
    }
  };

  const handleMoveToModeling = async (offerId) => {
    const original = offersRef.current.find(o => o.id === offerId);
    if (!original) {
      toast.error('Oferta não encontrada');
      return;
    }
    if (typeof onMoveToModeling === 'function') {
      onMoveToModeling(original);
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Carregando monitoramento...</p>
        </div>
      </Card>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-2">
        {Object.values(columns).map((column) => (
          <div key={column.id} className="space-y-3">
            <h3 className="font-bold text-lg px-2 flex items-center gap-2">
              {column.title}
              <span className="text-xs text-gray-500">({column.items.length})</span>
            </h3>
            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`space-y-3 min-h-[400px] p-3 rounded-xl border-2 border-dashed transition-colors ${
                    snapshot.isDraggingOver ? 'border-purple-500 bg-purple-500/5' : 'border-white/10'
                  }`}
                >
                  {column.items.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                      <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-sm">Nenhuma oferta</p>
                    </div>
                  )}

                  {column.items.map((item, index) => {
                    const monitorDays = item.monitoring?.monitorDays || 7;
                    const monitorStart = item.monitoring?.monitorStart ? new Date(item.monitoring.monitorStart) : null;
                    const elapsedDays = monitorStart ? Math.max(0, Math.floor((Date.now() - monitorStart.getTime()) / DAYS_IN_MS)) : 0;
                    const progressPercent = monitorStart ? Math.min((elapsedDays / monitorDays) * 100, 100) : 0;

                    return (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`glass border rounded-lg p-4 cursor-move transition-all ${
                              snapshot.isDragging ? 'rotate-2 scale-105 shadow-xl' : ''
                            }`}
                          >
                            <h4 className="font-bold mb-1 text-white cursor-grab active:cursor-grabbing" {...provided.dragHandleProps}>
                              {item.title}
                            </h4>

                            {item.subtitle && <p className="text-xs text-gray-400 mb-2 line-clamp-2">{item.subtitle}</p>}

                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(item.date)}</span>
                            </div>

                            {/* Informações de Monitoramento */}
                            {item.monitoring && (
                              <div className="mb-3 p-3 rounded-lg bg-cyan-900/10 border border-cyan-500/30">
                                <div className="flex items-center gap-2 mb-2">
                                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                                  <span className="text-xs font-bold text-cyan-300">Progresso do Monitoramento</span>
                                </div>
                                
                                {monitorStart && (
                                  <div className="mb-2">
                                    <div className="flex items-center justify-between text-xs mb-1">
                                      <span className="text-gray-400">Dias decorridos</span>
                                      <span className="text-white font-bold">{elapsedDays}/{monitorDays} dias</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                      <div
                                        className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all"
                                        style={{ width: `${progressPercent}%` }}
                                      />
                                    </div>
                                  </div>
                                )}

                                <div className="space-y-1 text-xs">
                                  {item.monitoring.creativesCount > 0 && (
                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-400">Criativos</span>
                                      <span className={item.monitoring.creativesCount >= 7 ? 'text-green-400' : 'text-white'}>
                                        {item.monitoring.creativesCount}/7
                                      </span>
                                    </div>
                                  )}
                                  {item.monitoring.fanpageUrl && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-green-400">✓</span>
                                      <span className="text-green-400 text-xs">Fanpage configurada</span>
                                    </div>
                                  )}
                                  {item.monitoring.salesPageUrl && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-green-400">✓</span>
                                      <span className="text-green-400 text-xs">Página de Vendas</span>
                                    </div>
                                  )}
                                  {item.monitoring.checkoutUrl && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-green-400">✓</span>
                                      <span className="text-green-400 text-xs">Checkout</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            <div className="flex gap-2 mt-3 pt-3 border-t border-white/10 flex-wrap">
                              {column.id === 'approved' && (
                                <button 
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleMoveToModeling(item.id); }} 
                                  className="flex-1 min-w-[140px] flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-green-600/20 hover:bg-green-600/30 text-green-300 text-sm transition-colors"
                                >
                                  <ArrowRight className="w-3 h-3" /> Mover p/ Modelagem
                                </button>
                              )}

                              <button 
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditClick(item.id); }} 
                                className="flex-1 min-w-[100px] flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-sm transition-colors"
                              >
                                <Edit2 className="w-3 h-3" /> Editar
                              </button>

                              <button 
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(item.id, item.title); }} 
                                className="flex-1 min-w-[100px] flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 text-sm transition-colors"
                              >
                                <Trash2 className="w-3 h-3" /> Excluir
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanMonitoring;
