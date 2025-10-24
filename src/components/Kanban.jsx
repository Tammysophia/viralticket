import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Calendar, Sparkles, Trash2, Edit, Copy, Loader2 } from 'lucide-react';
import Card from './Card';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import { useToast } from './Toast';
import { formatDate } from '../utils/validation';
import { getUserOffers, updateOffer, deleteOffer, duplicateOffer } from '../firebase/offers';

const Kanban = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  
  const [columns, setColumns] = useState({
    todo: {
      id: 'todo',
      title: 'A Fazer',
      items: [],
    },
    'in-progress': {
      id: 'in-progress',
      title: 'Em Execução',
      items: [],
    },
    review: {
      id: 'review',
      title: 'Em Revisão',
      items: [],
    },
    done: {
      id: 'done',
      title: 'Concluído',
      items: [],
    },
  });

  useEffect(() => {
    if (user) {
      loadOffers();
    }
  }, [user]);

  const loadOffers = async () => {
    try {
      setLoading(true);
      
      const offers = await getUserOffers(user.id);
      
      // Organizar ofertas por status
      const organized = {
        todo: { id: 'todo', title: 'A Fazer', items: [] },
        'in-progress': { id: 'in-progress', title: 'Em Execução', items: [] },
        review: { id: 'review', title: 'Em Revisão', items: [] },
        done: { id: 'done', title: 'Concluído', items: [] },
      };

      offers.forEach((offer) => {
        const status = offer.status || 'todo';
        if (organized[status]) {
          organized[status].items.push({
            id: offer.id,
            title: offer.titulo,
            description: offer.descricao,
            category: offer.categoria,
            agent: offer.geradoPorIA ? '🤖 IA' : '👤 Manual',
            date: offer.criadoEm?.toISOString?.() || new Date().toISOString(),
          });
        }
      });

      setColumns(organized);
    } catch (err) {
      error('Erro ao carregar ofertas');
    } finally {
      setLoading(false);
    }
  };

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

    // Atualizar UI imediatamente
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

    // Atualizar status no Firestore
    try {
      await updateOffer(draggableId, {
        status: destination.droppableId,
      });
      success('Oferta atualizada!');
    } catch (err) {
      error('Erro ao atualizar oferta');
      // Reverter mudanças em caso de erro
      loadOffers();
    }
  };

  const handleDelete = async (offerId) => {
    if (!confirm('Deseja realmente deletar esta oferta?')) return;

    try {
      await deleteOffer(offerId);
      success('Oferta deletada!');
      loadOffers();
    } catch (err) {
      error('Erro ao deletar oferta');
    }
  };

  const handleDuplicate = async (offerId) => {
    try {
      await duplicateOffer(offerId, user.id);
      success('Oferta duplicada!');
      loadOffers();
    } catch (err) {
      error('Erro ao duplicar oferta');
    }
  };

  const columnColors = {
    todo: 'border-yellow-500/30',
    'in-progress': 'border-blue-500/30',
    review: 'border-purple-500/30',
    done: 'border-green-500/30',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-500" />
          <p className="text-gray-400">Carregando ofertas do Firestore...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header com stats */}
      <div className="glass rounded-lg p-4 border border-white/10">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">📊 Kanban de Ofertas</h3>
          <div className="flex gap-4 text-sm">
            <span className="text-gray-400">
              Total: <strong className="text-white">{Object.values(columns).reduce((sum, col) => sum + col.items.length, 0)}</strong>
            </span>
            <span className="text-yellow-400">
              A Fazer: <strong>{columns.todo.items.length}</strong>
            </span>
            <span className="text-blue-400">
              Em Execução: <strong>{columns['in-progress'].items.length}</strong>
            </span>
            <span className="text-green-400">
              Concluído: <strong>{columns.done.items.length}</strong>
            </span>
          </div>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.values(columns).map((column) => (
            <div key={column.id} className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-bold text-lg">{column.title}</h3>
                <span className="text-sm text-gray-400">{column.items.length}</span>
              </div>
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-3 min-h-[400px] p-3 rounded-xl border-2 border-dashed transition-colors ${
                      snapshot.isDraggingOver ? 'border-purple-500 bg-purple-500/5' : 'border-white/10'
                    }`}
                  >
                    {column.items.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`glass border ${columnColors[column.id]} rounded-lg p-4 cursor-move transition-all group ${
                              snapshot.isDragging ? 'rotate-2 scale-105 shadow-xl' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-bold flex-1 pr-2">{item.title}</h4>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDuplicate(item.id);
                                  }}
                                  className="p-1 hover:bg-white/10 rounded"
                                  title="Duplicar"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(item.id);
                                  }}
                                  className="p-1 hover:bg-red-500/20 rounded text-red-400"
                                  title="Deletar"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            
                            {item.description && (
                              <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                                {item.description}
                              </p>
                            )}
                            
                            {item.category && (
                              <span className="inline-block px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full mb-2">
                                {item.category}
                              </span>
                            )}
                            
                            <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                              <Sparkles className="w-4 h-4" />
                              <span>{item.agent}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(item.date)}</span>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    
                    {column.items.length === 0 && (
                      <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
                        Arraste ofertas para cá
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default Kanban;
