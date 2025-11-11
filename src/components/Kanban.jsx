// VT: Kanban integrado com Firestore em tempo real
import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Calendar, Sparkles, Edit2, Trash2, AlertCircle, TrendingUp } from 'lucide-react';
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
    'modelagem_ativa': 'activeModeling',
    'concluido': 'completed'
  };

  const REVERSE_STATUS_MAP = {
    'pending': 'pendente',
    'inExecution': 'execucao',
    'modeling': 'modelando',
    'activeModeling': 'modelagem_ativa',
    'completed': 'concluido'
  };

  // VT: Estrutura de colunas (5 colunas agora!)
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
    activeModeling: {
      id: 'activeModeling',
      title: 'Modelagem Ativa',
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
      activeModeling: { ...columns.activeModeling, items: [] },
      completed: { ...columns.completed, items: [] },
    };

    allOffers.forEach(offer => {
      // VT: SEMPRE usar o status da oferta (não auto-detectar)
      // Evita loop infinito de re-render
      const columnId = STATUS_MAP[offer.status] || 'pending';
      
      // VT: Verificar se é "Oferta Modelada" (10+ criativos)
      const isModeledOffer = offer.modeling?.creativesCount >= 10;
      
      organized[columnId].items.push({
        id: offer.id,
        title: offer.title,
        subtitle: offer.subtitle || offer.copy?.adDescription || '',
        agent: offer.agent || 'IA',
        date: offer.createdAt?.toDate?.() || offer.createdAt || new Date(),
        status: offer.status,
        modeling: offer.modeling,
        isModeledOffer: isModeledOffer,
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
      console.log('VT: Excluindo oferta:', offerId);
      await deleteOffer(offerId);
      toast.success('✅ Oferta excluída!');
    } catch (error) {
      toast.error('❌ Erro ao excluir oferta');
      console.error('VT: Erro ao excluir:', error);
    }
  };

  const columnColors = {
    pending: 'border-yellow-500/30',
    inExecution: 'border-blue-500/30',
    modeling: 'border-purple-500/30',
    activeModeling: 'border-cyan-500/30',
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 px-2">
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
                          {...provided.dragHandleProps}
                          className={`glass border ${columnColors[column.id]} rounded-lg p-4 cursor-move transition-all ${
                            snapshot.isDragging ? 'rotate-2 scale-105 shadow-xl' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <img 
                              src={item.agent === 'sophia' ? 'https://iili.io/KbegFWu.png' : 'https://iili.io/KieLs1V.png'}
                              alt={item.agent === 'sophia' ? 'Sophia Fênix' : 'Sofia Universal'}
                              className="w-8 h-8 rounded-full object-cover border border-purple-500/50"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'inline-block';
                              }}
                            />
                            <span className="text-2xl" style={{ display: 'none' }}>{item.agent === 'sophia' ? '🔥' : '🌟'}</span>
                            <span className="text-xs text-purple-400 font-semibold">
                              {item.agent === 'sophia' ? 'Sophia Fênix' : 'Sofia Universal'}
                            </span>
                          </div>
                          
                          <h4 className="font-bold mb-1 text-white">{item.title}</h4>
                          
                          {item.subtitle && (
                            <p className="text-xs text-gray-400 mb-2 line-clamp-2">{item.subtitle}</p>
                          )}
                          
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(item.date)}</span>
                          </div>
                          
                          {/* VT: Badge "OFERTA MODELADA" (10+ criativos em 7 dias) */}
                          {item.isModeledOffer && (
                            <div className="mb-3">
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold shadow-lg">
                                🏆 OFERTA MODELADA
                              </span>
                            </div>
                          )}
                          
                          {/* VT: ÁREA VISUAL DE MODELAGEM (quando tem dados preenchidos) */}
                          {item.modeling && (item.modeling.fanpageUrl || item.modeling.salesPageUrl || item.modeling.creativesCount > 0) && (
                            <div className="mb-3 p-3 glass border border-cyan-500/30 rounded-lg bg-cyan-900/10">
                              <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-4 h-4 text-cyan-400" />
                                <span className="text-xs font-bold text-cyan-300">Dados de Modelagem</span>
                              </div>
                              
                              <div className="space-y-1 text-xs">
                                {item.modeling.creativesCount > 0 && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-400">Criativos:</span>
                                    <span className={`font-semibold ${item.modeling.creativesCount >= 10 ? 'text-green-400' : 'text-white'}`}>
                                      {item.modeling.creativesCount}/10
                                    </span>
                                  </div>
                                )}
                                
                                {item.modeling.fanpageUrl && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-green-400">✓</span>
                                    <span className="text-green-400 text-xs">Fanpage</span>
                                  </div>
                                )}
                                
                                {item.modeling.salesPageUrl && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-green-400">✓</span>
                                    <span className="text-green-400 text-xs">PV</span>
                                  </div>
                                )}
                                
                                {item.modeling.checkoutUrl && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-green-400">✓</span>
                                    <span className="text-green-400 text-xs">Checkout</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* VT: Info e barra de progresso para modelagem */}
                          {column.id === 'modeling' && item.modeling && (
                            <div className="mb-3 space-y-2">
                              {/* Badges */}
                              <div className="flex gap-2 flex-wrap">
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
                                {item.modeling.trend === 'subindo' && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
                                    📈 Subindo
                                  </span>
                                )}
                                {item.modeling.trend === 'estavel' && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs">
                                    ➡️ Estável
                                  </span>
                                )}
                              </div>
                              
                              {/* Barra de progresso */}
                              {item.modeling.monitorStart && (
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-xs text-gray-400">
                                    <span>Monitoramento</span>
                                    <span>{item.modeling.monitorDays || 7} dias</span>
                                  </div>
                                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                                      style={{ 
                                        width: `${Math.min(100, ((Date.now() - new Date(item.modeling.monitorStart).getTime()) / (item.modeling.monitorDays * 24 * 60 * 60 * 1000)) * 100)}%` 
                                      }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* VT: Botões de ação */}
                          <div className="flex gap-2 mt-3 pt-3 border-t border-white/10">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('VT: Clicou em Editar, ID:', item.id);
                                if (onEditOffer) {
                                  onEditOffer(item.id);
                                } else {
                                  console.error('VT: onEditOffer não está definido!');
                                  toast.error('Erro ao abrir editor');
                                }
                              }}
                              className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-sm transition-colors"
                            >
                              <Edit2 className="w-3 h-3" />
                              Editar
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('VT: Clicou em Excluir, ID:', item.id, 'Título:', item.title);
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
