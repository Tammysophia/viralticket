import { useState } from 'react';
import { Youtube, Sparkles, KanbanSquare, Bot, TrendingUp, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Tabs from '../components/Tabs';
import YouTubeExtractor from '../components/YouTubeExtractor';
import AIChat from '../components/AIChat';
import Kanban from '../components/Kanban';
import KanbanMonitoring from '../components/KanbanMonitoring';
import KanbanModeling from '../components/KanbanModeling';
import GPTAgents from '../components/GPTAgents';
import OfferEditor from '../components/OfferEditor'; // VT: Editor de ofertas
import Card from '../components/Card';
import PlanBadge from '../components/PlanBadge';
import ProgressBar from '../components/ProgressBar';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { getUserOffers, duplicateOfferForModeling, updateOffer } from '../services/offersService'; // VT: Buscar ofertas
import toast from 'react-hot-toast'; // VT: Toast para feedback

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
    { id: 'kanban', label: 'Ofertas Salvas', icon: KanbanSquare },
    { id: 'monitoring', label: 'Monitoramento', icon: TrendingUp },
    { id: 'modeling', label: 'Modelagem', icon: Layers },
    { id: 'gptAgents', label: 'Agentes GPT', icon: Bot },
  ];

  const handleUseWithAI = (text) => {
    setAiInitialText(text);
    setActiveTab('ai');
  };

  // VT: Abrir editor de oferta
  const handleEditOffer = async (offerId) => {
    try {
      console.log('🔍 VT: Abrindo editor para oferta:', offerId);
      const offers = await getUserOffers(user.id);
      console.log('📦 VT: Total de ofertas do usuário:', offers.length);
      
      const offer = offers.find(o => o.id === offerId);
      
      if (offer) {
        console.log('✅ VT: Oferta encontrada:', offer.title);
        setEditingOffer(offer);
        setShowOfferEditor(true);
      } else {
        console.error('❌ VT: Oferta não encontrada:', offerId);
        console.log('📋 VT: IDs disponíveis:', offers.map(o => o.id));
        toast.error('Oferta não encontrada');
      }
    } catch (error) {
      console.error('❌ VT: Erro ao abrir editor:', error);
      toast.error('Erro ao abrir editor');
    }
  };

  // VT: Fechar editor
  const handleCloseEditor = () => {
    setShowOfferEditor(false);
    setEditingOffer(null);
  };

  // VT: Mover oferta do Monitoramento para Modelagem
  const handleMoveToModeling = async (originalOffer) => {
    try {
      toast.loading('Movendo para modelagem...');
      const newId = await duplicateOfferForModeling(originalOffer);
      toast.dismiss();
      toast.success('Oferta movida para modelagem!');
      setActiveTab('modeling');
    } catch (err) {
      toast.dismiss();
      toast.error('Erro ao mover para modelagem');
      console.error('VT: handleMoveToModeling error', err);
    }
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
                    {t('welcome')}, {user?.name}! 👋
                  </h1>
                  <p className="text-gray-400">
                    {t('letsCreateOffers')}
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
                  label={t('offersGeneratedToday')}
                />
                <div className="glass border border-purple-500/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">{t('youtubeExtraction')}</span>
                    <span className="text-xs text-green-400 font-bold">{t('unlimited')}</span>
                  </div>
                  <div className="text-2xl font-bold text-green-400">
                    ∞ {t('urlsPerDay')}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('extractUnlimited')}
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
            {activeTab === 'monitoring' && (
              <KanbanMonitoring 
                onEditOffer={handleEditOffer} 
                onMoveToModeling={handleMoveToModeling}
              />
            )}
            {activeTab === 'modeling' && <KanbanModeling onEditOffer={handleEditOffer} />}
            {activeTab === 'gptAgents' && <GPTAgents />}
          </motion.div>
        </main>
      </div>

      {/* VT: Modal de edição de oferta */}
      {showOfferEditor && editingOffer && (
        <OfferEditor
          isOpen={showOfferEditor}
          onClose={handleCloseEditor}
          offer={editingOffer}
        />
      )}
    </div>
  );
};

export default Dashboard;
