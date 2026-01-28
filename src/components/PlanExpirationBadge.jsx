import { Clock, AlertTriangle } from 'lucide-react';
import { getDaysUntilExpiration } from '../utils/plans';

/**
 * Badge que mostra quantos dias faltam para o plano expirar
 * Usado apenas para planos com expiração (MENTORIA)
 */
const PlanExpirationBadge = ({ planName, planStartDate }) => {
  const daysRemaining = getDaysUntilExpiration(planStartDate, planName);
  
  // Se o plano não expira, não mostrar nada
  if (daysRemaining === -1) {
    return null;
  }
  
  // Se expirou
  if (daysRemaining === 0) {
    return (
      <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs">
        <AlertTriangle className="w-3 h-3" />
        <span>Expirado</span>
      </div>
    );
  }
  
  // Alerta se faltam menos de 30 dias
  const isExpiringSoon = daysRemaining <= 30;
  
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
      isExpiringSoon 
        ? 'bg-yellow-500/20 text-yellow-400' 
        : 'bg-purple-500/20 text-purple-400'
    }`}>
      <Clock className="w-3 h-3" />
      <span>
        {daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'} restantes
      </span>
    </div>
  );
};

export default PlanExpirationBadge;
