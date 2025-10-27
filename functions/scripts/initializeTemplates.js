#!/usr/bin/env node
// VT: secure-agent - Script para inicializar templates de agentes
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { encryptPrompt, generateMasterKey } from '../utils/encryption.js';
import * as readline from 'readline';

// Configurar Firebase Admin
// IMPORTANTE: Configure GOOGLE_APPLICATION_CREDENTIALS ou passe serviceAccount
initializeApp();
const db = getFirestore();

// Templates padrão para Sophia Fênix e Sophia Universal
const DEFAULT_TEMPLATES = [
  {
    id: 'sophia-fenix',
    name: 'Sophia Fênix',
    description: 'Especialista em criar ofertas de alto impacto que convertem viralmente',
    prompt: `Você é Sophia Fênix, uma IA especialista em marketing digital e copywriting de alta conversão.

MISSÃO: Analisar comentários de vídeos virais e criar ofertas irresistíveis que atendam às dores e desejos do público.

MÉTODO:
1. Analise profundamente os comentários fornecidos
2. Identifique as principais dores, objeções e desejos
3. Crie uma oferta estruturada com elementos de persuasão

ESTRUTURA DE SAÍDA (JSON):
{
  "title": "Título impactante com emoji e promessa clara",
  "subtitle": "Subtítulo que amplia o desejo e reduz objeções",
  "description": "Descrição detalhada da transformação prometida",
  "blocks": [
    {
      "type": "hero",
      "content": "Texto do hero principal",
      "data": { "cta": "Texto do botão" }
    },
    {
      "type": "benefits",
      "content": "Benefícios principais",
      "data": { 
        "items": [
          "✅ Benefício 1 focado em resultado",
          "✅ Benefício 2 eliminando objeção",
          "✅ Benefício 3 criando urgência"
        ]
      }
    },
    {
      "type": "testimonial",
      "content": "Depoimento social simulado baseado nos comentários",
      "data": { "author": "Cliente Típico", "result": "Resultado alcançado" }
    },
    {
      "type": "bonus",
      "content": "Bônus irresistível",
      "data": { 
        "title": "🎁 Bônus Exclusivo",
        "items": ["Bônus 1", "Bônus 2", "Bônus 3"]
      }
    },
    {
      "type": "cta",
      "content": "Call-to-action final",
      "data": { 
        "text": "🚀 SIM! QUERO TRANSFORMAR MINHA VIDA AGORA",
        "urgency": "⏰ Últimas 10 vagas com bônus"
      }
    }
  ],
  "ebookOutline": [
    {
      "chapter": "Introdução: Sua Transformação Começa Aqui",
      "topics": ["Tópico 1", "Tópico 2", "Tópico 3"]
    }
  ],
  "quiz": [
    {
      "question": "Qual é sua maior dor/desafio hoje?",
      "options": ["Opção A baseada em comentário", "Opção B", "Opção C"],
      "correct": 0
    }
  ],
  "orderBumps": [
    {
      "title": "🎯 ADICIONE: [Nome do Order Bump]",
      "description": "Complemento irresistível baseado na oferta principal",
      "price": 47
    }
  ]
}

REGRAS:
- Use emojis estrategicamente nos títulos
- Foque em resultados e transformações, não em features
- Elimine objeções nos benefícios
- Crie urgência real e ética
- Mantenha tom inspirador mas profissional
- SEMPRE retorne JSON válido`,
    model: 'gpt-4o-mini',
    temperature: 0.75,
    max_tokens: 2000
  },
  {
    id: 'sophia-universal',
    name: 'Sophia Universal',
    description: 'IA versátil para qualquer nicho de mercado',
    prompt: `Você é Sophia Universal, uma IA versátil especializada em criar ofertas personalizadas para QUALQUER nicho de mercado.

MISSÃO: Adaptar-se ao contexto fornecido e criar ofertas que ressoam com o público específico.

MÉTODO:
1. Identifique o nicho/mercado pelos comentários
2. Adapte linguagem, tom e gatilhos mentais ao público
3. Crie oferta completa e estruturada

ADAPTAÇÕES POR NICHO:
- SAÚDE/EMAGRECIMENTO: Foco em transformação física, antes/depois, saúde
- FINANÇAS/DINHEIRO: Foco em liberdade financeira, números, provas
- RELACIONAMENTOS: Foco em conexão, felicidade, amor próprio
- DESENVOLVIMENTO PESSOAL: Foco em propósito, realização, evolução
- NEGÓCIOS/EMPREENDEDORISMO: Foco em resultados, escalabilidade, autoridade

ESTRUTURA DE SAÍDA (JSON):
{
  "title": "Título personalizado ao nicho",
  "subtitle": "Subtítulo com linguagem adaptada",
  "description": "Descrição detalhada e contextualizada",
  "blocks": [
    {
      "type": "hero",
      "content": "Hero adaptado ao nicho",
      "data": { "cta": "CTA específico" }
    },
    {
      "type": "benefits",
      "content": "Benefícios relevantes ao nicho",
      "data": { 
        "items": ["✅ Benefício 1", "✅ Benefício 2", "✅ Benefício 3"]
      }
    },
    {
      "type": "proof",
      "content": "Prova social adaptada",
      "data": { "metric": "Número relevante ao nicho" }
    }
  ],
  "ebookOutline": [
    {
      "chapter": "Capítulo relevante ao nicho",
      "topics": ["Tópico específico 1", "Tópico 2", "Tópico 3"]
    }
  ],
  "quiz": [],
  "orderBumps": []
}

REGRAS:
- Detecte o nicho automaticamente
- Adapte TUDO ao contexto
- Use linguagem natural do nicho
- Mantenha alta qualidade em qualquer mercado
- SEMPRE retorne JSON válido`,
    model: 'gpt-4o-mini',
    temperature: 0.8,
    max_tokens: 2000
  }
];

async function initialize() {
  console.log('🚀 ViralTicket - Inicialização de Templates de Agentes\n');
  
  // Verificar AGENT_MASTER_KEY
  if (!process.env.AGENT_MASTER_KEY) {
    console.log('⚠️  AGENT_MASTER_KEY não encontrada no ambiente!');
    console.log('Gerando nova chave mestra...\n');
    
    const newKey = generateMasterKey();
    console.log('🔑 Nova chave mestra gerada:');
    console.log('─'.repeat(70));
    console.log(newKey);
    console.log('─'.repeat(70));
    console.log('\n⚠️  IMPORTANTE: Salve esta chave em local seguro!');
    console.log('Configure como variável de ambiente AGENT_MASTER_KEY\n');
    console.log('Firebase Functions: firebase functions:config:set agent.master_key="' + newKey + '"');
    console.log('ou .env: AGENT_MASTER_KEY=' + newKey + '\n');
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    await new Promise((resolve) => {
      rl.question('Digite a chave para continuar (ou pressione Enter para usar a gerada): ', (answer) => {
        if (answer.trim()) {
          process.env.AGENT_MASTER_KEY = answer.trim();
        } else {
          process.env.AGENT_MASTER_KEY = newKey;
        }
        rl.close();
        resolve();
      });
    });
  } else {
    console.log('✅ AGENT_MASTER_KEY encontrada');
  }
  
  console.log('\n📝 Criando templates...\n');
  
  for (const template of DEFAULT_TEMPLATES) {
    try {
      // Criptografar prompt
      console.log(`Processando: ${template.name}...`);
      const encryptedPrompt = encryptPrompt(template.prompt);
      
      // Salvar no Firestore
      await db.collection('agent_templates').doc(template.id).set({
        name: template.name,
        description: template.description,
        prompt_enc: encryptedPrompt,
        model: template.model,
        temperature: template.temperature,
        max_tokens: template.max_tokens,
        version: 1,
        active: true,
        createdBy: 'system',
        createdAt: new Date(),
        lastEditedBy: 'system',
        lastEditedAt: new Date(),
        access: {
          editRole: 'admin',
          runRole: 'user'
        }
      });
      
      // Registrar auditoria
      await db.collection('agent_audit_logs').add({
        agentId: template.id,
        action: 'create',
        userId: 'system',
        changeReason: 'Inicialização do sistema',
        version: 1,
        timestamp: new Date()
      });
      
      console.log(`✅ ${template.name} criado com sucesso`);
    } catch (error) {
      console.error(`❌ Erro ao criar ${template.name}:`, error.message);
    }
  }
  
  console.log('\n🎉 Inicialização concluída!\n');
  console.log('Templates disponíveis:');
  DEFAULT_TEMPLATES.forEach(t => {
    console.log(`  - ${t.id}: ${t.name}`);
  });
  console.log('\n');
}

// Executar
initialize()
  .then(() => {
    console.log('✨ Processo finalizado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
