// VT: Kanban integrado com Firestore em tempo real
import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Calendar, Sparkles, Edit2, Trash2, AlertCircle, Loader2, FileText, Wand2 } from 'lucide-react';
import Card from './Card';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils/validation';
import toast from 'react-hot-toast';
import { subscribeToUserOffers, updateOffer, deleteOffer } from '../services/offersService';

const DEFAULT_STRUCTURE = [
  'Avatar (Público-Alvo)',
  'Promessa Principal',
  'Oferta Matadora',
  'Bullets / Benefícios',
  'Uma linha por benefício',
  'Garantia',
  'Chamada para Checkout',
  'Conteúdo Página de Vendas',
  'Scripts de Vídeos',
  'Conteúdo do Ebook',
  'Resposta Completa da IA'
].join('\n\n');

const Kanban = ({ onEditOffer }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingOfferId, setEditingOfferId] = useState(null);
  const [editingOffer, setEditingOffer] = useState(null);
  const [editingData, setEditingData] = useState({ title: '', kanbanDescription: '' });
  const [editingOriginal, setEditingOriginal] = useState({ title: '', kanbanDescription: '' });
  const [savingCard, setSavingCard] = useState(false);
  const [clearingOfferId, setClearingOfferId] = useState(null);

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

    allOffers.forEach((offer) => {
      const columnId = STATUS_MAP[offer.status] || 'pending';
      organized[columnId].items.push({
        id: offer.id,
        title: offer.title,
        agent: offer.agent || 'IA',
        date: offer.createdAt?.toDate?.() || offer.createdAt || new Date(),
        status: offer.status,
        modeling: offer.modeling,
        kanbanDescription: offer.kanbanDescription || '',
      });
    });

    setColumns(organized);
  };

  useEffect(() => {
    if (!editingOfferId) return;
    const freshOffer = offers.find((offer) => offer.id === editingOfferId) || null;
    setEditingOffer(freshOffer);
  }, [offers, editingOfferId]);

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
    if (!confirm(`Tem certeza que deseja excluir "${offerTitle}"?`)) {
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

  const getOfferById = (id) => offers.find((offer) => offer.id === id);

  const applyLocalOfferUpdate = (offerId, patch) => {
    if (!offerId || !patch || Object.keys(patch).length === 0) {
      return;
    }

    setOffers((prevOffers) =>
      prevOffers.map((offer) =>
        offer.id === offerId ? { ...offer, ...patch } : offer
      )
    );

    setColumns((prevColumns) => {
      const updatedColumns = {};

      Object.entries(prevColumns).forEach(([key, column]) => {
        updatedColumns[key] = {
          ...column,
          items: column.items.map((item) => {
            if (item.id !== offerId) {
              return item;
            }

            return {
              ...item,
              ...(patch.title !== undefined ? { title: patch.title } : {}),
              ...(patch.kanbanDescription !== undefined ? { kanbanDescription: patch.kanbanDescription } : {}),
            };
          }),
        };
      });

      return updatedColumns;
    });
  };

  const startEditing = (item) => {
    const offerData = getOfferById(item.id) || null;
    const initialTitle = offerData?.title || item.title || '';
    const initialDescription = offerData?.kanbanDescription || item.kanbanDescription || '';

    setEditingOfferId(item.id);
    setEditingOffer(offerData);
    setEditingData({ title: initialTitle, kanbanDescription: initialDescription });
    setEditingOriginal({ title: initialTitle, kanbanDescription: initialDescription });
  };

  const cancelEditing = () => {
    setEditingOfferId(null);
    setEditingOffer(null);
    setEditingData({ title: '', kanbanDescription: '' });
    setEditingOriginal({ title: '', kanbanDescription: '' });
    setSavingCard(false);
  };

  const handleLoadStructure = () => {
    if (!editingOfferId) return;

    if (
      editingData.kanbanDescription.trim() &&
      editingData.kanbanDescription.trim() !== DEFAULT_STRUCTURE.trim()
    ) {
      const shouldReplace = confirm('Substituir o conteúdo atual pela estrutura padrão?');
      if (!shouldReplace) return;
    }

    setEditingData((prev) => ({ ...prev, kanbanDescription: DEFAULT_STRUCTURE }));
  };

  const handleLoadOfferContent = () => {
    if (!editingOfferId || !editingOffer) return;

    const sections = [];
    const { copy, modeling } = editingOffer;

    if (copy?.page) {
      sections.push('Conteúdo Página de Vendas', copy.page);
    }
    if (copy?.adPrimary) {
      sections.push('Criativo - Texto Principal', copy.adPrimary);
    }
    if (copy?.adHeadline) {
      sections.push('Headline', copy.adHeadline);
    }
    if (copy?.adDescription) {
      sections.push('Descrição do Anúncio', copy.adDescription);
    }

    if (modeling) {
      const modelingSections = [];
      if (modeling.fanpageUrl) modelingSections.push(`Fanpage: ${modeling.fanpageUrl}`);
      if (modeling.salesPageUrl) modelingSections.push(`Página de Vendas: ${modeling.salesPageUrl}`);
      if (modeling.checkoutUrl) modelingSections.push(`Checkout: ${modeling.checkoutUrl}`);
      if (modeling.creativesCount) modelingSections.push(`Criativos Monitorados: ${modeling.creativesCount}`);
      if (modeling.monitorDays) modelingSections.push(`Dias de Monitoramento: ${modeling.monitorDays}`);
      if (modeling.trend) modelingSections.push(`Tendência: ${modeling.trend}`);

      if (modelingSections.length) {
        sections.push('Modelagem', modelingSections.join('\n'));
      }
    }

    const content = sections.join('\n\n').trim();

    if (!content) {
      toast.error('Nenhum conteúdo gerado disponível para esta oferta.');
      return;
    }

    if (
      editingData.kanbanDescription.trim() &&
      editingData.kanbanDescription.trim() !== content
    ) {
      const shouldReplace = confirm('Substituir o conteúdo atual pelo conteúdo gerado?');
      if (!shouldReplace) return;
    }

    setEditingData((prev) => ({ ...prev, kanbanDescription: content }));
  };

  const handleSaveCard = async () => {
    if (!editingOfferId) return;

    const trimmedTitle = editingData.title.trim();
    const trimmedDescription = editingData.kanbanDescription.trim();
    const patch = {};

    if (trimmedTitle !== editingOriginal.title) {
      patch.title = trimmedTitle;
    }

    if (trimmedDescription !== editingOriginal.kanbanDescription) {
      patch.kanbanDescription = trimmedDescription;
    }

    if (Object.keys(patch).length === 0) {
      toast('Nenhuma alteração para salvar.', { icon: 'ℹ️' });
      cancelEditing();
      return;
    }

    setSavingCard(true);

    try {
      await updateOffer(editingOfferId, patch);
      applyLocalOfferUpdate(editingOfferId, patch);
      toast.success('Card salvo com sucesso!');
      cancelEditing();
    } catch (error) {
      console.error('VT: Erro ao salvar card do Kanban:', error);
      toast.error('Erro ao salvar card');
    } finally {
      setSavingCard(false);
    }
  };

  const handleClearCard = async (item) => {
    if (!item?.id) return;

    if (!item.kanbanDescription) {
      toast('Card já está limpo.', { icon: '🧹' });
      return;
    }

    const confirmed = confirm(`Limpar o conteúdo salvo em "${item.title}"?`);
    if (!confirmed) return;

    setClearingOfferId(item.id);

    try {
      await updateOffer(item.id, { kanbanDescription: '' });
      applyLocalOfferUpdate(item.id, { kanbanDescription: '' });

      if (editingOfferId === item.id) {
        setEditingData((prev) => ({ ...prev, kanbanDescription: '' }));
        setEditingOriginal((prev) => ({ ...prev, kanbanDescription: '' }));
      }

      toast.success('Conteúdo do card limpo!');
    } catch (error) {
      console.error('VT: Erro ao limpar card do Kanban:', error);
      toast.error('Erro ao limpar card');
    } finally {
      setClearingOfferId(null);
    }
  };

  const hasCopyContent = editingOffer?.copy
    ? Object.values(editingOffer.copy).some((value) =>
        typeof value === 'string' ? value.trim().length > 0 : Boolean(value)
      )
    : false;

  const hasModelingContent = editingOffer?.modeling
    ? [
        editingOffer.modeling.fanpageUrl,
        editingOffer.modeling.salesPageUrl,
        editingOffer.modeling.checkoutUrl,
        editingOffer.modeling.creativesCount > 0 ? editingOffer.modeling.creativesCount : null,
        editingOffer.modeling.monitorDays > 0 ? editingOffer.modeling.monitorDays : null,
        editingOffer.modeling.trend,
      ].some(Boolean)
    : false;

  const hasGeneratedContent = hasCopyContent || hasModelingContent;

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
                      <Draggable
                        key={item.id}
                        draggableId={item.id}
                        index={index}
                        isDragDisabled={editingOfferId === item.id}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`glass border ${columnColors[column.id]} rounded-lg p-4 transition-all ${
                              snapshot.isDragging ? 'rotate-2 scale-105 shadow-xl' : ''
                            } ${editingOfferId === item.id ? 'cursor-default' : 'cursor-move'}`}
                          >
                            {editingOfferId === item.id ? (
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">
                                    Título do Card
                                  </label>
                                  <input
                                    value={editingData.title}
                                    onChange={(e) =>
                                      setEditingData((prev) => ({ ...prev, title: e.target.value }))
                                    }
                                    className="w-full glass border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 bg-black/30"
                                    placeholder="Digite o título do card..."
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">
                                    Conteúdo
                                  </label>
                                  <textarea
                                    value={editingData.kanbanDescription}
                                    onChange={(e) =>
                                      setEditingData((prev) => ({
                                        ...prev,
                                        kanbanDescription: e.target.value,
                                      }))
                                    }
                                    className="w-full h-48 glass border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 bg-black/30 resize-none"
                                    placeholder="Cole ou escreva os tópicos da oferta..."
                                  />
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={handleLoadStructure}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-gray-200 hover:bg-white/5 transition-colors"
                                  >
                                    <FileText className="w-3 h-3" />
                                    Estrutura padrão
                                  </button>

                                  {hasGeneratedContent && (
                                    <button
                                      type="button"
                                      onClick={handleLoadOfferContent}
                                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-purple-500/30 text-xs text-purple-200 hover:bg-purple-500/10 transition-colors"
                                    >
                                      <Wand2 className="w-3 h-3" />
                                      Conteúdo da oferta
                                    </button>
                                  )}
                                </div>

                                <div className="flex gap-2 pt-2 border-t border-white/10">
                                  <button
                                    type="button"
                                    onClick={handleSaveCard}
                                    disabled={savingCard}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                  >
                                    {savingCard ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Edit2 className="w-4 h-4" />
                                    )}
                                    Salvar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={cancelEditing}
                                    disabled={savingCard}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-200 text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <h4 className="font-bold mb-2">{item.title}</h4>
                                <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                                  <Sparkles className="w-4 h-4" />
                                  <span>{item.agent}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                                  <Calendar className="w-3 h-3" />
                                  <span>{formatDate(item.date)}</span>
                                </div>

                                {item.kanbanDescription ? (
                                  <div className="mb-3 text-sm text-gray-200 whitespace-pre-wrap bg-white/5 border border-white/10 rounded-lg p-3 max-h-64 overflow-y-auto">
                                    {item.kanbanDescription}
                                  </div>
                                ) : (
                                  <p className="mb-3 text-sm text-gray-500 italic">
                                    Nenhum conteúdo salvo no card ainda.
                                  </p>
                                )}

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

                                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/10">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      startEditing(item);
                                    }}
                                    className="flex-1 min-w-[120px] flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-gray-200 text-sm transition-colors"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                    Editar Card
                                  </button>

                                  {onEditOffer && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onEditOffer(item.id);
                                      }}
                                      className="flex-1 min-w-[120px] flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-sm transition-colors"
                                    >
                                      <Sparkles className="w-3 h-3" />
                                      Editar Oferta
                                    </button>
                                  )}

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleClearCard(item);
                                    }}
                                    disabled={clearingOfferId === item.id}
                                    className="flex-1 min-w-[120px] flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-yellow-600/20 hover:bg-yellow-600/25 text-yellow-200 text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                  >
                                    {clearingOfferId === item.id ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <AlertCircle className="w-3 h-3" />
                                    )}
                                    Limpar
                                  </button>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(item.id, item.title);
                                    }}
                                    className="flex-1 min-w-[120px] flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 text-sm transition-colors"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    Excluir
                                  </button>
                                </div>
                              </>
                            )}
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
