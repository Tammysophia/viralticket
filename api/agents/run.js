// Backend API: /api/agents/run
// Endpoint para gerar ofertas com agentes IA
import admin from "firebase-admin";
import crypto from "crypto";

// Inicializar Firebase Admin (se ainda não inicializado)
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

/**
 * Descriptografa prompt usando AES-256-GCM
 * @param {string} encryptedText - Formato: "iv:tag:encrypted"
 * @returns {string} - Texto descriptografado
 */
function decrypt(encryptedText) {
  const [ivHex, tagHex, encrypted] = encryptedText.split(':');
  const key = Buffer.from(process.env.AGENT_MASTER_KEY, 'hex');
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Handler principal do endpoint
 */
export default async function handler(req, res) {
  // Apenas POST permitido
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { agentId, userInput, apiKey } = req.body;

    // Validar parâmetros obrigatórios
    if (!agentId) {
      return res.status(400).json({ error: 'agentId is required' });
    }

    if (!userInput) {
      return res.status(400).json({ error: 'userInput is required' });
    }

    if (!apiKey) {
      return res.status(400).json({ error: 'OpenAI API key is required' });
    }

    console.log(`🤖 API: Processando requisição para agente: ${agentId}`);

    // 1. Buscar agente no Firestore
    const doc = await db.collection('agent_templates').doc(agentId).get();
    
    // OBRIGATÓRIO: Agente deve existir
    if (!doc.exists) {
      console.error(`❌ API: Agente ${agentId} não encontrada`);
      return res.status(422).json({ 
        error: 'Agent not found',
        message: `Agente '${agentId}' não encontrada. Execute 'npm run inject-agents' para configurar.`
      });
    }

    const agentData = doc.data();

    // OBRIGATÓRIO: Agente deve estar ativa
    if (!agentData.active) {
      console.error(`❌ API: Agente ${agentId} está inativa`);
      return res.status(422).json({ 
        error: 'Agent inactive',
        message: `Agente '${agentId}' está inativa.`
      });
    }

    // OBRIGATÓRIO: Prompt criptografado deve existir
    const { prompt_enc } = agentData;
    if (!prompt_enc) {
      console.error(`❌ API: Prompt não encontrado para ${agentId}`);
      return res.status(422).json({ 
        error: 'Agent prompt missing',
        message: `Prompt da agente '${agentId}' não configurado.`
      });
    }

    console.log(`🔓 API: Descriptografando prompt da agente ${agentId}...`);

    // 2. Descriptografar prompt
    let systemPrompt;
    try {
      systemPrompt = decrypt(prompt_enc);
    } catch (decryptError) {
      console.error(`❌ API: Erro ao descriptografar prompt:`, decryptError);
      return res.status(422).json({ 
        error: 'Failed to decrypt agent prompt',
        message: 'Erro ao descriptografar prompt da agente. Verifique AGENT_MASTER_KEY.'
      });
    }

    // OBRIGATÓRIO: Prompt descriptografado não pode ser vazio
    if (!systemPrompt || systemPrompt.length === 0) {
      console.error(`❌ API: Prompt descriptografado está vazio para ${agentId}`);
      return res.status(422).json({ 
        error: 'Empty agent prompt',
        message: 'Prompt da agente está vazio após descriptografia.'
      });
    }

    console.log(`✅ API: Prompt descriptografado com sucesso (${systemPrompt.length} caracteres)`);

    // 3. Preparar mensagens para OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userInput },
    ];

    console.log(`🚀 API: Enviando requisição para OpenAI...`);

    // 4. Chamar OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        temperature: 0.7,
        max_tokens: 3000,
        messages,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error(`❌ API: Erro do OpenAI:`, errorData);
      return res.status(openaiResponse.status).json({
        error: 'OpenAI API error',
        details: errorData
      });
    }

    const completion = await openaiResponse.json();
    
    console.log(`✅ API: Resposta recebida do OpenAI`);

    // 5. Retornar resposta
    return res.status(200).json({
      success: true,
      agent: agentData.name,
      response: completion.choices[0].message.content,
      usage: completion.usage,
    });

  } catch (error) {
    console.error('❌ API: Erro interno:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
