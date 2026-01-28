import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Calendar, Edit2, Trash2, AlertCircle, Zap, Layers, RefreshCw, Globe } from 'lucide-react';
import Card from './Card';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils/validation';
import toast from 'react-hot-toast';
import { getUserOffers, updateOffer, deleteOffer } from '../services/offersService';

const Kanban = ({ onEditOffer }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [columns, setColumns] = useState({
    pendente: { id: 'pendente', title: 'Pendente', items: [] },
    execucao: { id: 'execucao', title: 'Em Execução', items: [] },
    modelando: { id: 'modelando', title: 'Modelando', items: [] },
    concluido: { id: 'concluido', title: 'Concluído', items: [] },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) loadOffers();
  }, [user?.id]);

  const loadOffers = async () => {
    setLoading(true);
    try {
      const offers = await getUserOffers(user.id);
      const organized = {
        pendente: { id: 'pendente', title: 'Pendente', items: [] },
        execucao: { id: 'execucao', title: 'Em Execução', items: [] },
        modelando: { id: 'modelando', title: 'Modelando', items: [] },
        concluido: { id: 'concluido', title: 'Concluído', items: [] },
      };

      offers.forEach(offer => {
        const status = offer.status || 'pendente';
        if (organized[status]) organized[status].items.push(offer);
      });

      setColumns(organized);
    } catch (err) {
      toast.error('Erro ao carregar Kanban');
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceCol = columns[source.droppableId];
    const destCol = columns[destination.droppableId];
    const sourceItems = [...sourceCol.items];
    const destItems = [...destCol.items];
    const [removed] = sourceItems.splice(source.index, 1);
    destItems.splice(destination.index, 0, removed);

    setColumns({
      ...columns,
      [source.droppableId]: { ...sourceCol, items: sourceItems },
      [destination.droppableId]: { ...destCol, items: destItems },
    });

    try {
      await updateOffer(draggableId, { status: destination.droppableId });
      toast.success('Status atualizado!');
    } catch (err) {
      toast.error('Erro ao salvar status');
      loadOffers();
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'modelagem': return <Layers size={14} className="text-blue-400" />;
      case 'recuperacao': return <RefreshCw size={14} className="text-orange-400" />;
      case 'traducao': return <Globe size={14} className="text-green-400" />;
      default: return <Zap size={14} className="text-purple-400" />;
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-400">Carregando Kanban...</div>;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {Object.values(columns).map((column) => (
          <div key={column.id} className="flex flex-col gap-3">
            <h3 className="font-bold text-sm uppercase tracking-wider text-gray-500 px-2 flex items-center justify-between">
              {column.title}
              <span className="bg-white/5 px-2 py-0.5 rounded text-xs">{column.items.length}</span>
            </h3>
            
            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`min-h-[500px] p-2 rounded-xl border-2 border-dashed transition-all ${
                    snapshot.isDraggingOver ? 'border-purple-500/50 bg-purple-500/5' : 'border-white/5 bg-black/10'
                  }`}
                >
                  {column.items.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`glass border border-white/10 rounded-lg p-4 mb-3 transition-all ${
                            snapshot.isDragging ? 'shadow-2xl shadow-purple-500/20 scale-105' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tighter">
                              {getTypeIcon(item.type)}
                              {item.type || 'oferta'}
                            </div>
                            <span className="text-[10px] text-gray-500">{formatDate(item.updatedAt)}</span>
                          </div>
                          
                          <h4 className="font-bold text-white text-sm mb-1 line-clamp-2">{item.title}</h4>
                          <p className="text-xs text-gray-400 line-clamp-2 mb-4">{item.agent === 'sophia' ? '🔥 Sophia Fênix' : '🌟 Sofia Universal'}</p>
                          
                          <div className="flex gap-2 border-t border-white/5 pt-3">
                            <button onClick={() => onEditOffer(item.id, item)} className="flex-1 p-2 rounded bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 transition-all">
                              <Edit2 size={14} className="mx-auto" />
                            </button>
                            <button onClick={async () => { if(confirm('Excluir?')) { await deleteOffer(item.id); loadOffers(); } }} className="flex-1 p-2 rounded bg-red-600/10 hover:bg-red-600/20 text-red-400 transition-all">
                              <Trash2 size={14} className="mx-auto" />
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
