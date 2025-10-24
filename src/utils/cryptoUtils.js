/**
 * Utilitário de Criptografia para ViralTicket
 * Simulação de criptografia AES-256 para armazenamento seguro de chaves API
 * 
 * Nota: Esta é uma implementação simulada. Em produção, usar crypto-js ou similar.
 */

// Chave mestra simulada (em produção, deve ser armazenada de forma segura)
const MASTER_KEY = 'VIRALTICKET_MASTER_KEY_2024_SECURE';

/**
 * Simula criptografia AES-256
 * @param {string} plaintext - Texto a ser criptografado
 * @returns {string} Texto criptografado em base64
 */
export const encrypt = (plaintext) => {
  if (!plaintext) return '';
  
  try {
    // Simulação de criptografia usando Base64 + transformação
    const encoded = btoa(plaintext);
    const scrambled = encoded
      .split('')
      .map((char, i) => String.fromCharCode(char.charCodeAt(0) ^ MASTER_KEY.charCodeAt(i % MASTER_KEY.length)))
      .join('');
    
    // Retorna em formato base64
    return btoa(scrambled);
  } catch (error) {
    console.error('Erro ao criptografar:', error);
    return plaintext;
  }
};

/**
 * Simula descriptografia AES-256
 * @param {string} ciphertext - Texto criptografado em base64
 * @returns {string} Texto descriptografado
 */
export const decrypt = (ciphertext) => {
  if (!ciphertext) return '';
  
  try {
    // Decodifica da base64
    const scrambled = atob(ciphertext);
    
    // Reverte a transformação
    const encoded = scrambled
      .split('')
      .map((char, i) => String.fromCharCode(char.charCodeAt(0) ^ MASTER_KEY.charCodeAt(i % MASTER_KEY.length)))
      .join('');
    
    // Decodifica de Base64
    return atob(encoded);
  } catch (error) {
    console.error('Erro ao descriptografar:', error);
    return ciphertext;
  }
};

/**
 * Gera um hash simples para verificação
 * @param {string} text - Texto a ser hasheado
 * @returns {string} Hash hexadecimal
 */
export const hash = (text) => {
  if (!text) return '';
  
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString(16).padStart(8, '0');
};

/**
 * Mascara uma chave API para exibição segura
 * @param {string} apiKey - Chave API completa
 * @returns {string} Chave mascarada
 */
export const maskAPIKey = (apiKey) => {
  if (!apiKey || apiKey.length < 8) return '••••••••';
  
  const start = apiKey.substring(0, 4);
  const end = apiKey.substring(apiKey.length - 4);
  const middle = '•'.repeat(Math.min(apiKey.length - 8, 20));
  
  return `${start}${middle}${end}`;
};

/**
 * Valida o formato de uma chave API
 * @param {string} apiKey - Chave API a ser validada
 * @param {string} type - Tipo da API (youtube, openai, etc)
 * @returns {boolean} True se válida
 */
export const validateAPIKey = (apiKey, type = 'youtube') => {
  if (!apiKey) return false;
  
  const validators = {
    youtube: /^AIza[0-9A-Za-z-_]{35}$/,
    openai: /^sk-[A-Za-z0-9]{48}$/,
    stripe: /^(sk|pk)_(test|live)_[0-9a-zA-Z]{24,}$/,
  };
  
  const validator = validators[type];
  return validator ? validator.test(apiKey) : apiKey.length >= 20;
};

/**
 * Gera uma chave API aleatória para testes
 * @param {string} type - Tipo da API
 * @returns {string} Chave API gerada
 */
export const generateTestAPIKey = (type = 'youtube') => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  
  const prefixes = {
    youtube: 'AIza',
    openai: 'sk-',
    stripe: 'sk_test_',
  };
  
  const lengths = {
    youtube: 39,
    openai: 51,
    stripe: 32,
  };
  
  const prefix = prefixes[type] || '';
  const length = (lengths[type] || 32) - prefix.length;
  
  let result = prefix;
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

/**
 * Armazena chave de forma segura no localStorage (criptografada)
 * @param {string} key - Nome da chave
 * @param {string} value - Valor a ser armazenado
 */
export const secureStore = (key, value) => {
  try {
    const encrypted = encrypt(value);
    localStorage.setItem(`secure_${key}`, encrypted);
    return true;
  } catch (error) {
    console.error('Erro ao armazenar chave:', error);
    return false;
  }
};

/**
 * Recupera chave criptografada do localStorage
 * @param {string} key - Nome da chave
 * @returns {string} Valor descriptografado
 */
export const secureRetrieve = (key) => {
  try {
    const encrypted = localStorage.getItem(`secure_${key}`);
    if (!encrypted) return null;
    return decrypt(encrypted);
  } catch (error) {
    console.error('Erro ao recuperar chave:', error);
    return null;
  }
};

/**
 * Remove chave do armazenamento seguro
 * @param {string} key - Nome da chave
 */
export const secureRemove = (key) => {
  try {
    localStorage.removeItem(`secure_${key}`);
    return true;
  } catch (error) {
    console.error('Erro ao remover chave:', error);
    return false;
  }
};

export default {
  encrypt,
  decrypt,
  hash,
  maskAPIKey,
  validateAPIKey,
  generateTestAPIKey,
  secureStore,
  secureRetrieve,
  secureRemove,
};
