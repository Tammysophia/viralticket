const N8N_BASE_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

const callN8N = async (endpoint, data) => {
  if (!N8N_BASE_URL) throw new Error('VITE_N8N_WEBHOOK_URL não configurada.');
  const response = await fetch(`${N8N_BASE_URL}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Erro n8n: ${response.status}`);
  return await response.json();
};

export const n8nService = {
  generateOffer: (data) => callN8N('generate-offer', data),
  modelSalesPage: (data) => callN8N('model-sales-page', data),
  recoverOffer: (data) => callN8N('recover-offer', data),
  translateOffer: (data) => callN8N('translate-offer', data),
  generateFormat: (data) => callN8N('generate-format', data),
};
