/**
 * Serviço real de gerenciamento de ofertas no Firestore
 */

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import { fetchYouTubeComments, extractVideoId, fetchVideoInfo } from '../services/youtubeService';
import { generateOffer } from '../services/openaiService';

const OFFERS_COLLECTION = 'offers';
const COMMENTS_COLLECTION = 'comments';

/**
 * Extrai comentários reais do YouTube e salva no Firestore
 * @param {string} videoUrl - URL do vídeo do YouTube
 * @param {string} youtubeApiKey - Chave da API do YouTube
 * @param {string} userId - ID do usuário
 * @returns {Promise<Object>} - Resultado da extração
 */
export const extractCommentsFromYouTube = async (videoUrl, youtubeApiKey, userId) => {
  try {
    // Extrair ID do vídeo
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      throw new Error('URL do YouTube inválida');
    }
    
    // Buscar informações do vídeo
    const videoInfo = await fetchVideoInfo(videoId, youtubeApiKey);
    
    // Buscar comentários reais
    const comments = await fetchYouTubeComments(videoId, youtubeApiKey, 50);
    
    // Salvar comentários no Firestore
    const savedComments = [];
    for (const comment of comments) {
      const commentRef = await addDoc(collection(db, COMMENTS_COLLECTION), {
        userId,
        videoId,
        videoTitle: videoInfo.title,
        videoUrl,
        author: comment.author,
        authorAvatar: comment.authorAvatar,
        text: comment.text,
        likeCount: comment.likeCount,
        publishedAt: comment.publishedAt,
        extractedAt: serverTimestamp(),
        processed: false,
      });
      
      savedComments.push({
        id: commentRef.id,
        ...comment,
      });
    }
    
    return {
      success: true,
      videoInfo,
      comments: savedComments,
      totalComments: savedComments.length,
    };
    
  } catch (error) {
    // Erro será tratado no componente
    throw error;
  }
};

/**
 * Gera oferta com IA baseada em um comentário e salva no Firestore
 * @param {string} commentText - Texto do comentário
 * @param {string} commentId - ID do comentário
 * @param {string} openaiApiKey - Chave da API OpenAI
 * @param {string} userId - ID do usuário
 * @param {Object} metadata - Metadados adicionais
 * @returns {Promise<Object>} - Oferta gerada
 */
export const generateOfferFromComment = async (
  commentText,
  commentId,
  openaiApiKey,
  userId,
  metadata = {}
) => {
  try {
    // Gerar oferta com OpenAI
    const aiOffer = await generateOffer(commentText, openaiApiKey);
    
    // Salvar no Firestore
    const offerRef = await addDoc(collection(db, OFFERS_COLLECTION), {
      userId,
      commentId,
      titulo: aiOffer.titulo,
      descricao: aiOffer.descricao,
      categoria: aiOffer.categoria || 'Sem categoria',
      publico: aiOffer.publico || 'Público geral',
      gatilho: aiOffer.gatilho || 'N/A',
      callToAction: aiOffer.call_to_action || 'Saiba mais',
      comentarioOriginal: commentText,
      status: 'todo',
      prioridade: 'media',
      tags: metadata.tags || [],
      videoUrl: metadata.videoUrl || '',
      videoTitle: metadata.videoTitle || '',
      geradoPorIA: true,
      modelo: aiOffer.modelo || 'gpt-4o-mini',
      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp(),
    });
    
    // Marcar comentário como processado
    if (commentId) {
      const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
      await updateDoc(commentRef, {
        processed: true,
        processedAt: serverTimestamp(),
      });
    }
    
    return {
      id: offerRef.id,
      titulo: aiOffer.titulo,
      descricao: aiOffer.descricao,
      categoria: aiOffer.categoria,
      publico: aiOffer.publico,
      gatilho: aiOffer.gatilho,
      callToAction: aiOffer.call_to_action,
      comentarioOriginal: commentText,
      status: 'todo',
      geradoPorIA: true,
    };
    
  } catch (error) {
    // Erro será tratado no componente
    throw error;
  }
};

/**
 * Busca todas as ofertas de um usuário do Firestore
 * @param {string} userId - ID do usuário
 * @returns {Promise<Array>} - Array de ofertas
 */
export const getUserOffers = async (userId) => {
  try {
    const offersRef = collection(db, OFFERS_COLLECTION);
    const q = query(
      offersRef,
      where('userId', '==', userId),
      orderBy('criadoEm', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const offers = [];
    
    querySnapshot.forEach((doc) => {
      offers.push({
        id: doc.id,
        ...doc.data(),
        criadoEm: doc.data().criadoEm?.toDate?.() || new Date(),
        atualizadoEm: doc.data().atualizadoEm?.toDate?.() || new Date(),
      });
    });
    
    return offers;
    
  } catch (error) {
    // Erro será tratado no componente
    throw error;
  }
};

/**
 * Atualiza uma oferta no Firestore
 * @param {string} offerId - ID da oferta
 * @param {Object} updates - Campos a atualizar
 * @returns {Promise<void>}
 */
export const updateOffer = async (offerId, updates) => {
  try {
    const offerRef = doc(db, OFFERS_COLLECTION, offerId);
    await updateDoc(offerRef, {
      ...updates,
      atualizadoEm: serverTimestamp(),
    });
  } catch (error) {
    // Erro será tratado no componente
    throw error;
  }
};

/**
 * Deleta uma oferta do Firestore
 * @param {string} offerId - ID da oferta
 * @returns {Promise<void>}
 */
export const deleteOffer = async (offerId) => {
  try {
    const offerRef = doc(db, OFFERS_COLLECTION, offerId);
    await deleteDoc(offerRef);
  } catch (error) {
    // Erro será tratado no componente
    throw error;
  }
};

/**
 * Duplica uma oferta no Firestore
 * @param {string} offerId - ID da oferta
 * @param {string} userId - ID do usuário
 * @returns {Promise<string>} - ID da nova oferta
 */
export const duplicateOffer = async (offerId, userId) => {
  try {
    const offerRef = doc(db, OFFERS_COLLECTION, offerId);
    const offerDoc = await getDocs(query(collection(db, OFFERS_COLLECTION), where('__name__', '==', offerId)));
    
    if (offerDoc.empty) {
      throw new Error('Oferta não encontrada');
    }
    
    const offerData = offerDoc.docs[0].data();
    
    // Criar cópia
    const newOfferRef = await addDoc(collection(db, OFFERS_COLLECTION), {
      ...offerData,
      titulo: `${offerData.titulo} (Cópia)`,
      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp(),
    });
    
    return newOfferRef.id;
    
  } catch (error) {
    // Erro será tratado no componente
    throw error;
  }
};

/**
 * Busca comentários não processados de um usuário
 * @param {string} userId - ID do usuário
 * @returns {Promise<Array>} - Array de comentários
 */
export const getUnprocessedComments = async (userId) => {
  try {
    const commentsRef = collection(db, COMMENTS_COLLECTION);
    const q = query(
      commentsRef,
      where('userId', '==', userId),
      where('processed', '==', false),
      orderBy('extractedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const comments = [];
    
    querySnapshot.forEach((doc) => {
      comments.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    
    return comments;
    
  } catch (error) {
    console.error('❌ Erro ao buscar comentários:', error);
    throw error;
  }
};

/**
 * Busca estatísticas do usuário
 * @param {string} userId - ID do usuário
 * @returns {Promise<Object>} - Estatísticas
 */
export const getUserStats = async (userId) => {
  try {
    const offersRef = collection(db, OFFERS_COLLECTION);
    const commentsRef = collection(db, COMMENTS_COLLECTION);
    
    // Buscar todas as ofertas
    const offersQuery = query(offersRef, where('userId', '==', userId));
    const offersSnapshot = await getDocs(offersQuery);
    
    // Buscar todos os comentários
    const commentsQuery = query(commentsRef, where('userId', '==', userId));
    const commentsSnapshot = await getDocs(commentsQuery);
    
    // Contar por status
    let todoCount = 0;
    let inProgressCount = 0;
    let doneCount = 0;
    
    offersSnapshot.forEach((doc) => {
      const status = doc.data().status;
      if (status === 'todo') todoCount++;
      else if (status === 'in-progress') inProgressCount++;
      else if (status === 'done') doneCount++;
    });
    
    return {
      totalOfertas: offersSnapshot.size,
      totalComentarios: commentsSnapshot.size,
      ofertasPorStatus: {
        todo: todoCount,
        'in-progress': inProgressCount,
        done: doneCount,
      },
      comentariosNaoProcessados: commentsSnapshot.docs.filter(
        (doc) => !doc.data().processed
      ).length,
    };
    
  } catch (error) {
    // Retornar valores padrão em caso de erro
    return {
      totalOfertas: 0,
      totalComentarios: 0,
      ofertasPorStatus: {
        todo: 0,
        'in-progress': 0,
        done: 0,
      },
      comentariosNaoProcessados: 0,
    };
  }
};

export default {
  extractCommentsFromYouTube,
  generateOfferFromComment,
  getUserOffers,
  updateOffer,
  deleteOffer,
  duplicateOffer,
  getUnprocessedComments,
  getUserStats,
};
