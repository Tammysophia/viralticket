// VT: Kanban integrado com Firestore em tempo real
import { useState, useEffect, useMemo, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  Calendar,
  Sparkles,
  Edit2,
  Trash2,
  AlertCircle,
  Filter,
  Link as LinkIcon,
  Youtube,
  TrendingUp,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import Card from './Card';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils/validation';
import toast from 'react-hot-toast';
import { subscribeToUserOffers, updateOffer, deleteOffer } from '../services/offersService';

const toDate = (value) => {
  if (!value) return null;
  if (typeof value.toDate === 'function') {
    return value.toDate();
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const ensureDate = (value) => toDate(value) || new Date();

const MonitoringProgress = ({ monitorStart, monitorDays = 7 }) => {
  const startDate = ensureDate(monitorStart);
  const totalDays = Number.isFinite(Number(monitorDays)) && Number(monitorDays) > 0 ? Number(monitorDays) : 7;
  const now = new Date();
  const elapsedMs = now.getTime() - startDate.getTime();
  const totalMs = totalDays * 24 * 60 * 60 * 1000;
  const progressPercent = Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100));
  const elapsedDays = Math.min(totalDays, Math.max(0, Math.floor(elapsedMs / (24 * 60 * 60 * 1000))));
  const gradientClass =
    progressPercent >= 75
      ? 'from-green-500 via-emerald-500 to-green-400'
      : progressPercent >= 40
        ? 'from-yellow-500 via-amber-500 to-orange-400'
        : 'from-purple-500 via-fuchsia-500 to-pink-500';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>
          {elapsedDays}/{totalDays} dias
        </span>
        <span>{Math.round(progressPercent)}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${gradientClass}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <p className="text-[11px] text-gray-500">
        Início: {formatDate(startDate)}
      </p>
    </div>
  );
};

const Kanban = ({ onEditOffer }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAgent, setFilterAgent] = useState('all');
  const [editingCardId, setEditingCardId] = useState(null);
  const [editDraft, setEditDraft] = useState({ title: '', description: '' });
  const [savingCardId, setSavingCardId] = useState(null);

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

  const AGENT_OPTIONS = useMemo(
    () => ({
      sophia: { id: 'sophia', label: 'Sophia Fênix', emoji: '🔥' },
      sofia: { id: 'sofia', label: 'Sofia Universal', emoji: '🌟' },
    }),
    []
  );

  const AGENT_FILTERS = useMemo(
    () => [
      { id: 'all', label: 'Todas as IAs' },
      { id: 'sophia', label: 'Sophia Fênix 🔥' },
      { id: 'sofia', label: 'Sofia Universal 🌟' },
    ],
    []
  );

  const TREND_STYLES = useMemo(
    () => ({
      subindo: {
        label: 'Crescendo',
        className: 'bg-green-500/15 text-green-300',
        icon: <TrendingUp className="w-3 h-3" />,
      },
      estavel: {
        label: 'Estável',
        className: 'bg-yellow-500/15 text-yellow-300',
        icon: <TrendingUp className="w-3 h-3 rotate-90" />,
      },
      caindo: {
        label: 'Caindo',
        className: 'bg-red-500/15 text-red-300',
        icon: <TrendingUp className="w-3 h-3 rotate-180" />,
      },
    }),
    []
  );

  const normalizeAgent = useCallback(
    (agent) => {
      if (!agent) return 'unknown';
      const formatted = `${agent}`.toLowerCase();
      if (formatted.includes('fênix') || formatted.includes('fenix') || formatted.includes('sophia')) {
        return 'sophia';
      }
      if (formatted.includes('universal') || formatted.includes('sofia')) {
        return 'sofia';
      }
      return agent;
    },
    []
  );

  const getAgentDisplay = useCallback(
    (agent) => {
      const normalized = normalizeAgent(agent);
      if (AGENT_OPTIONS[normalized]) {
        return AGENT_OPTIONS[normalized];
      }
      if (!agent) {
        return { id: 'unknown', label: 'IA Desconhecida', emoji: '🤖' };
      }
      return { id: normalized, label: agent, emoji: '🤖' };
    },
    [AGENT_OPTIONS, normalizeAgent]
  );

  const columnTitles = useMemo(
    () => ({
      pending: t('pending') || 'Pendente',
      inExecution: t('inExecution') || 'Em Execução',
      modeling: t('modeling') || 'Modelando',
      completed: t('completed') || 'Concluído',
    }),
    [t]
  );

  const buildColumnsTemplate = useCallback(
    () => ({
      pending: {
        id: 'pending',
        title: columnTitles.pending,
        items: [],
      },
      inExecution: {
        id: 'inExecution',
        title: columnTitles.inExecution,
        items: [],
      },
      modeling: {
        id: 'modeling',
        title: columnTitles.modeling,
        items: [],
      },
      completed: {
        id: 'completed',
        title: columnTitles.completed,
        items: [],
      },
    }),
    [columnTitles]
  );

  // VT: Estrutura de colunas
  const [columns, setColumns] = useState(() => buildColumnsTemplate());

  useEffect(() => {
    setColumns((prev) => {
      const template = buildColumnsTemplate();
      return Object.keys(template).reduce((acc, key) => {
        acc[key] = {
          ...template[key],
          items: prev[key]?.items || [],
        };
        return acc;
      }, {});
    });
  }, [buildColumnsTemplate]);

  // VT: Listener em tempo real do Firestore
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = subscribeToUserOffers(user.id, (updatedOffers) => {
      setOffers(updatedOffers);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.id]);

  // VT: Organizar ofertas por status
  const organizeOffersByStatus = useCallback(
    (allOffers) => {
      const template = buildColumnsTemplate();

      const sortedOffers = [...allOffers].sort((a, b) => {
        const dateA = ensureDate(a.updatedAt) || ensureDate(a.createdAt);
        const dateB = ensureDate(b.updatedAt) || ensureDate(b.createdAt);
        return (dateB?.getTime?.() || 0) - (dateA?.getTime?.() || 0);
      });

      sortedOffers.forEach((offer) => {
        const columnId = STATUS_MAP[offer.status] || 'pending';
        const agentMeta = getAgentDisplay(offer.agent);
        const normalizedAgent = agentMeta.id;

        if (filterAgent !== 'all' && normalizedAgent !== filterAgent) {
          return;
        }

        const createdAt = ensureDate(offer.createdAt);
        const youtubeLinks = Array.isArray(offer.youtubeLinks) ? offer.youtubeLinks : [];
        const copyData = offer.copy || {};
        const modelingData = offer.modeling || {};

        template[columnId].items.push({
          id: offer.id,
          title: offer.title || 'Oferta sem título',
          description: copyData.adDescription || offer.description || '',
          agent: agentMeta,
          date: createdAt,
          status: offer.status,
          modeling: modelingData,
          copy: copyData,
          youtubeLinks,
        });
      });

      setColumns(template);
    },
    [buildColumnsTemplate, filterAgent, getAgentDisplay]
  );

  useEffect(() => {
    organizeOffersByStatus(offers);
  }, [offers, organizeOffersByStatus]);

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
      setOffers((prev) =>
        prev.map((offer) =>
          offer.id === draggableId
            ? {
                ...offer,
                status: newStatus,
              }
            : offer
        )
      );
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

  const handleStartEditing = (item) => {
    setEditingCardId(item.id);
    setEditDraft({
      title: item.title,
      description: item.description || '',
    });
  };

  const handleCancelEditing = () => {
    setEditingCardId(null);
    setEditDraft({ title: '', description: '' });
  };

  const handleSaveEditing = async (item) => {
    if (!editDraft.title.trim()) {
      toast.error('Informe um título para a oferta');
      return;
    }

    const trimmedTitle = editDraft.title.trim();
    const descriptionValue = editDraft.description.trim();
    const updatedCopy = {
      ...item.copy,
      adDescription: descriptionValue,
    };

    setSavingCardId(item.id);

    try {
      await updateOffer(item.id, {
        title: trimmedTitle,
        copy: updatedCopy,
      });

      setOffers((prev) =>
        prev.map((offer) =>
          offer.id === item.id
            ? {
                ...offer,
                title: trimmedTitle,
                copy: updatedCopy,
              }
            : offer
        )
      );

      toast.success('Oferta atualizada com sucesso!');
      handleCancelEditing();
    } catch (error) {
      toast.error('Erro ao atualizar oferta');
      console.error('VT: Erro ao salvar edição:', error);
    } finally {
      setSavingCardId(null);
    }
  };

  const totalVisibleCards = useMemo(
    () => Object.values(columns).reduce((acc, column) => acc + column.items.length, 0),
    [columns]
  );

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
      <div className="space-y-4">
        <Card>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Filter className="w-4 h-4" />
              <span>Filtrar por IA</span>
              <span className="text-xs text-gray-500">{totalVisibleCards} ofertas visíveis</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {AGENT_FILTERS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setFilterAgent(option.id)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
                    filterAgent === option.id
                      ? 'bg-purple-600/30 text-purple-200 border-purple-500/40'
                      : 'hover:bg-white/5 text-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

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
                        {(provided, snapshot) => {
                          const isEditing = editingCardId === item.id;
                          return (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...(isEditing ? {} : provided.dragHandleProps)}
                              className={`glass border ${columnColors[column.id]} rounded-lg p-4 transition-all ${
                                snapshot.isDragging ? 'rotate-2 scale-105 shadow-xl' : ''
                              } ${isEditing ? 'ring-1 ring-purple-400/60 cursor-default' : 'cursor-move'}`}
                            >
                              {isEditing ? (
                                <div className="space-y-3">
                                  <input
                                    type="text"
                                    value={editDraft.title}
                                    onChange={(e) =>
                                      setEditDraft((prev) => ({ ...prev, title: e.target.value }))
                                    }
                                    className="w-full glass border border-purple-500/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/60"
                                    placeholder="Título da oferta"
                                  />
                                  <textarea
                                    value={editDraft.description}
                                    onChange={(e) =>
                                      setEditDraft((prev) => ({ ...prev, description: e.target.value }))
                                    }
                                    className="w-full glass border border-white/10 rounded-lg px-3 py-2 text-sm h-28 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/60"
                                    placeholder="Descrição / observações"
                                  />
                                  <div className="flex justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={handleCancelEditing}
                                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                                    >
                                      <X className="w-3 h-3" />
                                      Cancelar
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSaveEditing(item)}
                                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-purple-600/70 hover:bg-purple-600 text-white transition-colors"
                                      disabled={savingCardId === item.id}
                                    >
                                      {savingCardId === item.id ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <Check className="w-3 h-3" />
                                      )}
                                      Salvar
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <h4 className="font-bold mb-1 leading-tight break-words">
                                        {item.title}
                                      </h4>
                                      <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <Sparkles className="w-4 h-4" />
                                        <span className="font-medium">
                                          {item.agent.label}
                                          {item.agent.emoji ? ` ${item.agent.emoji}` : ''}
                                        </span>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStartEditing(item);
                                      }}
                                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                  </div>

                                  {item.description && (
                                    <p className="text-sm text-gray-300 whitespace-pre-line leading-relaxed line-clamp-4">
                                      {item.description}
                                    </p>
                                  )}

                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Calendar className="w-3 h-3" />
                                    <span>{formatDate(item.date)}</span>
                                  </div>

                                  {item.youtubeLinks.length > 0 && (
                                    <div>
                                      <span className="block text-xs uppercase text-gray-500 tracking-wide mb-1">
                                        Vídeos de origem
                                      </span>
                                      <div className="flex flex-wrap gap-2">
                                        {item.youtubeLinks.slice(0, 3).map((link, idx) => (
                                          <a
                                            key={`${item.id}-youtube-${idx}`}
                                            href={link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/15 text-red-300 text-xs hover:bg-red-500/25 transition-colors"
                                          >
                                            <Youtube className="w-3 h-3" />
                                            Vídeo {idx + 1}
                                          </a>
                                        ))}
                                        {item.youtubeLinks.length > 3 && (
                                          <span className="text-xs text-gray-500">+{item.youtubeLinks.length - 3}</span>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {item.modeling && (
                                    <div className="space-y-2">
                                      {(item.modeling.fanpageUrl || item.modeling.salesPageUrl || item.modeling.checkoutUrl) && (
                                        <div>
                                          <span className="block text-xs uppercase text-gray-500 tracking-wide mb-1">
                                            Links principais
                                          </span>
                                          <div className="space-y-1">
                                            {[
                                              { label: 'Fanpage', url: item.modeling.fanpageUrl },
                                              { label: 'Página de vendas', url: item.modeling.salesPageUrl },
                                              { label: 'Checkout', url: item.modeling.checkoutUrl },
                                            ]
                                              .filter((link) => !!link.url)
                                              .map((link) => (
                                                <a
                                                  key={`${item.id}-${link.label}`}
                                                  href={link.url}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="flex items-center gap-2 text-xs text-purple-300 hover:text-purple-200"
                                                >
                                                  <LinkIcon className="w-3 h-3" />
                                                  {link.label}
                                                </a>
                                              ))}
                                          </div>
                                        </div>
                                      )}

                                      {(item.modeling.modelavel || item.modeling.trend) && (
                                        <div className="flex flex-wrap gap-2">
                                          {item.modeling.modelavel && (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-300 text-xs">
                                              ✅ Modelável
                                            </span>
                                          )}
                                          {item.modeling.trend && TREND_STYLES[item.modeling.trend] && (
                                            <span
                                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${TREND_STYLES[item.modeling.trend].className}`}
                                            >
                                              {TREND_STYLES[item.modeling.trend].icon}
                                              {TREND_STYLES[item.modeling.trend].label}
                                            </span>
                                          )}
                                        </div>
                                      )}

                                      {item.modeling.monitorStart && (
                                        <div>
                                          <span className="block text-xs uppercase text-gray-500 tracking-wide mb-1">
                                            Monitoramento
                                          </span>
                                          <MonitoringProgress
                                            monitorStart={item.modeling.monitorStart}
                                            monitorDays={item.modeling.monitorDays}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  <div className="flex gap-2 pt-3 border-t border-white/10">
                                    {onEditOffer && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onEditOffer(item.id);
                                        }}
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-sm transition-colors"
                                      >
                                        <Edit2 className="w-3 h-3" />
                                        Abrir editor completo
                                      </button>
                                    )}
                                    <button
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
                            </div>
                          );
                        }}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </div>
    </DragDropContext>
  );
};

export default Kanban;
