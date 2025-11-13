// ...existing code...
import { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Calendar, Edit2, Trash2, AlertCircle, TrendingUp, Copy } from 'lucide-react';
import Card from './Card';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils/validation';
import toast from 'react-hot-toast';
import { subscribeToUserOffers, updateOffer, deleteOffer, duplicateOfferForModeling } from '../services/offersService';

const DAYS_IN_MS = 24 * 60 * 60 * 1000;

const Kanban = ({ onEditOffer, onOpenModeling }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const STATUS_MAP = {
    pendente: 'pending',
    execucao: 'inExecution',
    modelando: 'modeling',
    modelagem_ativa: 'modeling',
    concluido: 'completed',
  };

  const REVERSE_STATUS_MAP = {
    pending: 'pendente',
    inExecution: 'execucao',
    modeling: 'modelando',
    completed: 'concluido',
  };

  const [columns, setColumns] = useState({
    pending: { id: 'pending', title: t('pending') || 'Pendente', items: [] },
    inExecution: { id: 'inExecution', title: t('inExecution') || 'Em Execução', items: [] },
    modeling: { id: 'modeling', title: t('modeling') || 'Modelando', items: [] },
    completed: { id: 'completed', title: t('completed') || 'Concluído', items: [] },
  });

  // refs para dados mais recentes
  const offersRef = useRef([]);
  const columnsRef = useRef(columns);
  useEffect(() => { columnsRef.current = columns; }, [columns]);
  useEffect(() => { offersRef.current = offers; }, [offers]);

  useEffect(() => {
    setColumns((prev) => ({
      pending: { ...prev.pending, title: t('pending') || 'Pendente' },
      inExecution: { ...prev.inExecution, title: t('inExecution') || 'Em Execução' },
      modeling: { ...prev.modeling, title: t('modeling') || 'Modelando' },
      completed: { ...prev.completed, title: t('completed') || 'Concluído' },
    }));
  }, [t]);

  // listener real-time: APENAS ofertas (type: 'oferta')
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
      'oferta' // filtrar somente ofertas
    );

    return () => unsubscribe();
  }, [user?.id]);

  const organizeOffersByStatus = (allOffers) => {
    const organized = {
      pending: { ...columnsRef.current.pending, items: [] },
      inExecution: { ...columnsRef.current.inExecution, items: [] },
      modeling: { ...columnsRef.current.modeling, items: [] },
      completed: { ...columnsRef.current.completed, items: [] },
    };

    allOffers.forEach((offer) => {
      const columnId = STATUS_MAP[offer.status] || 'pending';
      const item = {
        id: offer.id,
        title: offer.title,
        subtitle: offer.subtitle || offer.copy?.adDescription || '',
        agent: offer.agent || 'IA',
        date: offer.createdAt?.toDate?.() || offer.createdAt || new Date(),
        status: offer.status,
        modeling: offer.modeling,
        type: offer.type || 'oferta',
        full: offer
      };
      organized[columnId].items.push(item);
    });

    setColumns(organized);
    columnsRef.current = organized;
  };

  // Se arrastar para 'modeling' -> duplicar (não mover a oferta original) e abrir modelagem
  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const original = offersRef.current.find(o => o.id === draggableId);
    if (!original) return;

    // intercepta drag to modelagem
    if (destination.droppableId === 'modeling' && (original.type || 'oferta') !== 'modelagem') {
      try {
        toast.loading('Criando modelagem...');
        const newId = await duplicateOfferForModeling(original);
        toast.dismiss();
        toast.success('Modelagem criada!');
        // abre automaticamente: usa callback ou rota /modelagem/:id
        if (typeof onOpenModeling === 'function') {
          onOpenModeling(newId);
        } else {
          window.location.href = `/modelagem/${newId}`;
        }
      } catch (err) {
        toast.dismiss();
        toast.error('Erro ao criar modelagem');
        console.error('VT: duplicateOfferForModeling error', err);
      }
      // reordena UI de volta (não mova original)
      organizeOffersByStatus(offersRef.current);
      return;
    }

    // caso normal: mover entre colunas do mesmo Kanban (ofertas)
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
      const newType = newStatus === 'modelando' ? 'modelagem' : 'oferta';
      await updateOffer(draggableId, { status: newStatus, type: newType });
      toast.success('Oferta movida!');
    } catch (error) {
      toast.error('Erro ao mover oferta');
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
    } else {
      // fallback: abrir /oferta/:id (se não existir, apenas log)
      window.location.href = `/oferta/${offerId}`;
    }
  };

  // duplicar via botão: cria modelagem e abre
  const handleDuplicate = async (offerId) => {
    const original = offersRef.current.find(o => o.id === offerId);
    if (!original) {
      toast.error('Oferta não encontrada');
      return;
    }
    try {
      toast.loading('Criando modelagem...');
      const newId = await duplicateOfferForModeling(original);
      toast.dismiss();
      toast.success('Modelagem criada!');
      if (typeof onOpenModeling === 'function') {
        onOpenModeling(newId);
      } else {
        window.location.href = `/modelagem/${newId}`;
      }
    } catch (err) {
      toast.dismiss();
      toast.error('Erro ao duplicar');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Carregando ofertas...</p>
        </div>
      </Card>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 px-2">
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
                    const monitorDays = item.modeling?.monitorDays || 7;
                    const monitorStart = item.modeling?.monitorStart ? new Date(item.modeling.monitorStart) : null;
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
                            <div className="flex items-center gap-2 mb-2">
                              <img
                                src={item.agent === 'sophia' ? 'https://iili.io/KbegFWu.png' : 'https://iili.io/KieLs1V.png'}
                                alt={item.agent === 'sophia' ? 'Sophia Fênix' : 'Sofia Universal'}
                                className="w-8 h-8 rounded-full object-cover border border-purple-500/50"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                              <span className="text-xs text-white relative z-10 font-semibold">
                                {item.agent === 'sophia' ? 'Sophia Fênix' : 'Sofia Universal'}
                              </span>
                            </div>

                            <h4 className="font-bold mb-1 text-white cursor-grab active:cursor-grabbing" {...provided.dragHandleProps}>
                              {item.title}
                            </h4>

                            {item.subtitle && <p className="text-xs text-gray-400 mb-2 line-clamp-2">{item.subtitle}</p>}

                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(item.date)}</span>
                            </div>

                            {item.modeling && (item.modeling.fanpageUrl || item.modeling.salesPageUrl || item.modeling.creativesCount > 0) && (
                              <div className="mb-3 p-3 rounded-lg bg-cyan-900/10 border border-cyan-500/30">
                                <div className="flex items-center gap-2 mb-2">
                                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                                  <span className="text-xs font-bold text-cyan-300">{t('monitoringProgress')}</span>
                                </div>
                                <div className="space-y-1 text-xs">
                                  {item.modeling.creativesCount > 0 && (
                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-400">{t('creativesLabel')}</span>
                                      <span className={item.modeling.creativesCount >= 7 ? 'text-green-400' : 'text-white'}>
                                        {item.modeling.creativesCount}/7
                                      </span>
                                    </div>
                                  )}
                                  {item.modeling.fanpageUrl && <div className="flex items-center gap-1"><span className="text-green-400">✓</span><span className="text-green-400 text-xs">Fanpage</span></div>}
                                  {item.modeling.salesPageUrl && <div className="flex items-center gap-1"><span className="text-green-400">✓</span><span className="text-green-400 text-xs">PV</span></div>}
                                  {item.modeling.checkoutUrl && <div className="flex items-center gap-1"><span className="text-green-400">✓</span><span className="text-green-400 text-xs">Checkout</span></div>}
                                </div>
                              </div>
                            )}

                            <div className="flex gap-2 mt-3 pt-3 border-t border-white/10 flex-wrap">
                              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDuplicate(item.id); }} className="flex-1 min-w-[120px] flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-sm transition-colors">
                                <Copy className="w-3 h-3" /> Duplicar
                              </button>

                              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditClick(item.id); }} className="flex-1 min-w-[100px] flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-sm transition-colors">
                                <Edit2 className="w-3 h-3" /> Editar
                              </button>

                              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(item.id, item.title); }} className="flex-1 min-w-[100px] flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 text-sm transition-colors">
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

export default Kanban;
// ...existing code...