import { useState } from 'react';
import { Plug, Check, X, Settings, ExternalLink } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import Modal from './Modal';
import Input from './Input';
import { useToast } from './Toast';
import { motion } from 'framer-motion';

const AdminIntegrations = () => {
  const [integrations, setIntegrations] = useState([
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Processamento de pagamentos',
      icon: '💳',
      status: 'active',
      connected: true,
      lastSync: new Date().toISOString(),
      webhookUrl: 'https://api.viralticket.com/webhooks/stripe',
      config: {
        publishableKey: 'pk_live_xxxxxxxxxxxxx',
        webhookSecret: 'whsec_xxxxxxxxxxxxx',
      },
    },
    {
      id: 'hotmart',
      name: 'Hotmart',
      description: 'Plataforma de produtos digitais',
      icon: '🔥',
      status: 'active',
      connected: true,
      lastSync: new Date().toISOString(),
      webhookUrl: 'https://api.viralticket.com/webhooks/hotmart',
      config: {
        token: 'hot_xxxxxxxxxxxxx',
      },
    },
    {
      id: 'youtube',
      name: 'YouTube Data API',
      description: 'Extração de dados do YouTube',
      icon: '▶️',
      status: 'active',
      connected: true,
      lastSync: new Date().toISOString(),
      webhookUrl: null,
      config: {
        apiKey: 'AIzaxxxxxxxxxxxxx',
        quota: 10000,
        quotaUsed: 3456,
      },
    },
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'Geração de ofertas com IA',
      icon: '🤖',
      status: 'active',
      connected: true,
      lastSync: new Date().toISOString(),
      webhookUrl: null,
      config: {
        apiKey: 'sk-xxxxxxxxxxxxx',
        model: 'gpt-4',
      },
    },
    {
      id: 'monetizze',
      name: 'Monetizze',
      description: 'Plataforma de afiliados',
      icon: '💰',
      status: 'inactive',
      connected: false,
      lastSync: null,
      webhookUrl: 'https://api.viralticket.com/webhooks/monetizze',
      config: {},
    },
    {
      id: 'eduzz',
      name: 'Eduzz',
      description: 'Marketplace de produtos digitais',
      icon: '🛒',
      status: 'inactive',
      connected: false,
      lastSync: null,
      webhookUrl: 'https://api.viralticket.com/webhooks/eduzz',
      config: {},
    },
  ]);

  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { success, error } = useToast();

  const handleConnect = (integration) => {
    setSelectedIntegration(integration);
    setShowModal(true);
  };

  const handleToggle = (id) => {
    setIntegrations(integrations.map(int =>
      int.id === id
        ? {
            ...int,
            status: int.status === 'active' ? 'inactive' : 'active',
            connected: int.status === 'inactive',
          }
        : int
    ));
    
    const integration = integrations.find(i => i.id === id);
    const newStatus = integration.status === 'active' ? 'desativada' : 'ativada';
    success(`Integração ${integration.name} ${newStatus}!`);
  };

  const handleSync = (id) => {
    setIntegrations(integrations.map(int =>
      int.id === id
        ? { ...int, lastSync: new Date().toISOString() }
        : int
    ));
    
    const integration = integrations.find(i => i.id === id);
    success(`${integration.name} sincronizada com sucesso!`);
  };

  const activeIntegrations = integrations.filter(i => i.connected).length;
  const totalWebhooks = integrations.filter(i => i.webhookUrl).length;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card hover={false}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
              <Plug className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Integrações Ativas</p>
              <p className="text-2xl font-bold">{activeIntegrations}</p>
            </div>
          </div>
        </Card>

        <Card hover={false}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Disponível</p>
              <p className="text-2xl font-bold">{integrations.length}</p>
            </div>
          </div>
        </Card>

        <Card hover={false}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
              <ExternalLink className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Webhooks Configurados</p>
              <p className="text-2xl font-bold">{totalWebhooks}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((integration, index) => (
          <motion.div
            key={integration.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card hover={true}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="text-4xl">{integration.icon}</div>
                  <div>
                    <h3 className="text-lg font-bold">{integration.name}</h3>
                    <p className="text-sm text-gray-400">{integration.description}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleToggle(integration.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    integration.status === 'active'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}
                >
                  {integration.connected ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <X className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                {integration.webhookUrl && (
                  <div>
                    <p className="text-gray-400">Webhook URL</p>
                    <p className="font-mono text-xs text-purple-400 truncate">
                      {integration.webhookUrl}
                    </p>
                  </div>
                )}
                
                {integration.lastSync && (
                  <div>
                    <p className="text-gray-400">Última Sincronização</p>
                    <p className="font-semibold">
                      {new Date(integration.lastSync).toLocaleString('pt-BR')}
                    </p>
                  </div>
                )}

                {integration.config.quota && (
                  <div>
                    <p className="text-gray-400">Quota API</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                          style={{
                            width: `${(integration.config.quotaUsed / integration.config.quota) * 100}%`
                          }}
                        />
                      </div>
                      <span className="text-xs">
                        {integration.config.quotaUsed}/{integration.config.quota}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {integration.connected ? (
                  <>
                    <Button
                      variant="secondary"
                      className="flex-1"
                      icon={Settings}
                      onClick={() => handleConnect(integration)}
                    >
                      Configurar
                    </Button>
                    <Button
                      variant="primary"
                      className="flex-1"
                      onClick={() => handleSync(integration.id)}
                    >
                      Sincronizar
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="primary"
                    className="w-full"
                    icon={Plug}
                    onClick={() => handleConnect(integration)}
                  >
                    Conectar
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedIntegration(null);
        }}
        title={`Configurar ${selectedIntegration?.name}`}
      >
        {selectedIntegration && (
          <div className="space-y-4">
            <div className="glass border border-white/5 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">{selectedIntegration.icon}</span>
                <div>
                  <h4 className="font-bold">{selectedIntegration.name}</h4>
                  <p className="text-sm text-gray-400">{selectedIntegration.description}</p>
                </div>
              </div>
            </div>

            {Object.entries(selectedIntegration.config).map(([key, value]) => (
              key !== 'quota' && key !== 'quotaUsed' && (
                <Input
                  key={key}
                  label={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                  type="password"
                  value={value}
                  placeholder="Digite a chave..."
                />
              )
            ))}

            {selectedIntegration.webhookUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Webhook URL
                </label>
                <div className="glass border border-white/10 rounded-lg px-4 py-3">
                  <p className="font-mono text-sm text-purple-400 break-all">
                    {selectedIntegration.webhookUrl}
                  </p>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Configure esta URL na sua plataforma para receber notificações
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button className="flex-1">
                Salvar Configurações
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowModal(false);
                  setSelectedIntegration(null);
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default AdminIntegrations;
