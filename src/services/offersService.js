import { supabase } from '../config/supabase';

export const createOfferFromAI = async (data) => {
  try {
    const { data: offer, error } = await supabase
      .from('offers')
      .insert([{
        user_id: data.userId,
        content: data.fullResponse || data.content,
        tema: data.tema,
        agente: data.agent,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return offer.id;
  } catch (error) {
    console.error('Erro ao criar oferta:', error);
    throw error;
  }
};

export const updateOffer = async (id, patch) => {
  try {
    const { error } = await supabase
      .from('offers')
      .update({
        ...patch,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao atualizar oferta:', error);
    throw error;
  }
};

export const deleteOffer = async (id) => {
  try {
    const { error } = await supabase
      .from('offers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao excluir oferta:', error);
    throw error;
  }
};

export const getUserOffers = async (userId) => {
  if (!userId) return [];
  try {
    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(offer => ({
      ...offer,
      id: offer.id.toString(),
      content: offer.content,
      // Mapear campos para compatibilidade com o layout original
      fullResponse: offer.content,
      createdAt: offer.created_at
    }));
  } catch (error) {
    console.error('Erro ao buscar ofertas:', error);
    return [];
  }
};

export const subscribeToUserOffers = (userId, type, callback) => {
  if (!userId) return () => {};

  // Busca inicial
  getUserOffers(userId).then(offers => {
    callback(offers);
  });
  
  const subscription = supabase
    .channel(`offers_${userId}`)
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'offers',
      filter: `user_id=eq.${userId}`
    }, () => {
      getUserOffers(userId).then(callback);
    })
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};

export const addYoutubeLink = async (offerId, url) => { return; };
export const removeYoutubeLink = async (offerId, url) => { return; };
