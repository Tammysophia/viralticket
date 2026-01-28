import { useState } from 'react';
import { LayoutDashboard, Users, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import AdminOverview from '../components/AdminOverview';
import AdminUsers from '../components/AdminUsers';
import AdminSettings from '../components/AdminSettings';
import { useLanguage } from '../hooks/useLanguage';

const Admin = () => {
  const [activePage, setActivePage] = useState('overview');
  const { t } = useLanguage();

  const menuItems = [
    { id: 'overview', label: t('overview'), icon: LayoutDashboard },
    { id: 'users', label: t('users'), icon: Users },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const renderContent = () => {
    switch (activePage) {
      case 'overview':
        return <AdminOverview />;
      case 'users':
        return <AdminUsers />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex">
      <Sidebar
        items={menuItems}
        activePage={activePage}
        onNavigate={setActivePage}
        type="admin"
      />

      <div className="flex-1 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 p-6 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
              {menuItems.find(item => item.id === activePage)?.label}
            </h1>
            <p className="text-gray-400 mt-1">
              Painel Administrativo ViralTicket
            </p>
          </motion.div>

          <motion.div
            key={activePage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Admin;
