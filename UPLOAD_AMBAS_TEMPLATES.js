#!/usr/bin/env node

// Script para fazer upload dos templates da Sophia Fênix e Sofia Universal para o Firestore
// Executar: node UPLOAD_AMBAS_TEMPLATES.js

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBF5RAJ3C7Yy6dH_sWBXDo8cYd51c2QnVA",
  authDomain: "studio-6502227051-763bf.firebaseapp.com",
  projectId: "studio-6502227051-763bf",
  storageBucket: "studio-6502227051-763bf.firebasestorage.app",
  messagingSenderId: "151268195367",
  appId: "1:151268195367:web:be03df757470d10c64e202",
};

async function uploadToFirestore() {
  try {
    console.log('🔥 Inicializando Firebase...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Template da Sophia Fênix
    const SOPHIA_TEMPLATE = readFileSync(join(__dirname, 'SOPHIA_TEMPLATE.txt'), 'utf-8');
    console.log('📝 Template da Sophia Fênix:', SOPHIA_TEMPLATE.length, 'caracteres');
    
    // Template da Sofia Universal
    const SOFIA_TEMPLATE = readFileSync(join(__dirname, 'SOFIA_TEMPLATE.txt'), 'utf-8');
    console.log('📝 Template da Sofia Universal:', SOFIA_TEMPLATE.length, 'caracteres');
    
    console.log('');
    console.log('📤 Fazendo upload para Firestore...');
    console.log('   Coleção: agent_templates');
    
    // Upload Sophia Fênix
    console.log('');
    console.log('🔥 1/2 Uploading Sophia Fênix...');
    const sophiaDocRef = doc(db, 'agent_templates', 'sophia');
    await setDoc(sophiaDocRef, {
      name: 'Sophia Fênix',
      type: 'oferta_emocional',
      prompt: SOPHIA_TEMPLATE,
      systemPrompt: SOPHIA_TEMPLATE,
      template: SOPHIA_TEMPLATE,
      active: true,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      description: 'Transforma dores emocionais (dependência afetiva, apego, abandono) em ofertas low-ticket R$7-49',
      tags: ['emocional', 'dependencia_afetiva', 'apego', 'abandono', 'relacionamento', 'low_ticket'],
      niches: ['relacionamento', 'autoajuda', 'bem-estar-emocional'],
      model: 'gpt-4o',
      temperature: 0.0,
      maxTokens: 2500,
    });
    console.log('✅ Sophia Fênix uploaded!');
    
    // Upload Sofia Universal
    console.log('');
    console.log('⭐ 2/2 Uploading Sofia Universal...');
    const sofiaDocRef = doc(db, 'agent_templates', 'sofia');
    await setDoc(sofiaDocRef, {
      name: 'Sofia Universal',
      type: 'oferta_universal',
      prompt: SOFIA_TEMPLATE,
      systemPrompt: SOFIA_TEMPLATE,
      template: SOFIA_TEMPLATE,
      active: true,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      description: 'Transforma qualquer ideia/dor em oferta viral low-ticket R$7-97. Domina todos os nichos.',
      tags: ['universal', 'multi-nicho', 'mecanismo-unico', 'chiclete-mental', 'low_ticket'],
      niches: [
        'saude', 'bem-estar', 'relacionamento', 'autoajuda', 'renda-extra',
        'financas', 'produtividade', 'estetica', 'nutricao', 'confeitaria',
        'advocacia', 'espiritualidade', 'transformacao-pessoal', 'marketing'
      ],
      model: 'gpt-4o',
      temperature: 0.0,
      maxTokens: 2500,
    });
    console.log('✅ Sofia Universal uploaded!');
    
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ ✅ UPLOAD CONCLUÍDO COM SUCESSO! ✅ ✅');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('🎯 Próximos passos:');
    console.log('   1. Verificar no Firebase Console:');
    console.log('      https://console.firebase.google.com/project/studio-6502227051-763bf/firestore');
    console.log('   2. Conferir se existem 2 documentos em agent_templates:');
    console.log('      - sophia (Sophia Fênix) ✅');
    console.log('      - sofia (Sofia Universal) ✅');
    console.log('   3. Fazer deploy no Vercel (código já está atualizado)');
    console.log('');
    console.log('🚀 Agora as ofertas serão geradas com os templates COMPLETOS!');
    console.log('');
    console.log('📊 Agentes disponíveis:');
    console.log('   - sophia → Dores emocionais (apego, abandono, relacionamento)');
    console.log('   - sofia  → Qualquer nicho (saúde, finanças, produtividade, etc)');
    
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ ERRO AO FAZER UPLOAD');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error(error);
    console.error('');
    
    if (error.code === 'permission-denied') {
      console.error('⚠️ ERRO DE PERMISSÃO!');
      console.error('   Configure as regras do Firestore temporariamente:');
      console.error('');
      console.error('   rules_version = \'2\';');
      console.error('   service cloud.firestore {');
      console.error('     match /databases/{database}/documents {');
      console.error('       match /agent_templates/{agentId} {');
      console.error('         allow read: if true;');
      console.error('         allow write: if request.auth.token.email == "tamara14@gmail.com";');
      console.error('       }');
      console.error('     }');
      console.error('   }');
      console.error('');
      console.error('   Depois de fazer upload, pode mudar write para false.');
    }
    
    process.exit(1);
  }
}

uploadToFirestore();
