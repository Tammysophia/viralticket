#!/usr/bin/env node

/**
 * Script para injetar prompts de agentes no Firestore
 * 
 * USO:
 * 1. Certifique-se de ter as credenciais do Firebase configuradas
 * 2. Execute: node scripts/injectAgents.js
 * 
 * OU via Admin UI:
 * - Login como admin → /admin → "Inicializar Prompts no Firestore"
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configurar Firebase Admin
try {
  // Tentar ler serviceAccountKey.json se existir
  const serviceAccount = JSON.parse(
    readFileSync(join(__dirname, '..', 'serviceAccountKey.json'), 'utf8')
  );
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase Admin:');
  console.error('   Certifique-se de ter o arquivo serviceAccountKey.json na raiz do projeto');
  console.error('   Baixe em: Firebase Console → Project Settings → Service Accounts');
  process.exit(1);
}

const db = admin.firestore();

// PROMPTS COMPLETOS DOS AGENTES
// ⚠️ IMPORTANTE: Cole aqui os prompts reais enviados pela Tamara

const SOPHIA_PROMPT = `[COLE AQUI O PROMPT COMPLETO DA SOPHIA FÊNIX]

Você é Sophia Fênix, especialista em criar ofertas irresistíveis de alto impacto.

[PROMPT COMPLETO COM 3500+ CARACTERES]

{{comments}}

[INSTRUÇÕES DETALHADAS]`;

const SOFIA_PROMPT = `[COLE AQUI O PROMPT COMPLETO DA SOFIA UNIVERSAL]

Você é Sofia Universal, IA versátil para todos os nichos.

[PROMPT COMPLETO COM 3500+ CARACTERES]

{{comments}}

[INSTRUÇÕES DETALHADAS]`;

/**
 * Injeta os prompts no Firestore
 */
async function injectAgents() {
  console.log('🔄 Iniciando injeção de prompts...\n');

  try {
    // Validar tamanho dos prompts
    if (SOPHIA_PROMPT.length < 3000) {
      console.warn(`⚠️  SOPHIA prompt muito curto: ${SOPHIA_PROMPT.length} chars (esperado 3500+)`);
    }
    if (SOFIA_PROMPT.length < 3000) {
      console.warn(`⚠️  SOFIA prompt muito curto: ${SOFIA_PROMPT.length} chars (esperado 3500+)`);
    }

    // Salvar SOPHIA
    console.log('📝 Salvando SOPHIA Fênix...');
    await db.collection('agent_templates').doc('sophia').set({
      agentId: 'sophia',
      name: 'Sophia Fênix',
      description: 'Especialista em ofertas de alto impacto',
      content: SOPHIA_PROMPT,
      prompt: SOPHIA_PROMPT, // Compatibilidade
      version: '2.0',
      active: true,
      charCount: SOPHIA_PROMPT.length,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`✅ SOPHIA salva com sucesso (${SOPHIA_PROMPT.length} chars)\n`);

    // Salvar SOFIA
    console.log('📝 Salvando SOFIA Universal...');
    await db.collection('agent_templates').doc('sofia').set({
      agentId: 'sofia',
      name: 'Sofia Universal',
      description: 'IA versátil para todos os nichos',
      content: SOFIA_PROMPT,
      prompt: SOFIA_PROMPT, // Compatibilidade
      version: '2.0',
      active: true,
      charCount: SOFIA_PROMPT.length,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`✅ SOFIA salva com sucesso (${SOFIA_PROMPT.length} chars)\n`);

    // Verificar
    console.log('🔍 Verificando prompts salvos...');
    const sophiaDoc = await db.collection('agent_templates').doc('sophia').get();
    const sofiaDoc = await db.collection('agent_templates').doc('sofia').get();

    if (sophiaDoc.exists && sofiaDoc.exists) {
      const sophiaData = sophiaDoc.data();
      const sofiaData = sofiaDoc.data();
      
      console.log('\n✅ SUCESSO! Prompts injetados:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📝 SOPHIA: ${sophiaData.charCount} chars`);
      console.log(`📝 SOFIA: ${sofiaData.charCount} chars`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      console.log('🎯 Próximos passos:');
      console.log('1. Atualizar regras do Firestore (copiar firestore.rules)');
      console.log('2. Testar geração de oferta como usuário');
      console.log('3. Verificar logs no console: [AGENTS][DEBUG] systemPrompt chars=XXXX\n');
    } else {
      console.error('❌ Erro: Prompts não foram salvos corretamente');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Erro ao injetar prompts:', error);
    process.exit(1);
  }
}

// Executar
injectAgents()
  .then(() => {
    console.log('✅ Processo concluído com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
