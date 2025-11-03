#!/usr/bin/env node
// VT: secure-agent - Script para rotação de chaves mestras
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { rotateEncryption, generateMasterKey, decryptPrompt, encryptPrompt } from '../utils/encryption.js';
import * as readline from 'readline';

initializeApp();
const db = getFirestore();

async function rotateKeys() {
  console.log('🔄 ViralTicket - Rotação de Chave Mestra\n');
  console.log('⚠️  ATENÇÃO: Este processo é crítico e irreversível!');
  console.log('Certifique-se de ter backup antes de continuar.\n');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  // Confirmar continuação
  await new Promise((resolve) => {
    rl.question('Deseja continuar? (digite "SIM" para confirmar): ', (answer) => {
      if (answer !== 'SIM') {
        console.log('❌ Operação cancelada');
        process.exit(0);
      }
      resolve();
    });
  });
  
  // Solicitar chave antiga
  const oldKey = await new Promise((resolve) => {
    rl.question('\n🔑 Digite a chave ANTIGA (atual): ', (answer) => {
      resolve(answer.trim());
    });
  });
  
  if (!oldKey || oldKey.length !== 64) {
    console.log('❌ Chave antiga inválida');
    rl.close();
    process.exit(1);
  }
  
  // Gerar nova chave
  const newKey = generateMasterKey();
  console.log('\n🔑 Nova chave gerada:');
  console.log('─'.repeat(70));
  console.log(newKey);
  console.log('─'.repeat(70));
  console.log('\n⚠️  COPIE E SALVE esta chave em local SEGURO!\n');
  
  await new Promise((resolve) => {
    rl.question('Confirme que você SALVOU a nova chave (digite "SALVEI"): ', (answer) => {
      if (answer !== 'SALVEI') {
        console.log('❌ Operação cancelada - salve a chave antes de continuar');
        process.exit(0);
      }
      resolve();
    });
  });
  
  rl.close();
  
  console.log('\n🔄 Iniciando rotação...\n');
  
  // Buscar todos os templates
  const templatesSnapshot = await db.collection('agent_templates').get();
  const templates = [];
  
  templatesSnapshot.forEach(doc => {
    templates.push({
      id: doc.id,
      ...doc.data()
    });
  });
  
  console.log(`📦 Encontrados ${templates.length} templates para re-criptografar\n`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const template of templates) {
    try {
      console.log(`Processando: ${template.name}...`);
      
      // Descriptografar com chave antiga
      process.env.AGENT_MASTER_KEY = oldKey;
      const plaintext = decryptPrompt(template.prompt_enc);
      
      // Re-criptografar com chave nova
      process.env.AGENT_MASTER_KEY = newKey;
      const newEncrypted = encryptPrompt(plaintext);
      
      // Atualizar no banco
      await db.collection('agent_templates').doc(template.id).update({
        prompt_enc: newEncrypted,
        version: (template.version || 0) + 1,
        lastEditedBy: 'system',
        lastEditedAt: new Date()
      });
      
      // Registrar auditoria
      await db.collection('agent_audit_logs').add({
        agentId: template.id,
        action: 'key_rotation',
        userId: 'system',
        changeReason: 'Rotação de chave mestra',
        version: (template.version || 0) + 1,
        timestamp: new Date()
      });
      
      console.log(`✅ ${template.name} re-criptografado`);
      successCount++;
      
    } catch (error) {
      console.error(`❌ Erro ao processar ${template.name}:`, error.message);
      errorCount++;
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('📊 RESUMO DA ROTAÇÃO');
  console.log('='.repeat(70));
  console.log(`✅ Sucesso: ${successCount}`);
  console.log(`❌ Erros: ${errorCount}`);
  console.log(`📦 Total: ${templates.length}`);
  console.log('='.repeat(70));
  
  if (errorCount === 0) {
    console.log('\n🎉 Rotação concluída com sucesso!');
    console.log('\n📝 PRÓXIMOS PASSOS:');
    console.log('1. Atualize AGENT_MASTER_KEY no ambiente de produção');
    console.log('2. Reinicie as Cloud Functions');
    console.log('3. Teste a execução de um agente');
    console.log('4. Guarde a chave antiga em backup seguro por 30 dias');
    console.log('5. Destrua a chave antiga após período de segurança\n');
  } else {
    console.log('\n⚠️  Rotação concluída COM ERROS');
    console.log('Revise os logs acima e tente novamente para os templates com erro\n');
  }
}

rotateKeys()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
