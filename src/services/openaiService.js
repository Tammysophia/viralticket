// VT: Serviço para integração com OpenAI API (Versão Simplificada e Funcional)
import { getServiceAPIKey } from '../hooks/useAPIKeys';
import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Verifica se a conexão com a API do OpenAI está funcionando
 */
export const verifyAPIConnection = async () => {
  try {
    const apiKey = await getServiceAPIKey('openai');
    
    if (!apiKey) {
      return {
        success: false,
        message: 'Chave não configurada no painel administrativo',
      };
    }

    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        message: error.error?.message || 'Erro ao conectar com OpenAI API',
      };
    }

    return {
      success: true,
      message: 'Conexão estabelecida com sucesso',
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Erro ao verificar conexão',
    };
  }
};

/**
 * Busca o prompt do agente no Firestore
 */
const getAgentPromptFromFirestore = async (agentId) => {
  try {
    console.log(`🔍 VT: Buscando template da agente "${agentId}" no Firestore...`);
    
    if (!db) {
      return null;
    }

    const docRef = doc(db, 'agent_templates', agentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const template = data.prompt || data.systemPrompt || null;
      if (template) {
        console.log(`✅ VT: Template da agente ${agentId} carregado do Firestore (${template.length} caracteres)`);
        return template;
      }
    }
    
    console.log(`⚠️ VT: Template não encontrado no Firestore para "${agentId}"`);
    return null;
  } catch (error) {
    console.error(`❌ VT: Erro ao buscar template do Firestore:`, error);
    return null;
  }
};

/**
 * Parse JSON seguro
 */
const parseJSON = (content) => {
  console.log('📝 VT: Parseando resposta da IA...');
  
  // Tentar parsear direto
  try {
    const parsed = JSON.parse(content);
    console.log('✅ VT: JSON parseado com sucesso!');
    return parsed;
  } catch (e) {
    console.log('🧹 VT: Tentando extrair JSON da resposta...');
  }
  
  // Procurar por bloco ```json```
  const jsonBlockMatch = content.match(/```json\s*\n?([\s\S]*?)\n?```/i);
  if (jsonBlockMatch) {
    try {
      const parsed = JSON.parse(jsonBlockMatch[1].trim());
      console.log('✅ VT: JSON extraído de bloco markdown!');
      return parsed;
    } catch (e) {
      console.log('⚠️ VT: Bloco markdown inválido');
    }
  }
  
  // Procurar por objeto JSON na resposta
  const jsonMatch = content.match(/\{[\s\S]*"title"[\s\S]*"subtitle"[\s\S]*"bullets"[\s\S]*"cta"[\s\S]*"bonus"[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('✅ VT: JSON encontrado na resposta!');
      return parsed;
    } catch (e) {
      console.log('⚠️ VT: JSON encontrado mas inválido');
    }
  }
  
  console.log('❌ VT: Não foi possível parsear JSON, usando fallback');
  return null;
};

/**
 * Gera uma oferta irresistível usando GPT
 */
export const generateOffer = async (comments, agent = 'sophia') => {
  try {
    console.log(`🚀 VT: Iniciando geração de oferta com agente "${agent}"...`);
    
    const apiKey = await getServiceAPIKey('openai');
    
    if (!apiKey) {
      const error = new Error('API_KEY_NOT_FOUND');
      error.adminMessage = 'Chave da API do OpenAI não configurada no painel administrativo';
      error.userMessage = '🔧 Sistema em manutenção. Tente novamente em instantes.';
      throw error;
    }

    // Buscar prompt do Firestore
    let systemPrompt = await getAgentPromptFromFirestore(agent);
    
    // Se não encontrou, usar prompt simples
    if (!systemPrompt) {
      console.log('⚠️ VT: Usando prompt fallback hardcoded');
      
      const fallbackPrompts = {
        sophia: `Você é Sophia Fênix, especialista em criar ofertas de alto impacto.
Analise os seguintes comentários e crie uma oferta irresistível.

IMPORTANTE: Responda APENAS com JSON neste formato exato:
{
  "title": "🎯 Título impactante aqui",
  "subtitle": "Subtítulo persuasivo aqui",
  "bullets": [
    "✅ Benefício 1",
    "✅ Benefício 2",
    "✅ Benefício 3",
    "✅ Benefício 4"
  ],
  "cta": "🚀 CALL TO ACTION AQUI!",
  "bonus": "🎁 Bônus irresistível aqui"
}`,
        
        sofia: `Você é Sofia Universal, IA versátil para todos os nichos.
Analise os comentários e crie uma oferta personalizada.

IMPORTANTE: Responda APENAS com JSON neste formato exato:
{
  "title": "🌟 Título aqui",
  "subtitle": "Subtítulo aqui",
  "bullets": [
    "✅ Benefício 1",
    "✅ Benefício 2",
    "✅ Benefício 3",
    "✅ Benefício 4"
  ],
  "cta": "🚀 AÇÃO AQUI!",
  "bonus": "🎁 Bônus aqui"
}`
      };
      
      systemPrompt = fallbackPrompts[agent] || fallbackPrompts.sophia;
    }
    
    console.log('📋 VT: Prompt preparado (tamanho:', systemPrompt.length, 'caracteres)');

    // Chamar OpenAI API
    console.log('📡 VT: Enviando requisição para OpenAI...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: comments
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      const errorMessage = error.error?.message || 'Erro ao gerar oferta';
      
      if (response.status === 429 || errorMessage.includes('quota')) {
        const quotaError = new Error('QUOTA_EXCEEDED');
        quotaError.adminMessage = '💳 Conta OpenAI sem créditos! Adicione em: https://platform.openai.com/account/billing';
        quotaError.userMessage = '🔧 Sistema temporariamente indisponível.';
        throw quotaError;
      }
      
      if (response.status === 401) {
        const authError = new Error('AUTH_FAILED');
        authError.adminMessage = '🔑 Chave da API OpenAI inválida. Gere uma nova em: https://platform.openai.com/api-keys';
        authError.userMessage = '🔧 Sistema em manutenção.';
        throw authError;
      }
      
      throw new Error(errorMessage);
    }

    console.log('📥 VT: Resposta recebida. Status:', response.status);
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('📥 VT: Resposta da OpenAI (primeiros 500 chars):', content.substring(0, 500));
    console.log('📊 VT: Resposta completa tem', content.length, 'caracteres');
    console.log('🔥 VT: Agente utilizada:', agent);
    
    // Tentar parsear JSON
    const parsed = parseJSON(content);
    
    if (parsed && parsed.title && parsed.subtitle && parsed.bullets) {
      console.log('✅ VT: Oferta parseada com sucesso!');
      return {
        title: parsed.title,
        subtitle: parsed.subtitle,
        bullets: Array.isArray(parsed.bullets) ? parsed.bullets : ['✅ Benefício 1', '✅ Benefício 2', '✅ Benefício 3', '✅ Benefício 4'],
        cta: parsed.cta || '🚀 QUERO APROVEITAR AGORA!',
        bonus: parsed.bonus || '🎁 Bônus Especial Incluído',
        fullResponse: content, // VT: Salvar resposta completa também
      };
    }
    
    // Fallback: criar estrutura a partir da resposta
    console.log('⚠️ VT: Usando fallback - criando estrutura da resposta');
    
    const lines = content.split('\n').filter(l => l.trim());
    
    return {
      title: lines[0] || '🎯 Oferta Especial para Você!',
      subtitle: lines[1] || 'Transforme sua realidade agora',
      bullets: [
        '✅ Acesso imediato ao conteúdo completo',
        '✅ Suporte dedicado e personalizado',
        '✅ Garantia de satisfação total',
        '✅ Bônus exclusivos incluídos',
      ],
      cta: '🚀 QUERO APROVEITAR ESTA OFERTA!',
      bonus: '🎁 Bônus: Material complementar gratuito',
      fullResponse: content,
    };
    
  } catch (error) {
    console.error('❌ VT: Erro ao gerar oferta:', error);
    throw error;
  }
};
