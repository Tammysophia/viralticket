import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from './Toast';
import OfferCard from './OfferCard';
import ModelingModal from './ModelingModal';
import {
  getAllOffers,
  updateOffer,
  deleteOffer,
  addModeling,
  subscribeToOffers,
} from '../firebase/offers';

const Kanban = () => {
  const { t } = useLanguage();
  const { success } = useToast();
  const [columns, setColumns] = useState({
    pending: { id: 'pending', title: t('pending'), items: [] },
    inExecution: { id: 'inExecution', title: t('inExecution'), items: [] },
    modeling: { id: 'modeling', title: t('modeling'), items: [] },
    completed: { id: 'completed', title: t('completed'), items: [] },
  });
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showModelingModal, setShowModelingModal] = useState(false);

  // Load offers from Firebase
  useEffect(() => {
    const loadOffers = async () => {
      try {
        const offers = await getAllOffers();
        setColumns({
          pending: { ...columns.pending, items: offers.pending || [] },
          inExecution: { ...columns.inExecution, items: offers.inExecution || [] },
          modeling: { ...columns.modeling, items: offers.modeling || [] },
          completed: { ...columns.completed, items: offers.completed || [] },
        });
      } catch (error) {
        console.error('Error loading offers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOffers();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToOffers((updatedOffers) => {
      setColumns({
        pending: { ...columns.pending, items: updatedOffers.pending || [] },
        inExecution: { ...columns.inExecution, items: updatedOffers.inExecution || [] },
        modeling: { ...columns.modeling, items: updatedOffers.modeling || [] },
        completed: { ...columns.completed, items: updatedOffers.completed || [] },
      });
    });

    return () => unsubscribe();
  }, []);

  const onDragEnd = async (result) => {
    const { source, destination } = result;

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

    // Update local state immediately for smooth UX
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

    // Update in Firebase
    try {
      await updateOffer(removed.id, { status: destination.droppableId });
      success('✔️ Status atualizado');
    } catch (error) {
      console.error('Error updating offer:', error);
    }
  };

  const handleDeleteOffer = async (offerId) => {
    try {
      await deleteOffer(offerId);
      success('Oferta excluída com sucesso');
    } catch (error) {
      console.error('Error deleting offer:', error);
    }
  };

  const handleUpdateOffer = async (offerId, updates) => {
    try {
      await updateOffer(offerId, updates);
    } catch (error) {
      console.error('Error updating offer:', error);
    }
  };

  const handleStartModeling = (offer) => {
    setSelectedOffer(offer);
    setShowModelingModal(true);
  };

  const handleSaveModeling = async (offerId, modelingData) => {
    try {
      await addModeling(offerId, modelingData);
      setShowModelingModal(false);
      success('Modelagem iniciada com sucesso! 📈');
    } catch (error) {
      console.error('Error adding modeling:', error);
    }
  };

  const columnColors = {
    pending: 'border-yellow-500/30 hover:border-yellow-500/50',
    inExecution: 'border-blue-500/30 hover:border-blue-500/50',
    modeling: 'border-primary-purple/30 hover:border-primary-lilac/50',
    completed: 'border-green-500/30 hover:border-green-500/50',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Carregando ofertas...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.values(columns).map((column) => (
            <div key={column.id} className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-bold text-lg">{column.title}</h3>
                <span className="text-xs text-zinc-500 bg-white/5 px-2 py-1 rounded-full">
                  {column.items.length}
                </span>
              </div>
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-3 min-h-[400px] p-3 rounded-xl border-2 border-dashed transition-colors bg-black/10 ${
                      snapshot.isDraggingOver ? 'border-primary-lilac bg-primary-lilac/10' : 'border-white/5'
                    }`}
                  >
                    {column.items.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                          >
                            <OfferCard
                              offer={item}
                              columnColor={columnColors[column.id]}
                              isDragging={snapshot.isDragging}
                              dragHandleProps={provided.dragHandleProps}
                              onDelete={handleDeleteOffer}
                              onUpdate={handleUpdateOffer}
                              onStartModeling={handleStartModeling}
                            />
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

      {selectedOffer && (
        <ModelingModal
          isOpen={showModelingModal}
          onClose={() => setShowModelingModal(false)}
          offer={selectedOffer}
          onSave={handleSaveModeling}
        />
      )}
    </>
  );
};

export default Kanban;
