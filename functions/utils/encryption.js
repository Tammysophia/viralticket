// VT: secure-agent - Utilitários de criptografia AES-256-GCM
import crypto from 'crypto';

const ALGO = 'aes-256-gcm';
const IV_LENGTH = 12; // GCM standard
const AUTH_TAG_LENGTH = 16;

/**
 * Obtém a chave mestra do ambiente (32 bytes hex = 64 caracteres)
 * IMPORTANTE: Deve estar configurada em Firebase Config como AGENT_MASTER_KEY
 */
function getMasterKey() {
  const key = process.env.AGENT_MASTER_KEY;
  if (!key) {
    throw new Error('AGENT_MASTER_KEY não configurada nas variáveis de ambiente');
  }
  if (key.length !== 64) {
    throw new Error('AGENT_MASTER_KEY deve ter 64 caracteres hexadecimais (32 bytes)');
  }
  return Buffer.from(key, 'hex');
}

/**
 * Criptografa um prompt usando AES-256-GCM
 * @param {string} plaintext - Texto do prompt a ser criptografado
 * @returns {string} - String base64 contendo: IV (12) + AuthTag (16) + CipherText
 */
export function encryptPrompt(plaintext) {
  try {
    const key = getMasterKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    
    const cipher = crypto.createCipheriv(ALGO, key, iv);
    
    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final()
    ]);
    
    const authTag = cipher.getAuthTag();
    
    // Combinar: IV + AuthTag + CipherText
    const combined = Buffer.concat([iv, authTag, encrypted]);
    
    return combined.toString('base64');
  } catch (error) {
    console.error('Erro ao criptografar prompt:', error);
    throw new Error('Falha na criptografia do prompt');
  }
}

/**
 * Descriptografa um prompt criptografado
 * @param {string} encryptedBase64 - String base64 do prompt criptografado
 * @returns {string} - Texto plano do prompt
 */
export function decryptPrompt(encryptedBase64) {
  try {
    const key = getMasterKey();
    const raw = Buffer.from(encryptedBase64, 'base64');
    
    // Extrair componentes
    const iv = raw.slice(0, IV_LENGTH);
    const authTag = raw.slice(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const cipherText = raw.slice(IV_LENGTH + AUTH_TAG_LENGTH);
    
    const decipher = crypto.createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(authTag);
    
    const decrypted = Buffer.concat([
      decipher.update(cipherText),
      decipher.final()
    ]);
    
    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Erro ao descriptografar prompt:', error);
    throw new Error('Falha na descriptografia do prompt - chave inválida ou dados corrompidos');
  }
}

/**
 * Gera hash SHA-256 de um texto (para auditoria)
 * @param {string} text - Texto para gerar hash
 * @returns {string} - Hash hex
 */
export function hashPrompt(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

/**
 * Gera uma nova chave mestra (usar apenas para setup inicial ou rotação)
 * @returns {string} - Chave hex de 64 caracteres
 */
export function generateMasterKey() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Re-criptografa todos os prompts com uma nova chave
 * @param {Array} encryptedPrompts - Array de prompts criptografados com chave antiga
 * @param {string} oldKey - Chave antiga (hex 64 chars)
 * @param {string} newKey - Nova chave (hex 64 chars)
 * @returns {Array} - Prompts re-criptografados
 */
export function rotateEncryption(encryptedPrompts, oldKey, newKey) {
  const originalKey = process.env.AGENT_MASTER_KEY;
  
  try {
    const results = [];
    
    for (const encPrompt of encryptedPrompts) {
      // Descriptografar com chave antiga
      process.env.AGENT_MASTER_KEY = oldKey;
      const plaintext = decryptPrompt(encPrompt);
      
      // Re-criptografar com chave nova
      process.env.AGENT_MASTER_KEY = newKey;
      const newEncrypted = encryptPrompt(plaintext);
      
      results.push(newEncrypted);
    }
    
    return results;
  } finally {
    // Restaurar chave original
    process.env.AGENT_MASTER_KEY = originalKey;
  }
}
