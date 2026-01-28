import React from 'react';
import Card from './Card';

const AdminOverview = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <h3 className="text-gray-400 text-sm font-medium">Total de Usuários</h3>
        <p className="text-3xl font-bold mt-2">--</p>
      </Card>
      <Card>
        <h3 className="text-gray-400 text-sm font-medium">Ofertas Geradas</h3>
        <p className="text-3xl font-bold mt-2">--</p>
      </Card>
      <Card>
        <h3 className="text-gray-400 text-sm font-medium">Planos Ativos</h3>
        <p className="text-3xl font-bold mt-2">--</p>
      </Card>
    </div>
  );
};

export default AdminOverview;
