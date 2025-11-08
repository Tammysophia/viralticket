#!/usr/bin/env node

// Script para fazer upload do template da Sophia para o Firestore
// Executar: node UPLOAD_SOPHIA_FIRESTORE.js

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

// Template COMPLETO da Sophia Fênix
const SOPHIA_TEMPLATE = readFileSync(join(__dirname, 'SOPHIA_TEMPLATE.txt'), 'utf-8');

async function uploadToFirestore() {
  try {
    console.log('🔥 Inicializando Firebase...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('📝 Template da Sophia:', SOPHIA_TEMPLATE.length, 'caracteres');
    
    console.log('📤 Fazendo upload para Firestore...');
    console.log('   Coleção: agent_templates');
    console.log('   Documento: sophia');
    
    const docRef = doc(db, 'agent_templates', 'sophia');
    
    await setDoc(docRef, {
      name: 'Sophia Fênix',
      type: 'oferta_emocional',
      prompt: SOPHIA_TEMPLATE,
      systemPrompt: SOPHIA_TEMPLATE, // Alias para compatibilidade
      template: SOPHIA_TEMPLATE, // Outro alias
      active: true,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      description: 'Transforma dores emocionais em ofertas low-ticket (R$7-49)',
      tags: ['emocional', 'dependencia_afetiva', 'apego', 'abandono', 'low_ticket'],
      model: 'gpt-4o',
      temperature: 0.0,
      maxTokens: 2500,
    });
    
    console.log('✅ Upload concluído com sucesso!');
    console.log('');
    console.log('🎯 Próximos passos:');
    console.log('   1. Verificar no Firebase Console:');
    console.log('      https://console.firebase.google.com/project/studio-6502227051-763bf/firestore');
    console.log('   2. Conferir se o documento sophia existe em agent_templates');
    console.log('   3. Fazer deploy no Vercel (o código já está atualizado)');
    console.log('');
    console.log('🚀 Agora as ofertas serão geradas com o template COMPLETO da Sophia!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao fazer upload:', error);
    console.error('');
    
    if (error.code === 'permission-denied') {
      console.error('⚠️ ERRO DE PERMISSÃO!');
      console.error('   Configure as regras do Firestore:');
      console.error('');
      console.error('   rules_version = \'2\';');
      console.error('   service cloud.firestore {');
      console.error('     match /databases/{database}/documents {');
      console.error('       match /agent_templates/{agentId} {');
      console.error('         allow read: if true;');
      console.error('         allow write: if true; // Temporário para upload');
      console.error('       }');
      console.error('     }');
      console.error('   }');
    }
    
    process.exit(1);
  }
}

uploadToFirestore();
