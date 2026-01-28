import { supabase } from './supabase/supabaseClient';

/**
 * VT: Cria uma oferta a partir da IA no Supabase
 * @param {Object} data - Dados da oferta
 * @returns {Promise<string>} - ID da oferta criada
 */
export const createOfferFromAI = async (data) => {
  try {
    const { data: newOffer, error } = await supabase
      .from('offers')
      .insert([
        {
          user_id: data.userId,
          title: data.title || 'Nova Oferta',
          type: data.type || 'oferta',
          status: data.status || 'execucao',
          full_response: data.fullResponse || '',
          youtube_links: data.youtubeLinks || [],
          metadata: data.metadata || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return newOffer.id;
  } catch (error) {
    console.error('VT: Erro ao criar oferta no Supabase:', error);
    throw error;
  }
};

/**
 * VT: Busca todas as ofertas do usuário no Supabase
 * @param {string} userId - ID do usuário
 * @param {string} type - Tipo da oferta (opcional)
 * @returns {Promise<Array>} - Lista de ofertas
 */
export const getUserOffers = async (userId, type) => {
  try {
    let query = supabase
      .from('offers')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    const { data: offers, error } = await query;

    if (error) throw error;
    return offers.map(o => ({
      ...o,
      userId: o.user_id,
      fullResponse: o.full_response,
      youtubeLinks: o.youtube_links,
      updatedAt: o.updated_at,
      createdAt: o.created_at
    }));
  } catch (error) {
    console.error('VT: Erro ao buscar ofertas no Supabase:', error);
    return [];
  }
};

/**
 * VT: Atualiza uma oferta no Supabase
 */
export const updateOffer = async (id, patch) => {
  try {
    const { error } = await supabase
      .from('offers')
      .update({
        ...patch,
        user_id: patch.userId,
        full_response: patch.fullResponse,
        youtube_links: patch.youtubeLinks,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('VT: Erro ao atualizar oferta no Supabase:', error);
    throw error;
  }
};

/**
 * VT: Exclui uma oferta no Supabase
 */
export const deleteOffer = async (id) => {
  try {
    const { error } = await supabase
      .from('offers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('VT: Erro ao excluir oferta no Supabase:', error);
    throw error;
  }
};

/**
 * VT: Escuta mudanças em tempo real nas ofertas (opcional, para manter paridade com Firebase)
 */
export const subscribeToOffers = (userId, type, callback) => {
  const channel = supabase
    .channel('public:offers')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'offers',
        filter: `user_id=eq.${userId}`,
      },
      () => {
        getUserOffers(userId, type).then(callback);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
