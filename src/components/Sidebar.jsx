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
        } fixed lg:static inset-y-0 left-0 z-40 w-64 bg-black/20 backdrop-blur-[15px] border-r border-white/5 p-6 flex flex-col transition-transform duration-300`}
      >
        {/* Logo */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-2xl font-bold">
            <span>🎟️</span>
            <span className="gradient-primary bg-clip-text text-transparent">
              ViralTicket
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {type === 'admin' ? 'Admin Panel' : 'AI-Powered Offers'}
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activePage === item.id
                  ? 'gradient-primary text-white shadow-lg shadow-primary-purple/30'
                  : 'glass-hover text-zinc-400 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-900/20 border border-red-500/30 hover:bg-red-900/40 text-red-400 mt-4 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sair</span>
        </button>
      </motion.aside>
    </>
  );
};

export default Sidebar;
