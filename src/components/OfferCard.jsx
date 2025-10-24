import { useState, useEffect } from 'react';
import { Calendar, Sparkles, Trash2, TrendingUp, Edit3, Check, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDate } from '../utils/validation';
import { useToast } from './Toast';

const OfferCard = ({ 
  offer, 
  columnColor, 
  isDragging, 
  dragHandleProps, 
  onDelete, 
  onUpdate,
  onStartModeling 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(offer.title);
  const [isSaving, setIsSaving] = useState(false);
  const { success } = useToast();

  // Auto-save title changes
  useEffect(() => {
    if (title !== offer.title && !isEditing) {
      const timer = setTimeout(async () => {
        setIsSaving(true);
        await onUpdate(offer.id, { title });
        setIsSaving(false);
        success('✔️ Salvo');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [title, offer.title, offer.id, isEditing, onUpdate, success]);

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir esta oferta?')) {
      onDelete(offer.id);
      success('Oferta excluída');
    }
  };

  const getModelingProgress = () => {
    if (!offer.modeling) return null;
    
    const daysPassed = Math.floor(
      (new Date() - new Date(offer.modeling.startDate)) / (1000 * 60 * 60 * 24)
    );
    const progress = Math.min((daysPassed / offer.modeling.duration) * 100, 100);
    
    return { daysPassed, progress, total: offer.modeling.duration };
  };

  const getModelingStatusColor = () => {
    if (!offer.modeling) return '';
    
    switch (offer.modeling.status) {
      case 'modeling_well':
        return 'text-green-400 border-green-500/30 bg-green-500/10';
      case 'not_scalable':
        return 'text-red-400 border-red-500/30 bg-red-500/10';
      default:
        return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
    }
  };

  const getModelingStatusText = () => {
    if (!offer.modeling) return '';
    
    switch (offer.modeling.status) {
      case 'modeling_well':
        return '🟢 Modelando bem';
      case 'not_scalable':
        return '🔴 Oferta não escalável';
      default:
        return '🔵 Monitorando';
    }
  };

  const modelingProgress = getModelingProgress();

  return (
    <motion.div
      {...dragHandleProps}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-dark border ${columnColor} rounded-lg p-4 cursor-move transition-all shadow-md group ${
        isDragging ? 'rotate-2 scale-105 shadow-2xl shadow-primary-lilac/30' : 'hover:shadow-lg hover:shadow-primary-purple/20'
      }`}
    >
      {/* Header with Title */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          {isEditing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
              className="w-full bg-white/5 border border-primary-purple/30 rounded px-2 py-1 font-bold focus:outline-none focus:ring-2 focus:ring-primary-purple/50"
              autoFocus
            />
          ) : (
            <h4 
              className="font-bold mb-1 cursor-text hover:text-primary-lilac transition-colors"
              onClick={() => setIsEditing(true)}
            >
              {title}
            </h4>
          )}
          {offer.description && (
            <p className="text-xs text-zinc-500">{offer.description}</p>
          )}
        </div>
        
        {isSaving && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-green-400"
          >
            <Check className="w-4 h-4" />
          </motion.div>
        )}
      </div>

      {/* Agent Info */}
      <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
        <Sparkles className="w-4 h-4 text-primary-lilac" />
        <span>{offer.agent}</span>
      </div>

      {/* Date */}
      <div className="flex items-center gap-2 text-xs text-zinc-500 mb-3">
        <Calendar className="w-3 h-3" />
        <span>{formatDate(offer.date)}</span>
      </div>

      {/* Modeling Progress */}
      {offer.modeling && modelingProgress && (
        <div className="space-y-2 mb-3 pt-3 border-t border-white/5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">Progresso de Modelagem</span>
            <span className="font-semibold text-gold-500">
              {modelingProgress.daysPassed}/{modelingProgress.total} dias
            </span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${modelingProgress.progress}%` }}
              className="h-full gradient-gold"
            />
          </div>
          <div className={`flex items-center gap-2 text-xs px-2 py-1 rounded border ${getModelingStatusColor()}`}>
            <AlertCircle className="w-3 h-3" />
            <span className="font-semibold">{getModelingStatusText()}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {!offer.modeling && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartModeling(offer);
            }}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gold-500/10 border border-gold-500/30 text-gold-500 hover:bg-gold-500/20 transition-all text-sm"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Modelar</span>
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all text-sm"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default OfferCard;
