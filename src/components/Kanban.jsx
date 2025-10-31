// VT: Kanban integrado com Firestore em tempo real
import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Calendar, Sparkles, Edit2, Trash2, AlertCircle, TrendingUp, TrendingDown, Youtube, Link as LinkIcon, Check, X, Filter } from 'lucide-react';
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
  const [editingCard, setEditingCard] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [aiFilter, setAiFilter] = useState('all'); // 'all', 'sophia', 'sofia'

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

  // VT: Reaplicar filtro quando mudar
  useEffect(() => {
    if (offers.length > 0) {
      organizeOffersByStatus(offers);
    }
  }, [aiFilter]);

  // VT: Organizar ofertas por status
  const organizeOffersByStatus = (allOffers) => {
    const organized = {
      pending: { ...columns.pending, items: [] },
      inExecution: { ...columns.inExecution, items: [] },
      modeling: { ...columns.modeling, items: [] },
      completed: { ...columns.completed, items: [] },
    };

    allOffers.forEach(offer => {
      // Aplicar filtro por IA
      if (aiFilter !== 'all') {
        const agentName = (offer.agent || '').toLowerCase();
        if (aiFilter === 'sophia' && !agentName.includes('sophia') && !agentName.includes('fênix') && !agentName.includes('fenix')) {
          return;
        }
        if (aiFilter === 'sofia' && !agentName.includes('sofia') && !agentName.includes('universal')) {
          return;
        }
      }

      const columnId = STATUS_MAP[offer.status] || 'pending';
      organized[columnId].items.push({
        id: offer.id,
        title: offer.title,
        description: offer.description || '',
        agent: offer.agent || 'IA',
        date: offer.createdAt?.toDate?.() || offer.createdAt || new Date(),
        status: offer.status,
        modeling: offer.modeling,
        youtubeLink: offer.youtubeLink || '',
        links: offer.links || {},
        performance: offer.performance || 'stable',
        progressDays: offer.progressDays || 0,
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

  // VT: Iniciar edição de card
  const startEditing = (item) => {
    setEditingCard(item.id);
    setEditForm({
      title: item.title,
      description: item.description || '',
      youtubeLink: item.youtubeLink || '',
      fanpageLink: item.links?.fanpage || '',
      checkoutLink: item.links?.checkout || '',
      pageLink: item.links?.page || '',
      performance: item.performance || 'stable',
      progressDays: item.progressDays || 0,
    });
  };

  // VT: Salvar edição
  const saveEdit = async (itemId) => {
    try {
      await updateOffer(itemId, {
        title: editForm.title,
        description: editForm.description,
        youtubeLink: editForm.youtubeLink,
        links: {
          fanpage: editForm.fanpageLink,
          checkout: editForm.checkoutLink,
          page: editForm.pageLink,
        },
        performance: editForm.performance,
        progressDays: parseInt(editForm.progressDays) || 0,
      });
      toast.success('Card atualizado!');
      setEditingCard(null);
      setEditForm({});
    } catch (error) {
      toast.error('Erro ao salvar');
      console.error('VT: Erro ao salvar:', error);
    }
  };

  // VT: Cancelar edição
  const cancelEdit = () => {
    setEditingCard(null);
    setEditForm({});
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
    <div className="space-y-4">
      {/* VT: Filtro por IA */}
      <Card>
        <div className="flex items-center gap-4 p-4">
          <Filter className="w-5 h-5 text-purple-400" />
          <span className="text-sm font-semibold">Filtrar por IA:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setAiFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                aiFilter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setAiFilter('sophia')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                aiFilter === 'sophia'
                  ? 'bg-orange-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Sophia Fênix 🔥
            </button>
            <button
              onClick={() => setAiFilter('sofia')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                aiFilter === 'sofia'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Sofia Universal 🌟
            </button>
          </div>
        </div>
      </Card>

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
                          {...provided.dragHandleProps}
                          className={`glass border ${columnColors[column.id]} rounded-lg p-4 cursor-move transition-all ${
                            snapshot.isDragging ? 'rotate-2 scale-105 shadow-xl' : ''
                          }`}
                        >
                          {editingCard === item.id ? (
                            // VT: Modo de edição
                            <div className="space-y-3">
                              <input
                                type="text"
                                value={editForm.title}
                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                                placeholder="Título"
                              />
                              <textarea
                                value={editForm.description}
                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm focus:outline-none focus:border-purple-500 resize-none"
                                placeholder="Descrição"
                                rows="2"
                              />
                              
                              {/* VT: Link do YouTube */}
                              <div className="flex items-center gap-2">
                                <Youtube className="w-4 h-4 text-red-400" />
                                <input
                                  type="url"
                                  value={editForm.youtubeLink}
                                  onChange={(e) => setEditForm({ ...editForm, youtubeLink: e.target.value })}
                                  className="flex-1 px-2 py-1 bg-white/10 border border-white/20 rounded text-xs focus:outline-none focus:border-purple-500"
                                  placeholder="Link YouTube"
                                />
                              </div>
                              
                              {/* VT: Links adicionais */}
                              <div className="space-y-2">
                                <input
                                  type="url"
                                  value={editForm.fanpageLink}
                                  onChange={(e) => setEditForm({ ...editForm, fanpageLink: e.target.value })}
                                  className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-xs focus:outline-none focus:border-purple-500"
                                  placeholder="🌐 Link Fanpage"
                                />
                                <input
                                  type="url"
                                  value={editForm.checkoutLink}
                                  onChange={(e) => setEditForm({ ...editForm, checkoutLink: e.target.value })}
                                  className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-xs focus:outline-none focus:border-purple-500"
                                  placeholder="💳 Link Checkout"
                                />
                                <input
                                  type="url"
                                  value={editForm.pageLink}
                                  onChange={(e) => setEditForm({ ...editForm, pageLink: e.target.value })}
                                  className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-xs focus:outline-none focus:border-purple-500"
                                  placeholder="📄 Página Modelada"
                                />
                              </div>
                              
                              {/* VT: Performance */}
                              <select
                                value={editForm.performance}
                                onChange={(e) => setEditForm({ ...editForm, performance: e.target.value })}
                                className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-xs focus:outline-none focus:border-purple-500"
                              >
                                <option value="stable">📊 Estável</option>
                                <option value="growing">📈 Crescendo</option>
                                <option value="falling">📉 Caindo</option>
                              </select>
                              
                              {/* VT: Progresso 7 dias */}
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">Progresso:</span>
                                <input
                                  type="number"
                                  min="0"
                                  max="7"
                                  value={editForm.progressDays}
                                  onChange={(e) => setEditForm({ ...editForm, progressDays: e.target.value })}
                                  className="flex-1 px-2 py-1 bg-white/10 border border-white/20 rounded text-xs focus:outline-none focus:border-purple-500"
                                />
                                <span className="text-xs text-gray-400">/ 7 dias</span>
                              </div>
                              
                              {/* VT: Botões de salvar/cancelar */}
                              <div className="flex gap-2 pt-2">
                                <button
                                  onClick={() => saveEdit(item.id)}
                                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-green-600/20 hover:bg-green-600/30 text-green-300 text-sm transition-colors"
                                >
                                  <Check className="w-3 h-3" />
                                  Salvar
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 text-sm transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            // VT: Modo de visualização
                            <>
                              <h4 className="font-bold mb-2">{item.title}</h4>
                              {item.description && (
                                <p className="text-xs text-gray-400 mb-2">{item.description}</p>
                              )}
                              
                              <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                                <Sparkles className="w-4 h-4" />
                                <span>{item.agent}</span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                                <Calendar className="w-3 h-3" />
                                <span>{formatDate(item.date)}</span>
                              </div>
                              
                              {/* VT: Link do YouTube */}
                              {item.youtubeLink && (
                                <a
                                  href={item.youtubeLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 mb-2"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Youtube className="w-3 h-3" />
                                  <span className="truncate">Vídeo YouTube</span>
                                </a>
                              )}
                              
                              {/* VT: Links adicionais */}
                              {(item.links?.fanpage || item.links?.checkout || item.links?.page) && (
                                <div className="space-y-1 mb-2">
                                  {item.links?.fanpage && (
                                    <a
                                      href={item.links.fanpage}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <LinkIcon className="w-3 h-3" />
                                      <span className="truncate">Fanpage</span>
                                    </a>
                                  )}
                                  {item.links?.checkout && (
                                    <a
                                      href={item.links.checkout}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <LinkIcon className="w-3 h-3" />
                                      <span className="truncate">Checkout</span>
                                    </a>
                                  )}
                                  {item.links?.page && (
                                    <a
                                      href={item.links.page}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <LinkIcon className="w-3 h-3" />
                                      <span className="truncate">Página</span>
                                    </a>
                                  )}
                                </div>
                              )}
                              
                              {/* VT: Performance */}
                              {item.performance && item.performance !== 'stable' && (
                                <div className="flex items-center gap-1 mb-2">
                                  {item.performance === 'growing' ? (
                                    <span className="flex items-center gap-1 text-xs text-green-400">
                                      <TrendingUp className="w-3 h-3" />
                                      Crescendo
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1 text-xs text-red-400">
                                      <TrendingDown className="w-3 h-3" />
                                      Caindo
                                    </span>
                                  )}
                                </div>
                              )}
                              
                              {/* VT: Progresso 7 dias */}
                              {item.progressDays > 0 && (
                                <div className="mb-3">
                                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                                    <span>Progresso</span>
                                    <span>{item.progressDays}/7 dias</span>
                                  </div>
                                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                                      style={{ width: `${(item.progressDays / 7) * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                              
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEditing(item);
                                  }}
                                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-sm transition-colors"
                                >
                                  <Edit2 className="w-3 h-3" />
                                  Editar
                                </button>
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
    </div>
  );
};

export default Kanban;
