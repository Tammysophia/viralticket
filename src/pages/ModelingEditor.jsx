import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import Card from '../components/Card';

const ModelingEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [modeling, setModeling] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModeling = async () => {
      if (!id || !user?.id) return;
      try {
        const docRef = doc(db, 'offers', id);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          toast.error('Modelagem não encontrada');
          navigate('/dashboard');
          return;
        }

        const data = docSnap.data();
        if (data.userId !== user.id) {
          toast.error('Acesso negado');
          navigate('/dashboard');
          return;
        }

        setModeling({ id: docSnap.id, ...data });
        setLoading(false);
      } catch (err) {
        toast.error('Erro ao carregar modelagem');
        console.error(err);
        navigate('/dashboard');
      }
    };

    fetchModeling();
  }, [id, user?.id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando modelagem...</p>
        </div>
      </div>
    );
  }

  if (!modeling) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Card>
          <p className="text-red-400">Modelagem não encontrada</p>
          <button onClick={() => navigate('/dashboard')} className="mt-4 px-4 py-2 bg-purple-600 text-white rounded">
            Voltar
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg p-4">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">{modeling.title || 'Modelagem'}</h1>
          <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
            Voltar
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Título</label>
            <p className="text-white">{modeling.title}</p>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Tipo</label>
            <p className="text-white">{modeling.type}</p>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Status</label>
            <p className="text-white">{modeling.status}</p>
          </div>

          {modeling.modeling && (
            <div className="p-4 bg-purple-900/20 rounded border border-purple-500/30">
              <h3 className="font-bold text-purple-300 mb-2">Dados de Monitoramento</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p>🎨 Criativos: {modeling.modeling.creativesCount || 0}</p>
                <p>📅 Início: {modeling.modeling.monitorStart ? new Date(modeling.modeling.monitorStart).toLocaleDateString() : '—'}</p>
                <p>✅ Modelável: {modeling.modeling.modelavel ? 'Sim' : 'Não'}</p>
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-2">
            <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              Salvar
            </button>
            <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
              Cancelar
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ModelingEditor;