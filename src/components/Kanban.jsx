// VT: Kanban integrado com Firestore em tempo real
import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Calendar, Sparkles, Edit2, Trash2, AlertCircle } from 'lucide-react';
import Card from './Card';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils/validation';
import toast from 'react-hot-toast';
import { subscribeToUserOffers, updateOffer, deleteOffer } from '../services/offersService';

const Kanban = ({ onEditOffer }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  // VT: Mapeamento de status para colunas
  const STATUS_MAP = {
    'pendente': 'pending',
    'execucao': 'inExecution',
    'modelando': 'modeling',
    'concluido': 'completed'
  };

  const REVERSE_STATUS_MAP = {
    'pending': 'pendente',
    'inExecution': 'execucao',
    'modeling': 'modelando',
    'completed': 'concluido'
  };

  // VT: Estrutura de colunas
  const [columns, setColumns] = useState({
    pending: {
      id: 'pending',
      title: t('pending') || 'Pendente',
      items: [],
    },
    inExecution: {
      id: 'inExecution',
      title: t('inExecution') || 'Em Execução',
      items: [],
    },
    modeling: {
      id: 'modeling',
      title: t('modeling') || 'Modelando',
      items: [],
    },
    completed: {
      id: 'completed',
      title: t('completed') || 'Concluído',
      items: [],
    },
  });

  // VT: Listener em tempo real do Firestore
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = subscribeToUserOffers(user.id, (updatedOffers) => {
      setOffers(updatedOffers);
      organizeOffersByStatus(updatedOffers);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.id]);

  // VT: Organizar ofertas por status
  const organizeOffersByStatus = (allOffers) => {
    const organized = {
      pending: { ...columns.pending, items: [] },
      inExecution: { ...columns.inExecution, items: [] },
      modeling: { ...columns.modeling, items: [] },
      completed: { ...columns.completed, items: [] },
    };

    allOffers.forEach(offer => {
      const columnId = STATUS_MAP[offer.status] || 'pending';
      organized[columnId].items.push({
        id: offer.id,
        title: offer.title,
        agent: offer.agent || 'IA',
        date: offer.createdAt?.toDate?.() || offer.createdAt || new Date(),
        status: offer.status,
        modeling: offer.modeling,
      });
    });

    setColumns(organized);
  };

  // VT: Drag and drop com persistência
  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    const sourceItems = [...sourceColumn.items];
    const destItems = source.droppableId === destination.droppableId ? sourceItems : [...destColumn.items];

    const [removed] = sourceItems.splice(source.index, 1);
    destItems.splice(destination.index, 0, removed);

    // VT: Atualizar UI imediatamente
    setColumns({
      ...columns,
      [source.droppableId]: {
        ...sourceColumn,
        items: sourceItems,
      },
      [destination.droppableId]: {
        ...destColumn,
        items: destItems,
      },
    });

    // VT: Salvar novo status no Firestore
    try {
      const newStatus = REVERSE_STATUS_MAP[destination.droppableId];
      await updateOffer(draggableId, { status: newStatus });
      toast.success('Oferta movida com sucesso!');
    } catch (error) {
      toast.error('Erro ao mover oferta');
      console.error('VT: Erro ao atualizar status:', error);
      // VT: Reverter UI em caso de erro
      organizeOffersByStatus(offers);
    }
  };

  // VT: Excluir oferta com confirmação
  const handleDelete = async (offerId, offerTitle) => {
    if (!window.confirm(`Tem certeza que deseja excluir "${offerTitle}"?`)) {
      return;
    }

    try {
      await deleteOffer(offerId);
      toast.success('Oferta excluída!');
    } catch (error) {
      toast.error('Erro ao excluir oferta');
      console.error('VT: Erro ao excluir:', error);
    }
  };

  const columnColors = {
    pending: 'border-yellow-500/30',
    inExecution: 'border-blue-500/30',
    modeling: 'border-purple-500/30',
    completed: 'border-green-500/30',
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    
                    {column.items.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`glass border ${columnColors[column.id]} rounded-lg p-4 cursor-move transition-all ${
                              snapshot.isDragging ? 'rotate-2 scale-105 shadow-xl' : ''
                            }`}
                          >
                            <h4
                              className="font-bold mb-2 cursor-grab active:cursor-grabbing"
                              {...provided.dragHandleProps}
                            >
                              {item.title}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                              <Sparkles className="w-4 h-4" />
                              <span>{item.agent}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(item.date)}</span>
                            </div>
                            
                            {/* VT: Badge de modelagem na coluna "Modelando" */}
                            {column.id === 'modeling' && item.modeling && (
                              <div className="mb-3">
                                {item.modeling.modelavel && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
                                    ✅ Modelável
                                  </span>
                                )}
                                {item.modeling.trend === 'caindo' && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs">
                                    🚫 Parar
                                  </span>
                                )}
                              </div>
                            )}
                            
                            {/* VT: Botões de ação */}
                            <div className="flex gap-2 mt-3 pt-3 border-t border-white/10">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditOffer && onEditOffer(item.id);
                                }}
                                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-sm transition-colors"
                              >
                                <Edit2 className="w-3 h-3" />
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(item.id, item.title);
                                }}
                                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 text-sm transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                                Excluir
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
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
