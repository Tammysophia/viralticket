import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Calendar, Sparkles } from 'lucide-react';
import Card from './Card';
import { useLanguage } from '../hooks/useLanguage';
import { formatDate } from '../utils/validation';

const Kanban = () => {
  const { t } = useLanguage();
  
  const [columns, setColumns] = useState({
    pending: {
      id: 'pending',
      title: t('pending'),
      items: [
        {
          id: '1',
          title: 'Oferta de Emagrecimento',
          agent: 'Sophia Fênix 🔥',
          date: new Date().toISOString(),
        },
      ],
    },
    inExecution: {
      id: 'inExecution',
      title: t('inExecution'),
      items: [
        {
          id: '2',
          title: 'Curso de Marketing Digital',
          agent: 'Sofia Universal 🌟',
          date: new Date().toISOString(),
        },
      ],
    },
    modeling: {
      id: 'modeling',
      title: t('modeling'),
      items: [
        {
          id: '3',
          title: 'Mentoria de Vendas',
          agent: 'Sophia Fênix 🔥',
          date: new Date().toISOString(),
        },
      ],
    },
    completed: {
      id: 'completed',
      title: t('completed'),
      items: [
        {
          id: '4',
          title: 'Infoproduto de Finanças',
          agent: 'Sofia Universal 🌟',
          date: new Date().toISOString(),
        },
      ],
    },
  });

  const onDragEnd = (result) => {
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
  };

  const columnColors = {
    pending: 'border-yellow-500/30 hover:border-yellow-500/50',
    inExecution: 'border-blue-500/30 hover:border-blue-500/50',
    modeling: 'border-primary-purple/30 hover:border-primary-lilac/50',
    completed: 'border-green-500/30 hover:border-green-500/50',
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.values(columns).map((column) => (
          <div key={column.id} className="space-y-3">
            <h3 className="font-bold text-lg px-2">{column.title}</h3>
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
                          {...provided.dragHandleProps}
                          className={`glass-dark border ${columnColors[column.id]} rounded-lg p-4 cursor-move transition-all shadow-md ${
                            snapshot.isDragging ? 'rotate-2 scale-105 shadow-2xl shadow-primary-lilac/30' : 'hover:shadow-lg hover:shadow-primary-purple/20'
                          }`}
                        >
                          <h4 className="font-bold mb-2">{item.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
                            <Sparkles className="w-4 h-4" />
                            <span>{item.agent}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(item.date)}</span>
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
