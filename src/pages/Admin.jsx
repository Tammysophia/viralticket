import { useState } from 'react';
import { LayoutDashboard, Users, Key, Webhook, Zap, Plug, Activity, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import AdminOverview from '../components/AdminOverview';
import AdminUsers from '../components/AdminUsers';
import AdminAPIKeys from '../components/AdminAPIKeys';
import AdminWebhooks from '../components/AdminWebhooks';
import AdminPlans from '../components/AdminPlans';
import AdminIntegrations from '../components/AdminIntegrations';
import AdminLogs from '../components/AdminLogs';

const Admin = () => {
  const [activePage, setActivePage] = useState('overview');
  const { user } = useAuth();

  // Verificação de administrador
  if (!user?.isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  const menuItems = [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'plans', label: 'Planos', icon: Zap },
    { id: 'apiKeys', label: 'Chaves API', icon: Key },
    { id: 'integrations', label: 'Integrações', icon: Plug },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook },
    { id: 'logs', label: 'Logs', icon: Activity },
  ];

  const renderContent = () => {
    switch (activePage) {
      case 'overview':
        return <AdminOverview />;
      case 'users':
        return <AdminUsers />;
      case 'plans':
        return <AdminPlans />;
      case 'apiKeys':
        return <AdminAPIKeys />;
      case 'integrations':
        return <AdminIntegrations />;
      case 'webhooks':
        return <AdminWebhooks />;
      case 'logs':
        return <AdminLogs />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div className="min-h-screen admin-gradient flex">
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
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600 via-purple-500 to-pink-600 shadow-lg shadow-purple-500/30">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold admin-gradient-text bg-clip-text text-transparent">
                  {menuItems.find(item => item.id === activePage)?.label}
                </h1>
                <p className="text-gray-400 mt-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Painel Administrativo • {user?.email}
                </p>
              </div>
            </div>
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
