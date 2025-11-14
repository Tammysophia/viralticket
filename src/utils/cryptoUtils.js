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
  if (!encryptedText) {
    console.warn('🔒 VT: Texto vazio para descriptografar');
    return '';
  }
  
  try {
    // Verificar se está criptografado
    if (!encryptedText.startsWith('enc_')) {
      console.log('🔓 VT: Texto não criptografado, retornando original');
      return encryptedText;
    }
    
    console.log('🔒 VT: Iniciando descriptografia...');
    
    // Remover prefixo
    const encrypted = encryptedText.substring(4);
    console.log('🔒 VT: Prefixo removido, tamanho:', encrypted.length);
    
    // Reverter rotação de caracteres
    const unrotated = encrypted.split('').map((char, index) => {
      const code = char.charCodeAt(0);
      const rotation = (index % ENCRYPTION_KEY.length);
      return String.fromCharCode(code - rotation);
    }).join('');
    console.log('🔒 VT: Rotação revertida');
    
    // Decodificar Base64
    const decoded = atob(unrotated);
    console.log('🔒 VT: Base64 decodificado, tamanho:', decoded.length);
    
    // Remover salt
    const parts = decoded.split(':');
    const text = parts.length > 1 ? parts[1] : decoded;
    
    console.log('✅ VT: Descriptografia concluída! Tamanho final:', text.length);
    console.log('✅ VT: Começa com:', text.substring(0, 5) + '...');
    
    return text;
  } catch (error) {
    console.error('❌ VT: Erro ao descriptografar:', error);
    console.error('❌ VT: Texto problemático:', encryptedText.substring(0, 20) + '...');
    // Em caso de erro, retornar o texto original (pode estar em plain text)
    return encryptedText.startsWith('enc_') ? '' : encryptedText;
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
