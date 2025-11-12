import toast from 'react-hot-toast';
import { useEffect, useMemo, useState } from 'react';
import { Clock, TrendingUp, Trash2 } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { subscribeToUserOffers, updateOffer } from '../services/offersService';
import { formatDate } from '../utils/validation';

const DAYS_IN_MS = 24 * 60 * 60 * 1000;

const OfferMonitoring = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = subscribeToUserOffers(user.id, (data) => {
      setOffers(
        data.filter(
          (offer) =>
            offer.modeling?.monitorStart &&
            offer.modeling?.monitorDays &&
            offer.modeling?.creativesCount >= 1,
        ),
      );
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.id]);

  const handleStopMonitoring = async (offerId) => {
    try {
      await updateOffer(offerId, {
        modeling: {
          monitorStart: null,
          modelavel: false,
          trend: null,
        },
      });
      setOffers((prev) => prev.filter((offer) => offer.id !== offerId));
      toast.success(t('monitoringStopped'));
    } catch (error) {
      toast.error(t('monitoringStopError'));
    }
  };

  const monitoredOffers = useMemo(
    () =>
      offers.map((offer) => {
        const monitorDays = offer.modeling?.monitorDays || 7;
        const startDate = offer.modeling?.monitorStart
          ? new Date(offer.modeling.monitorStart)
          : new Date();
        const elapsed = Math.max(
          0,
          Math.floor((Date.now() - startDate.getTime()) / DAYS_IN_MS),
        );
        const remaining = Math.max(monitorDays - elapsed, 0);
        const progress = Math.min((elapsed / monitorDays) * 100, 100);

        return {
          ...offer,
          elapsed,
          remaining,
          progress,
        };
      }),
    [offers],
  );

  if (loading) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400 text-sm">{t('loading')}</span>
        </div>
      </Card>
    );
  }

  if (monitoredOffers.length === 0) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center text-center py-16 gap-3">
          <Clock className="w-10 h-10 text-purple-400" />
          <p className="text-sm text-gray-400 max-w-xs">{t('monitoringEmpty')}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {monitoredOffers.map((offer) => (
        <Card key={offer.id} hover={false} className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white">{offer.title}</h3>
              <p className="text-xs text-gray-400 line-clamp-2">{offer.subtitle}</p>
            </div>
            <span className="text-xs text-gray-500">
              {formatDate(offer.modeling?.monitorStart)}
            </span>
          </div>

          <div className="glass border border-purple-500/20 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-sm text-gray-300">
              <span>{t('monitoringProgress')}</span>
              <span>
                {offer.elapsed}/{offer.modeling?.monitorDays || 7} {t('days')}
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                style={{ width: `${offer.progress}%` }}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {t('creativesLabel')}: {offer.modeling?.creativesCount ?? 0}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {t('monitoringRemaining')}: {offer.remaining}
              </div>
              {offer.modeling?.modelavel && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                  🏆 {t('modeledOffer')}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {t('monitoringStartedAt')} {formatDate(offer.modeling?.monitorStart)}
            </span>
            <Button
              variant="danger"
              onClick={() => handleStopMonitoring(offer.id)}
              className="flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              {t('stopMonitoring')}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default OfferMonitoring;
