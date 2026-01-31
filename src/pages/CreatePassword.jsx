import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase/supabaseClient';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import toast from 'react-hot-toast';

const CreatePassword = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreatePassword = async (e) => {
    e.preventDefault();
    if (password.length < 6) return toast.error('Mínimo 6 caracteres');
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success('Senha criada com sucesso!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 gradient-bg">
      <Card className="max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">Criar Nova Senha</h2>
        <form onSubmit={handleCreatePassword} className="space-y-4">
          <Input
            type="password"
            placeholder="Sua nova senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" loading={loading} className="w-full">
            Salvar Senha
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default CreatePassword;
