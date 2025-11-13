import { useState, useEffect } from 'react';
import { MessageCircle, Save } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import Card from './Card';
import Button from './Button';
import Input from './Input';
import { useToast } from './Toast';
import { useAuth } from '../hooks/useAuth';

const AdminSettings = () => {
  const { user } = useAuth();
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappMessage, setWhatsappMessage] = useState('Olá! Preciso de suporte com o ViralTicket.');
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  // Proteção adicional - não renderizar se não for admin
  if (!user?.isAdmin) {
    return (
      <Card>
        <p className="text-center text-gray-400">🎯 O sistema está em operação normal.</p>
      </Card>
    );
  }

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    
    // Tentar carregar do Firestore
    if (db) {
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'whatsapp'));
        if (settingsDoc.exists()) {
          const data = settingsDoc.data();
          setWhatsappNumber(data.number || '');
          setWhatsappMessage(data.message || 'Olá! Preciso de suporte com o ViralTicket.');
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
    
    setLoading(false);
  };

  const handleSave = async () => {
    if (!whatsappNumber) {
      error('📝 Digite o número do WhatsApp');
      return;
    }

    const settings = {
      number: whatsappNumber,
      message: whatsappMessage,
      updatedAt: new Date().toISOString(),
    };

    // Salvar no localStorage (sempre funciona)
    localStorage.setItem('viralticket_whatsapp_settings', JSON.stringify(settings));

    // Tentar salvar no Firestore
    if (db) {
      try {
        await setDoc(doc(db, 'settings', 'whatsapp'), settings);
        success('✅ Configurações salvas no Firestore!');
      } catch (err) {
        console.warn('VT: Erro ao salvar no Firestore:', err);
        success('✅ Configurações salvas localmente!');
      }
    } else {
      success('✅ Configurações salvas localmente!');
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-400">Carregando configurações...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/30 to-green-600/40">
          <MessageCircle className="w-6 h-6 text-green-300" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Configurações de Suporte</h3>
          <p className="text-sm text-gray-400">Configure o WhatsApp para suporte aos usuários</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Input
            label="Número do WhatsApp (com DDI e DDD)"
            placeholder="Ex: 5511999999999"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
            helperText="Digite apenas números, incluindo código do país (55 para Brasil)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Mensagem Padrão
          </label>
          <textarea
            value={whatsappMessage}
            onChange={(e) => setWhatsappMessage(e.target.value)}
            rows={3}
            className="w-full glass border border-purple-500/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 bg-gradient-to-br from-purple-500/5 to-purple-700/10 resize-none"
            placeholder="Digite a mensagem padrão que será enviada..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Esta mensagem será pré-preenchida quando o usuário clicar no botão de suporte
          </p>
        </div>

        {whatsappNumber && (
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
            <p className="text-sm text-green-400 mb-2">
              <strong>Preview do Link:</strong>
            </p>
            <p className="text-xs text-gray-300 font-mono break-all">
              https://wa.me/{whatsappNumber}?text={encodeURIComponent(whatsappMessage)}
            </p>
          </div>
        )}

        <Button
          onClick={handleSave}
          icon={Save}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600"
        >
          Salvar Configurações
        </Button>
      </div>
    </Card>
  );
};

export default AdminSettings;
