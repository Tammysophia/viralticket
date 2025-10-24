// Utilitário de criptografia para chaves API
// Nota: Em produção, usar uma biblioteca como crypto-js ou Web Crypto API

const ENCRYPTION_KEY = 'VIRALTICKET_SECRET_KEY_2024'; // Em produção, usar variável de ambiente

/**
 * Criptografa uma string usando Base64 e rotação de caracteres
 * @param {string} text - Texto a ser criptografado
 * @returns {string} - Texto criptografado
 */
export const encrypt = (text) => {
  if (!text) return '';
  
  try {
    // Adicionar salt aleatório
    const salt = Math.random().toString(36).substring(7);
    const combined = `${salt}:${text}`;
    
    // Converter para Base64
    const base64 = btoa(combined);
    
    // Aplicar rotação de caracteres simples
    const rotated = base64.split('').map((char, index) => {
      const code = char.charCodeAt(0);
      const rotation = (index % ENCRYPTION_KEY.length);
      return String.fromCharCode(code + rotation);
    }).join('');
    
    return `enc_${rotated}`;
  } catch (error) {
    console.error('Erro ao criptografar:', error);
    return text;
  }
};

/**
 * Descriptografa uma string criptografada
 * @param {string} encryptedText - Texto criptografado
 * @returns {string} - Texto descriptografado
 */
export const decrypt = (encryptedText) => {
  if (!encryptedText) return '';
  
  try {
    // Verificar se está criptografado
    if (!encryptedText.startsWith('enc_')) {
      return encryptedText;
    }
    
    // Remover prefixo
    const encrypted = encryptedText.substring(4);
    
    // Reverter rotação de caracteres
    const unrotated = encrypted.split('').map((char, index) => {
      const code = char.charCodeAt(0);
      const rotation = (index % ENCRYPTION_KEY.length);
      return String.fromCharCode(code - rotation);
    }).join('');
    
    // Decodificar Base64
    const decoded = atob(unrotated);
    
    // Remover salt
    const [, text] = decoded.split(':');
    
    return text || decoded;
  } catch (error) {
    console.error('Erro ao descriptografar:', error);
    return encryptedText;
  }
};

/**
 * Verifica se uma string está criptografada
 * @param {string} text - Texto a verificar
 * @returns {boolean} - True se estiver criptografado
 */
export const isEncrypted = (text) => {
  return text && text.startsWith('enc_');
};

/**
 * Mascara uma chave API para exibição
 * @param {string} key - Chave API
 * @param {boolean} encrypted - Se a chave está criptografada
 * @returns {string} - Chave mascarada
 */
export const maskKey = (key, encrypted = false) => {
  if (!key) return '';
  
  // Se estiver criptografada, descriptografar primeiro
  const actualKey = encrypted ? decrypt(key) : key;
  
  if (actualKey.length <= 8) return '••••••••';
  
  const start = actualKey.substring(0, 4);
  const end = actualKey.substring(actualKey.length - 4);
  const middle = '•'.repeat(Math.min(actualKey.length - 8, 20));
  
  return `${start}${middle}${end}`;
};
