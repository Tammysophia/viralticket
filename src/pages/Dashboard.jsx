import { useState } from 'react';
import { Youtube, Sparkles, KanbanSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Tabs from '../components/Tabs';
import YouTubeExtractor from '../components/YouTubeExtractor';
import AIChat from '../components/AIChat';
import Kanban from '../components/Kanban';
import OfferEditor from '../components/OfferEditor'; // VT: Editor de ofertas
import Card from '../components/Card';
import PlanBadge from '../components/PlanBadge';
import ProgressBar from '../components/ProgressBar';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { getUserOffers } from '../services/offersService'; // VT: Buscar ofertas

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('youtube');
  const [aiInitialText, setAiInitialText] = useState('');
  const [editingOffer, setEditingOffer] = useState(null); // VT: Oferta sendo editada
  const [showOfferEditor, setShowOfferEditor] = useState(false); // VT: Modal de edição
  const { user } = useAuth();
  const { t } = useLanguage();

  const tabs = [
    { id: 'youtube', label: t('youtubeExtractor'), icon: Youtube },
    { id: 'ai', label: t('aiChat'), icon: Sparkles },
    { id: 'kanban', label: t('offersKanban'), icon: KanbanSquare },
  ];

  const handleUseWithAI = (text) => {
    setAiInitialText(text);
    setActiveTab('ai');
  };

  // VT: Abrir editor de oferta
  const handleEditOffer = async (offerId) => {
    const offers = await getUserOffers(user.id);
    const offer = offers.find(o => o.id === offerId);
    if (offer) {
      setEditingOffer(offer);
      setShowOfferEditor(true);
    }
  };

  // VT: Fechar editor
  const handleCloseEditor = () => {
    setShowOfferEditor(false);
    setEditingOffer(null);
  };

  return (
    <div className="min-h-screen gradient-bg flex">
      <Sidebar
        items={tabs}
        activePage={activeTab}
        onNavigate={setActiveTab}
        type="dashboard"
      />

      <div className="flex-1 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 p-6 overflow-auto">
          {/* User Info & Plan */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card hover={false}>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold mb-1">
                    Bem-vindo, {user?.name}! 👋
                  </h1>
                  <p className="text-gray-400">
                    Vamos criar ofertas incríveis hoje?
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <PlanBadge plan={user?.plan} size="lg" />
                </div>
              </div>

              {/* Usage Progress */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <ProgressBar
                  value={user?.dailyUsage.offers || 0}
                  max={user?.limits.offers || 2}
                  label="Ofertas Geradas Hoje"
                />
                <div className="glass border border-purple-500/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Extração YouTube</span>
                    <span className="text-xs text-green-400 font-bold">ILIMITADO</span>
                  </div>
                  <div className="text-2xl font-bold text-green-400">
                    ∞ URLs/dia
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Extraia comentários sem limites! 🎉
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Tabs */}
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'youtube' && (
              <YouTubeExtractor onUseWithAI={handleUseWithAI} />
            )}
            {activeTab === 'ai' && (
              <AIChat initialText={aiInitialText} />
            )}
            {activeTab === 'kanban' && <Kanban onEditOffer={handleEditOffer} />}
          </motion.div>
        </main>
      </div>

      {/* VT: Modal de edição de oferta */}
      <OfferEditor
        isOpen={showOfferEditor}
        onClose={handleCloseEditor}
        offer={editingOffer}
      />
    </div>
  );
};

export default Dashboard;
