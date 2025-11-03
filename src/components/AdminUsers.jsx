import { useState, useEffect } from 'react';
import { MoreVertical, Edit, Ban, TrendingUp } from 'lucide-react';
import Card from './Card';
import PlanBadge from './PlanBadge';
import Button from './Button';
import Modal from './Modal';
import { useToast } from './Toast';
import { useAuth } from '../hooks/useAuth';
import { getAllUsers, updateUserPlan } from '../services/firebaseService';

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { success, error } = useToast();

  // VT: Buscar usuários reais do Firestore
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const realUsers = await getAllUsers();
        setUsers(realUsers);
      } catch (err) {
        console.error('VT: Erro ao carregar usuários:', err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.isAdmin) {
      loadUsers();
    }
  }, [currentUser?.isAdmin]);

  // Proteção adicional - não renderizar se não for admin
  if (!currentUser?.isAdmin) {
    return (
      <Card>
        <p className="text-center text-gray-400">🎯 O sistema está em operação normal.</p>
      </Card>
    );
  }

  const handleChangePlan = async (userId, newPlan) => {
    try {
      await updateUserPlan(userId, newPlan);
      setUsers(users.map(u => u.id === userId ? { ...u, plan: newPlan } : u));
      success(`Plano alterado para ${newPlan}`);
      setShowModal(false);
    } catch (err) {
      console.error('VT: Erro ao alterar plano:', err);
      error('Erro ao alterar plano');
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Carregando usuários...</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <h3 className="text-xl font-bold mb-4">Gerenciar Usuários</h3>
        
        {users.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>Nenhum usuário cadastrado ainda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-2">Usuário</th>
                  <th className="text-left py-3 px-2">Plano</th>
                  <th className="text-left py-3 px-2">Uso Diário</th>
                  <th className="text-left py-3 px-2">Status</th>
                  <th className="text-left py-3 px-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-2">
                      <div>
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <PlanBadge plan={user.plan} size="sm" />
                    </td>
                    <td className="py-3 px-2">
                      <div className="text-sm">
                        <p>{user.dailyOffers} ofertas</p>
                        <p className="text-gray-400">{user.dailyUrls} URLs</p>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {user.status === 'active' ? 'Ativo' : 'Bloqueado'}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowModal(true);
                        }}
                        className="glass-hover p-2 rounded-lg"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Gerenciar Usuário"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400">Nome</p>
              <p className="font-semibold">{selectedUser.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Email</p>
              <p className="font-semibold">{selectedUser.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-2">Alterar Plano</p>
              <div className="grid grid-cols-2 gap-2">
                {['FREE', 'BRONZE', 'PRATA', 'OURO'].map((plan) => (
                  <button
                    key={plan}
                    onClick={() => handleChangePlan(selectedUser.id, plan)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedUser.plan === plan
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-white/10 glass-hover'
                    }`}
                  >
                    <PlanBadge plan={plan} size="sm" />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="danger" className="flex-1" icon={Ban}>
                Bloquear
              </Button>
              <Button variant="secondary" className="flex-1" icon={Edit}>
                Editar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default AdminUsers;
