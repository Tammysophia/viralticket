import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const WhatsAppButton = () => {
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappMessage, setWhatsappMessage] = useState('Olá! Preciso de suporte com o ViralTicket.');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    // Tentar carregar do Firestore
    if (db) {
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'whatsapp'));
        if (settingsDoc.exists()) {
          const data = settingsDoc.data();
          setWhatsappNumber(data.number || '');
          setWhatsappMessage(data.message || 'Olá! Preciso de suporte com o ViralTicket.');
          return;
        }
      } catch (err) {
        console.warn('VT: Erro ao carregar configurações do Firestore:', err);
      }
    }
    
    // Fallback: carregar do localStorage
    const saved = localStorage.getItem('viralticket_whatsapp_settings');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setWhatsappNumber(data.number || '');
        setWhatsappMessage(data.message || 'Olá! Preciso de suporte com o ViralTicket.');
      } catch (err) {
        console.error('Erro ao carregar configurações:', err);
      }
    }
  };

  const handleClick = () => {
    if (!whatsappNumber) {
      alert('WhatsApp de suporte não configurado. Entre em contato com o administrador.');
      return;
    }

    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(url, '_blank');
  };

  // Não mostrar o botão se não houver número configurado
  if (!whatsappNumber) {
    return null;
  }

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-green-500 to-green-600 shadow-lg shadow-green-500/50 hover:shadow-green-500/70 transition-all group"
      title="Falar com Suporte"
    >
      <MessageCircle className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
      
      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Falar com Suporte
        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
      </div>
    </motion.button>
  );
};

export default WhatsAppButton;
