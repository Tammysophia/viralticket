import { useState } from 'react';
import { Zap, Shield, Crown, Star, Edit, Save } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import Modal from './Modal';
import Input from './Input';
import { useToast } from './Toast';
import { motion } from 'framer-motion';

const AdminPlans = () => {
  const [plans, setPlans] = useState([
    {
      id: 'free',
      name: 'FREE',
      icon: Shield,
      color: 'from-gray-500 to-gray-600',
      price: 0,
      limits: {
        dailyOffers: 3,
        dailyUrls: 3,
        aiCredits: 0,
        support: 'Comunidade',
      },
      features: [
        'Até 3 ofertas/dia',
        'Até 3 URLs/dia',
        'Suporte via comunidade',
        'Acesso básico',
      ],
      users: 1045,
    },
    {
      id: 'bronze',
      name: 'BRONZE',
      icon: Star,
      color: 'from-orange-600 to-orange-700',
      price: 29.90,
      limits: {
        dailyOffers: 10,
        dailyUrls: 10,
        aiCredits: 100,
        support: 'Email 48h',
      },
      features: [
        'Até 10 ofertas/dia',
        'Até 10 URLs/dia',
        '100 créditos IA/mês',
        'Suporte via email',
      ],
      users: 432,
    },
    {
      id: 'silver',
      name: 'PRATA',
      icon: Zap,
      color: 'from-gray-400 to-gray-500',
      price: 49.90,
      limits: {
        dailyOffers: 30,
        dailyUrls: 30,
        aiCredits: 300,
        support: 'Email 24h',
      },
      features: [
        'Até 30 ofertas/dia',
        'Até 30 URLs/dia',
        '300 créditos IA/mês',
        'Suporte prioritário',
        'Webhooks automáticos',
      ],
      users: 287,
    },
    {
      id: 'gold',
      name: 'OURO',
      icon: Crown,
      color: 'from-yellow-500 to-yellow-600',
      price: 99.90,
      limits: {
        dailyOffers: 999,
        dailyUrls: 999,
        aiCredits: 1000,
        support: 'WhatsApp 12h',
      },
      features: [
        'Ofertas ilimitadas',
        'URLs ilimitadas',
        '1000 créditos IA/mês',
        'Suporte VIP WhatsApp',
        'Webhooks ilimitados',
        'API dedicada',
        'Relatórios avançados',
      ],
      users: 156,
    },
  ]);

  const [editingPlan, setEditingPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { success } = useToast();

  const handleEdit = (plan) => {
    setEditingPlan({ ...plan });
    setShowModal(true);
  };

  const handleSave = () => {
    setPlans(plans.map(p => p.id === editingPlan.id ? editingPlan : p));
    success(`Plano ${editingPlan.name} atualizado com sucesso!`);
    setShowModal(false);
    setEditingPlan(null);
  };

  const totalRevenue = plans.reduce((sum, plan) => 
    sum + (plan.price * plan.users), 0
  ).toFixed(2);

  return (
    <>
      <div className="mb-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Receita Mensal Estimada</p>
              <p className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
                R$ {totalRevenue}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Total de Assinantes</p>
              <p className="text-3xl font-bold">
                {plans.reduce((sum, plan) => sum + plan.users, 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card hover={false}>
              <div className={`p-4 rounded-lg bg-gradient-to-br ${plan.color} mb-4`}>
                <plan.icon className="w-8 h-8" />
              </div>

              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              
              <div className="mb-4">
                <span className="text-3xl font-bold">
                  {plan.price === 0 ? 'Grátis' : `R$ ${plan.price}`}
                </span>
                {plan.price > 0 && <span className="text-gray-400">/mês</span>}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Ofertas/dia</span>
                  <span className="font-semibold">{plan.limits.dailyOffers}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">URLs/dia</span>
                  <span className="font-semibold">{plan.limits.dailyUrls}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Créditos IA</span>
                  <span className="font-semibold">{plan.limits.aiCredits}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Suporte</span>
                  <span className="font-semibold text-xs">{plan.limits.support}</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 mb-4">
                <p className="text-sm text-gray-400 mb-2">Usuários ativos</p>
                <p className="text-2xl font-bold">{plan.users}</p>
              </div>

              <Button
                variant="secondary"
                className="w-full"
                icon={Edit}
                onClick={() => handleEdit(plan)}
              >
                Editar Plano
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingPlan(null);
        }}
        title={`Editar Plano ${editingPlan?.name}`}
      >
        {editingPlan && (
          <div className="space-y-4">
            <Input
              label="Nome do Plano"
              value={editingPlan.name}
              onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
            />

            <Input
              label="Preço Mensal (R$)"
              type="number"
              value={editingPlan.price}
              onChange={(e) => setEditingPlan({ ...editingPlan, price: parseFloat(e.target.value) })}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Ofertas Diárias"
                type="number"
                value={editingPlan.limits.dailyOffers}
                onChange={(e) => setEditingPlan({
                  ...editingPlan,
                  limits: { ...editingPlan.limits, dailyOffers: parseInt(e.target.value) }
                })}
              />

              <Input
                label="URLs Diárias"
                type="number"
                value={editingPlan.limits.dailyUrls}
                onChange={(e) => setEditingPlan({
                  ...editingPlan,
                  limits: { ...editingPlan.limits, dailyUrls: parseInt(e.target.value) }
                })}
              />
            </div>

            <Input
              label="Créditos IA/mês"
              type="number"
              value={editingPlan.limits.aiCredits}
              onChange={(e) => setEditingPlan({
                ...editingPlan,
                limits: { ...editingPlan.limits, aiCredits: parseInt(e.target.value) }
              })}
            />

            <Input
              label="Tipo de Suporte"
              value={editingPlan.limits.support}
              onChange={(e) => setEditingPlan({
                ...editingPlan,
                limits: { ...editingPlan.limits, support: e.target.value }
              })}
            />

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} className="flex-1" icon={Save}>
                Salvar Alterações
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowModal(false);
                  setEditingPlan(null);
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

export default AdminPlans;
