import { useState } from 'react';
import { Plus, Webhook, Activity } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import Modal from './Modal';
import Input from './Input';
import { useToast } from './Toast';
import { formatDate } from '../utils/validation';

const AdminWebhooks = () => {
  const [webhooks, setWebhooks] = useState([
    {
      id: '1',
      name: 'Stripe - Novo Pagamento',
      url: 'https://api.stripe.com/webhooks/viral',
      platform: 'Stripe',
      status: 'active',
      lastTriggered: new Date().toISOString(),
      events: 1234,
    },
    {
      id: '2',
      name: 'Hotmart - Nova Venda',
      url: 'https://hotmart.com/webhooks/viral',
      platform: 'Hotmart',
      status: 'active',
      lastTriggered: new Date().toISOString(),
      events: 856,
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newWebhook, setNewWebhook] = useState({ name: '', url: '', platform: '' });
  const { success, error } = useToast();

  const handleAdd = () => {
    if (!newWebhook.name || !newWebhook.url || !newWebhook.platform) {
      error('Preencha todos os campos');
      return;
    }

    const webhook = {
      id: Date.now().toString(),
      ...newWebhook,
      status: 'active',
      lastTriggered: new Date().toISOString(),
      events: 0,
    };

    setWebhooks([...webhooks, webhook]);
    success('Webhook adicionado com sucesso!');
    setShowModal(false);
    setNewWebhook({ name: '', url: '', platform: '' });
  };

  return (
    <>
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Webhooks</h3>
          <Button onClick={() => setShowModal(true)} icon={Plus}>
            Novo Webhook
          </Button>
        </div>

        <div className="space-y-4">
          {webhooks.map((webhook) => (
            <div key={webhook.id} className="glass border border-white/5 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Webhook className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{webhook.name}</h4>
                    <p className="text-sm text-gray-400 font-mono">{webhook.url}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Plataforma: {webhook.platform}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  webhook.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {webhook.status === 'active' ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/5">
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Activity className="w-4 h-4" />
                    <span>Total de Eventos</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{webhook.events}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Último Disparo</p>
                  <p className="text-sm font-semibold mt-1">{formatDate(webhook.lastTriggered)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Adicionar Novo Webhook"
      >
        <div className="space-y-4">
          <Input
            label="Nome do Webhook"
            placeholder="Ex: Stripe - Novo Pagamento"
            value={newWebhook.name}
            onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
          />

          <Input
            label="URL do Webhook"
            placeholder="https://..."
            value={newWebhook.url}
            onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Plataforma</label>
            <select
              value={newWebhook.platform}
              onChange={(e) => setNewWebhook({ ...newWebhook, platform: e.target.value })}
              className="w-full glass border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <option value="">Selecione...</option>
              <option value="Stripe">Stripe</option>
              <option value="Hotmart">Hotmart</option>
              <option value="Monetizze">Monetizze</option>
              <option value="Eduzz">Eduzz</option>
              <option value="PayPal">PayPal</option>
            </select>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleAdd} className="flex-1">
              Adicionar
            </Button>
            <Button variant="secondary" onClick={() => setShowModal(false)} className="flex-1">
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AdminWebhooks;
