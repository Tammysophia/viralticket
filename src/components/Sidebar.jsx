import { motion } from 'framer-motion';
import { Home, Users, Key, Webhook, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ items, activePage, onNavigate, type = 'dashboard' }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="lg:hidden fixed top-4 left-4 z-50 glass p-2 rounded-lg"
      >
        {collapsed ? <Menu className="w-6 h-6" /> : <X className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={`${
          collapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'
        } fixed lg:static inset-y-0 left-0 z-40 w-64 ${
          type === 'admin' 
            ? 'bg-gradient-to-b from-purple-950/50 via-black/50 to-black/50 backdrop-blur-xl border-r border-purple-500/20' 
            : 'glass border-r border-white/10'
        } p-6 flex flex-col transition-transform duration-300`}
      >
        {/* Logo */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-2xl font-bold">
            <span>{type === 'admin' ? '👑' : '🎟️'}</span>
            <span className={type === 'admin' ? 'admin-gradient-text bg-clip-text text-transparent' : 'gradient-primary bg-clip-text text-transparent'}>
              ViralTicket
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {type === 'admin' ? '⚡ Admin Panel' : 'AI-Powered Offers'}
          </p>
          {type === 'admin' && (
            <div className="mt-3 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600/20 via-purple-500/20 to-yellow-500/20 border border-purple-500/30">
              <p className="text-xs font-semibold text-purple-300">Acesso Administrativo</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {items.map((item, index) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activePage === item.id
                  ? type === 'admin'
                    ? 'bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'glass-hover text-gray-400 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {type === 'admin' && activePage === item.id && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-2 h-2 rounded-full bg-yellow-400"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mt-4 transition-all ${
            type === 'admin'
              ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
              : 'glass-hover text-red-400'
          }`}
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sair</span>
        </button>

        {/* Footer Info */}
        {type === 'admin' && (
          <div className="mt-4 pt-4 border-t border-purple-500/20">
            <p className="text-xs text-gray-500 text-center">
              ViralTicket Admin v1.0
            </p>
          </div>
        )}
      </motion.aside>
    </>
  );
};

export default Sidebar;
