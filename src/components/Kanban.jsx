import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Calendar, Edit2, Trash2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import { subscribeToUserOffers, updateOffer, deleteOffer, duplicateOfferForModeling } from '../services/offersService';

const Kanban = ({ onEditOffer }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const STATUS_MAP = {
    pendente: 'pending',
    execucao: 'inExecution',
    modelando: 'modeling',
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

  useEffect(() => {
    if (!user?.id) return;
    const unsubscribe = subscribeToUserOffers(user.id, (updatedOffers) => {
      setOffers(updatedOffers.filter(offer => offer.type === 'oferta'));
      organizeOffersByStatus(updatedOffers.filter(offer => offer.type === 'oferta'));
      setLoading(false);
    }, 'oferta'); 

    return () => unsubscribe();
  }, [user?.id]);

  const organizeOffersByStatus = (allOffers) => {
    const organized = {
      pending: { ...columns.pending, items: [] },
      inExecution: { ...columns.inExecution, items: [] },
      modeling: { ...columns.modeling, items: [] },
      completed: { ...columns.completed, items: [] },
    };

    allOffers.forEach((offer) => {
      const columnId = STATUS_MAP[offer.status] || 'pending';
      organized[columnId].items.push({
        id: offer.id,
        title: offer.title,
        subtitle: offer.subtitle || offer.copy?.adDescription || '',
        status: offer.status,
        type: offer.type || 'oferta',
      });
    });

    setColumns(organized);
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    const sourceItems = [...sourceColumn.items];
    const destItems = [...destColumn.items];

    const [removed] = sourceItems.splice(source.index, 1);
    destItems.splice(destination.index, 0, removed);

    setColumns({
      ...columns,
      [source.droppableId]: { ...sourceColumn, items: sourceItems },
      [destination.droppableId]: { ...destColumn, items: destItems },
    });

    try {
      const newStatus = REVERSE_STATUS_MAP[destination.droppableId];
      await updateOffer(draggableId, { status: newStatus });
      toast.success('Oferta movida com sucesso!');
    } catch (error) {
      toast.error('Erro ao mover oferta');
      console.error('Erro ao atualizar status:', error);
    }
  };

  const handleDelete = async (offerId, offerTitle) => {
    if (!window.confirm(`Tem certeza que deseja excluir "${offerTitle}"?`)) return;
    try {
      await deleteOffer(offerId);
      toast.success('✅ Oferta excluída!');
    } catch (error) {
      toast.error('❌ Erro ao excluir oferta');
      console.error('Erro ao excluir:', error);
    }
  };

  const handleDuplicate = async (offerId) => {
    const originalOffer = offers.find((offer) => offer.id === offerId);
    if (!originalOffer) {
      toast.error('Oferta não encontrada para duplicação');
      return;
    }

    try {
      await duplicateOfferForModeling(originalOffer);
      toast.success('Oferta duplicada para modelagem!');
    } catch (error) {
      toast.error('Erro ao duplicar oferta');
      console.error('Erro ao duplicar oferta para modelagem:', error);
    }
  };

  if (loading) {
    return <div>Carregando ofertas...</div>;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 px-2">
        {Object.values(columns).map((column) => (
          <div key={column.id} className="space-y-3">
            <h3 className="font-bold text-lg px-2">{column.title}</h3>
            <Droppable droppableId={column.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-3 min-h-[400px] p-3 rounded-xl"
                >
                  {column.items.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                      <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-sm">Nenhuma oferta</p>
                    </div>
                  )}
                  {column.items.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="p-4 border border-gray-200 rounded-lg"
                        >
                          <h4 className="font-bold mb-1">{item.title}</h4>
                          <p className="text-xs text-gray-400">{item.subtitle}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                            <Calendar className="w-3 h-3" />
                            <span>{item.date}</span>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => handleDelete(item.id, item.title)}
                              className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 text-sm transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                              Excluir
                            </button>
                            <button
                              onClick={() => handleDuplicate(item.id)}
                              className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-sm transition-colors"
                            >
                              Duplicar para Modelagem
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
