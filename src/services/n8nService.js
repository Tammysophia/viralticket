/**
 * ViralTicket v2.0 - n8n Integration Service
 * Centraliza todas as chamadas para o cérebro da IA no n8n.
 */

const N8N_BASE_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

const callN8N = async (endpoint, data) => {
  if (!N8N_BASE_URL) {
    throw new Error('Configuração do n8n (VITE_N8N_WEBHOOK_URL) não encontrada.');
  }

  try {
    const response = await fetch(`${N8N_BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Erro no servidor (n8n): ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Erro ao chamar n8n [${endpoint}]:`, error);
    throw error;
  }
};

export const n8nService = {
  /**
   * Gera uma oferta do zero (Busca automática ou Link direto)
   */
  generateOffer: (data) => callN8N('generate-offer', data),

  /**
   * Modela uma oferta a partir de uma URL de página de vendas
   */
  modelSalesPage: (data) => callN8N('model-sales-page', data),

  /**
   * Recupera uma oferta que parou de vender
   */
  recoverOffer: (data) => callN8N('recover-offer', data),

  /**
   * Traduz e sugere países para expansão global
   */
  translateOffer: (data) => callN8N('translate-offer', data),
  
  /**
   * Gera formatos específicos (Gama, Canva, Quiz, WordPress)
   */
  generateFormat: (data) => callN8N('generate-format', data),
};
