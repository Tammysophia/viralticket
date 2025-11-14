import { db } from '../config/firebase';
import { doc, setDoc, getDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Gera um token único para criação/redefinição de senha
 * @param {string} email - Email do usuário
 * @param {string} type - Tipo: 'create' ou 'reset'
 * @returns {Promise<string>} - Token gerado
 */
export const generatePasswordToken = async (email, type = 'create') => {
  try {
    // Gerar token único (UUID-like)
    const token = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;
    
    // Calcular expiração (24 horas)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    // Salvar no Firestore
    if (db) {
      await setDoc(doc(db, 'passwordTokens', token), {
        email,
        type,
        token,
        used: false,
        createdAt: serverTimestamp(),
        expiresAt: expiresAt.toISOString(),
      });
    }
    
    // Também salvar no localStorage (fallback)
    const tokens = JSON.parse(localStorage.getItem('viralticket_password_tokens') || '{}');
    tokens[token] = {
      email,
      type,
      used: false,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
    };
    localStorage.setItem('viralticket_password_tokens', JSON.stringify(tokens));
    
    console.log('✅ Token gerado:', token.substring(0, 20) + '...');
    return token;
  } catch (error) {
    console.error('❌ Erro ao gerar token:', error);
    throw error;
  }
};

/**
 * Valida um token de senha
 * @param {string} token - Token a validar
 * @returns {Promise<{valid: boolean, email?: string, message?: string}>}
 */
export const validatePasswordToken = async (token) => {
  try {
    if (!token) {
      return { valid: false, message: 'Token não fornecido' };
    }
    
    // Tentar buscar do Firestore
    if (db) {
      const tokenDoc = await getDoc(doc(db, 'passwordTokens', token));
      
      if (tokenDoc.exists()) {
        const data = tokenDoc.data();
        
        // Verificar se já foi usado
        if (data.used) {
          return { valid: false, message: 'Token já foi utilizado' };
        }
        
        // Verificar expiração
        const expiresAt = new Date(data.expiresAt);
        const now = new Date();
        
        if (now > expiresAt) {
          return { valid: false, message: 'Token expirado (válido por 24 horas)' };
        }
        
        return { valid: true, email: data.email };
      }
    }
    
    // Fallback: buscar do localStorage
    const tokens = JSON.parse(localStorage.getItem('viralticket_password_tokens') || '{}');
    const tokenData = tokens[token];
    
    if (tokenData) {
      if (tokenData.used) {
        return { valid: false, message: 'Token já foi utilizado' };
      }
      
      const expiresAt = new Date(tokenData.expiresAt);
      const now = new Date();
      
      if (now > expiresAt) {
        return { valid: false, message: 'Token expirado (válido por 24 horas)' };
      }
      
      return { valid: true, email: tokenData.email };
    }
    
    return { valid: false, message: 'Token inválido ou não encontrado' };
  } catch (error) {
    console.error('❌ Erro ao validar token:', error);
    return { valid: false, message: 'Erro ao validar token' };
  }
};

/**
 * Marca um token como usado
 * @param {string} token - Token a marcar
 */
export const markTokenAsUsed = async (token) => {
  try {
    // Marcar no Firestore
    if (db) {
      await setDoc(doc(db, 'passwordTokens', token), {
        used: true,
        usedAt: serverTimestamp(),
      }, { merge: true });
    }
    
    // Marcar no localStorage
    const tokens = JSON.parse(localStorage.getItem('viralticket_password_tokens') || '{}');
    if (tokens[token]) {
      tokens[token].used = true;
      tokens[token].usedAt = new Date().toISOString();
      localStorage.setItem('viralticket_password_tokens', JSON.stringify(tokens));
    }
    
    console.log('✅ Token marcado como usado');
  } catch (error) {
    console.error('❌ Erro ao marcar token:', error);
  }
};

/**
 * Deleta um token
 * @param {string} token - Token a deletar
 */
export const deletePasswordToken = async (token) => {
  try {
    // Deletar do Firestore
    if (db) {
      await deleteDoc(doc(db, 'passwordTokens', token));
    }
    
    // Deletar do localStorage
    const tokens = JSON.parse(localStorage.getItem('viralticket_password_tokens') || '{}');
    delete tokens[token];
    localStorage.setItem('viralticket_password_tokens', JSON.stringify(tokens));
    
    console.log('✅ Token deletado');
  } catch (error) {
    console.error('❌ Erro ao deletar token:', error);
  }
};

/**
 * Gera URL completa para criação de senha
 * @param {string} token - Token gerado
 * @returns {string} - URL completa
 */
export const generatePasswordResetURL = (token) => {
  const baseURL = window.location.origin;
  return `${baseURL}/criar-senha?token=${token}`;
};
