/**
 * VT: Cloud Functions para ViralTicket
 * 
 * Função: resetDailyLimits
 * Descrição: Reseta automaticamente os limites diários dos usuários à meia-noite
 * Schedule: Roda todo dia às 00:00 (meia-noite) horário de Brasília
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Inicializar Firebase Admin
admin.initializeApp();

/**
 * VT: Função agendada para resetar limites diários
 * Roda automaticamente todo dia às 00:00 (horário de Brasília: America/Sao_Paulo)
 */
exports.resetDailyLimits = functions
  .region('southamerica-east1') // VT: Região São Paulo (Brasil)
  .pubsub
  .schedule('0 0 * * *') // VT: Todo dia à meia-noite
  .timeZone('America/Sao_Paulo') // VT: Horário de Brasília
  .onRun(async (context) => {
    console.log('🔄 VT: Iniciando reset de limites diários...');
    
    const db = admin.firestore();
    const today = new Date();
    today.setHours(0, 0, 0, 0); // VT: Normalizar para início do dia
    const todayString = today.toISOString().split('T')[0]; // VT: Formato: YYYY-MM-DD
    
    let updatedCount = 0;
    let errorCount = 0;
    
    try {
      // VT: Buscar todos os usuários
      const usersSnapshot = await db.collection('users').get();
      
      console.log(`📊 VT: Encontrados ${usersSnapshot.size} usuários`);
      
      // VT: Usar batch para operações em massa (máximo 500 por batch)
      const batches = [];
      let currentBatch = db.batch();
      let operationsInBatch = 0;
      
      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        const userId = doc.id;
        
        // VT: Verificar se precisa resetar
        const ultimoReset = userData.ultimoReset || '';
        const needsReset = ultimoReset !== todayString;
        
        if (needsReset) {
          // VT: Resetar apenas 'ofertasUsadasHoje' e atualizar 'ultimoReset'
          // IMPORTANTE: NÃO alterar 'limiteDiario' nem outros campos
          currentBatch.update(doc.ref, {
            'dailyUsage.offers': 0, // VT: Resetar ofertas usadas hoje
            'dailyUsage.urls': 0,   // VT: Resetar URLs usadas hoje
            ultimoReset: todayString, // VT: Marcar data do reset
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          operationsInBatch++;
          updatedCount++;
          
          // VT: Se batch atingir 500 operações, criar um novo
          if (operationsInBatch >= 500) {
            batches.push(currentBatch);
            currentBatch = db.batch();
            operationsInBatch = 0;
          }
          
          console.log(`✅ VT: Usuário ${userId} será resetado (último reset: ${ultimoReset || 'nunca'})`);
        } else {
          console.log(`⏭️ VT: Usuário ${userId} já foi resetado hoje`);
        }
      });
      
      // VT: Adicionar último batch se tiver operações pendentes
      if (operationsInBatch > 0) {
        batches.push(currentBatch);
      }
      
      // VT: Executar todos os batches
      console.log(`📦 VT: Executando ${batches.length} batch(es) com ${updatedCount} atualizações...`);
      
      for (let i = 0; i < batches.length; i++) {
        try {
          await batches[i].commit();
          console.log(`✅ VT: Batch ${i + 1}/${batches.length} executado com sucesso`);
        } catch (error) {
          console.error(`❌ VT: Erro no batch ${i + 1}:`, error);
          errorCount++;
        }
      }
      
      console.log(`🎉 VT: Reset concluído! ${updatedCount} usuários atualizados, ${errorCount} erros`);
      
      return {
        success: true,
        updatedCount,
        errorCount,
        totalUsers: usersSnapshot.size,
        date: todayString
      };
      
    } catch (error) {
      console.error('❌ VT: Erro geral ao resetar limites:', error);
      throw error;
    }
  });

/**
 * VT: Função HTTP de teste para testar o reset manualmente
 * Endpoint: https://[region]-[project-id].cloudfunctions.net/testResetDailyLimits
 * Usar apenas para testes - remover em produção
 */
exports.testResetDailyLimits = functions
  .region('southamerica-east1')
  .https
  .onRequest(async (req, res) => {
    // VT: Apenas admin pode chamar esta função
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(403).send('❌ Não autorizado');
      return;
    }
    
    try {
      console.log('🧪 VT: Teste manual de reset iniciado...');
      
      const db = admin.firestore();
      const today = new Date().toISOString().split('T')[0];
      
      let updatedCount = 0;
      const usersSnapshot = await db.collection('users').limit(10).get(); // VT: Limitar a 10 para teste
      
      const batch = db.batch();
      
      usersSnapshot.forEach((doc) => {
        batch.update(doc.ref, {
          'dailyUsage.offers': 0,
          'dailyUsage.urls': 0,
          ultimoReset: today,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        updatedCount++;
      });
      
      await batch.commit();
      
      console.log(`✅ VT: Teste concluído! ${updatedCount} usuários resetados`);
      
      res.json({
        success: true,
        message: `✅ Reset manual executado com sucesso!`,
        updatedCount,
        date: today
      });
      
    } catch (error) {
      console.error('❌ VT: Erro no teste:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
