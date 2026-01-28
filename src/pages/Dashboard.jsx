import { useState, useEffect } from 'react';
import { Sparkles, KanbanSquare, Bot, LayoutDashboard, Settings, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Tabs from '../components/Tabs';
import YouTubeExtractor from '../components/YouTubeExtractor';
import AIChat from '../components/AIChat';
import Kanban from '../components/Kanban';
import OfferEditor from '../components/OfferEditor';
import Card from '../components/Card';
import PlanBadge from '../components/PlanBadge';
import ProgressBar from '../components/ProgressBar';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('new-offer');
  const [aiInitialText, setAiInitialText] = useState('');
  const [editingOffer, setEditingOffer] = useState(null);
  const [showOfferEditor, setShowOfferEditor] = useState(false);
  const { user } = useAuth();
  const { t } = useLanguage();

  const tabs = [
    { id: 'new-offer', label: 'Nova Estratégia', icon: Zap },
    { id: 'ai-lab', label: 'Laboratório IA', icon: Bot },
    { id: 'kanban', label: 'Quadro de Ofertas', icon: KanbanSquare },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const handleUseWithAI = (text) => {
    setAiInitialText(text);
    setActiveTab('ai-lab');
  };

  const handleEditOffer = (offerId, offerData) => {
    setEditingOffer(offerData);
    setShowOfferEditor(true);
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
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card hover={false} className="border-purple-500/10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold mb-1">
                    Olá, {user?.name || 'Estrategista'}! 👋
                  </h1>
                  <p className="text-gray-400 text-sm">
                    Pronto para criar sua próxima oferta milionária?
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <PlanBadge plan={user?.plan} size="lg" />
                </div>
              </div>

              <div className="mt-6">
                <ProgressBar
                  value={user?.dailyUsage?.offers || 0}
                  max={user?.plan === 'OURO' ? 999 : 3}
                  label="Ofertas Geradas Hoje"
                />
              </div>
            </Card>
          </motion.div>

          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6"
          >
            {activeTab === 'new-offer' && (
              <YouTubeExtractor onUseWithAI={handleUseWithAI} />
            )}
            {activeTab === 'ai-lab' && (
              <AIChat initialText={aiInitialText} />
            )}
            {activeTab === 'kanban' && (
              <Kanban onEditOffer={handleEditOffer} />
            )}
            {activeTab === 'settings' && (
              <Card className="p-12 text-center text-gray-500">
                Configurações da conta em breve.
              </Card>
            )}
          </motion.div>
        </main>
      </div>

      <OfferEditor
        isOpen={showOfferEditor}
        onClose={() => setShowOfferEditor(false)}
        offer={editingOffer}
      />
    </div>
  );
};

export default Dashboard;
