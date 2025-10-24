/**
 * Serviço real de integração com OpenAI API
 */

import { decrypt } from '../utils/cryptoUtils';

const OPENAI_API_BASE = 'https://api.openai.com/v1';
const MODEL = 'gpt-4o-mini';

/**
 * Gera uma oferta digital viral baseada em um comentário usando GPT-4o-mini
 * @param {string} commentText - Texto do comentário
 * @param {string} apiKey - Chave da API OpenAI (pode estar criptografada)
 * @param {Object} options - Opções adicionais
 * @returns {Promise<Object>} - Oferta gerada
 */
export const generateOffer = async (commentText, apiKey, options = {}) => {
  try {
    // Descriptografar chave se necessário
    let decryptedKey = apiKey;
    try {
      if (apiKey && apiKey.includes('=')) {
        decryptedKey = decrypt(apiKey);
      }
    } catch (e) {
      console.warn('⚠️ Chave não criptografada, usando diretamente');
      decryptedKey = apiKey;
    }
    
    // Prompt otimizado para gerar ofertas virais
    const systemPrompt = `Você é um especialista em marketing digital e criação de ofertas virais. 
Sua missão é analisar comentários de pessoas e criar ofertas irresistíveis baseadas nas necessidades expressas.

Diretrizes:
- Identifique a DOR ou DESEJO principal no comentário
- Crie uma oferta específica e focada
- Use linguagem persuasiva e emocional
- Seja conciso mas impactante
- Foque em benefícios, não características
- Use gatilhos mentais (urgência, escassez, prova social)

Formato da resposta (JSON):
{
  "titulo": "Título chamativo da oferta (máx 60 caracteres)",
  "descricao": "Descrição detalhada e persuasiva (máx 200 caracteres)",
  "categoria": "categoria da oferta",
  "publico": "público-alvo identificado",
  "gatilho": "principal gatilho mental usado",
  "call_to_action": "CTA sugerido"
}`;

    const userPrompt = `Analise este comentário e crie uma oferta digital viral:

"${commentText}"

Retorne APENAS o JSON sem texto adicional.`;

    console.log('🤖 Gerando oferta com OpenAI...');
    
    const response = await fetch(`${OPENAI_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${decryptedKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: options.temperature || 0.8,
        max_tokens: options.maxTokens || 500,
        response_format: { type: 'json_object' },
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Erro ao gerar oferta com IA');
    }
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse do JSON retornado
    let offer;
    try {
      offer = JSON.parse(content);
    } catch (e) {
      console.error('❌ Erro ao fazer parse do JSON:', content);
      throw new Error('Resposta da IA em formato inválido');
    }
    
    console.log('✅ Oferta gerada:', offer.titulo);
    
    return {
      ...offer,
      comentarioOriginal: commentText,
      modelo: MODEL,
      geradoEm: new Date().toISOString(),
    };
    
  } catch (error) {
    console.error('❌ Erro ao gerar oferta com IA:', error);
    throw error;
  }
};

/**
 * Melhora uma oferta existente
 * @param {string} offerText - Texto da oferta
 * @param {string} apiKey - Chave da API
 * @param {string} aspectToImprove - Aspecto a melhorar
 * @returns {Promise<string>} - Oferta melhorada
 */
export const improveOffer = async (offerText, apiKey, aspectToImprove = 'geral') => {
  try {
    let decryptedKey = apiKey;
    try {
      if (apiKey && apiKey.includes('=')) {
        decryptedKey = decrypt(apiKey);
      }
    } catch (e) {
      decryptedKey = apiKey;
    }
    
    const prompt = `Melhore esta oferta focando em: ${aspectToImprove}

Oferta atual: "${offerText}"

Retorne apenas a oferta melhorada, sem explicações.`;

    const response = await fetch(`${OPENAI_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${decryptedKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Erro ao melhorar oferta');
    }
    
    const data = await response.json();
    return data.choices[0].message.content.trim();
    
  } catch (error) {
    console.error('❌ Erro ao melhorar oferta:', error);
    throw error;
  }
};

/**
 * Valida se a chave da API do OpenAI está funcionando
 * @param {string} apiKey - Chave da API
 * @returns {Promise<boolean>} - True se válida
 */
export const validateOpenAIKey = async (apiKey) => {
  try {
    let decryptedKey = apiKey;
    try {
      if (apiKey && apiKey.includes('=')) {
        decryptedKey = decrypt(apiKey);
      }
    } catch (e) {
      decryptedKey = apiKey;
    }
    
    const response = await fetch(`${OPENAI_API_BASE}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${decryptedKey}`,
      },
    });
    
    return response.ok;
    
  } catch (error) {
    return false;
  }
};

export default {
  generateOffer,
  improveOffer,
  validateOpenAIKey,
};
