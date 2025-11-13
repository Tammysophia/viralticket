/**
 * Cloud Function para verificar e bloquear planos expirados
 * Executa diariamente às 01:00 UTC
 */

const { onSchedule } = require('firebase-functions/v2/scheduler');
const { logger } = require('firebase-functions');
const admin = require('firebase-admin');

const db = admin.firestore();

// Planos que expiram e suas durações em dias
const EXPIRING_PLANS = {
  MENTORIA: 365, // 1 ano
};

/**
 * Verifica planos expirados e bloqueia usuários
 */
exports.checkExpiredPlans = onSchedule(
  {
    schedule: 'every day 01:00',
    timeZone: 'UTC',
    retryConfig: {
      retryCount: 3,
      maxRetryDuration: '5m',
    },
  },
  async () => {
    const today = new Date().toISOString().split('T')[0];
    
    logger.info(`🕐 Verificando planos expirados (${today})`);

    try {
      const usersRef = db.collection('users');
      const snapshot = await usersRef.get();

      if (snapshot.empty) {
        logger.info('ℹ️ Nenhum usuário encontrado');
        return;
      }

      let expiredCount = 0;
      let checkedCount = 0;

      for (const doc of snapshot.docs) {
        const userData = doc.data();
        const plan = userData.plan;
        const planStartDate = userData.planStartDate;

        // Verificar apenas planos que expiram
        if (!EXPIRING_PLANS[plan]) {
          continue;
        }

        checkedCount += 1;

        // Se não tem data de início, usar data de criação
        const startDate = planStartDate 
          ? new Date(planStartDate) 
          : userData.createdAt 
            ? new Date(userData.createdAt.toDate ? userData.createdAt.toDate() : userData.createdAt)
            : new Date();

        const now = new Date();
        const daysSinceStart = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
        const planDuration = EXPIRING_PLANS[plan];

        // Verificar se expirou
        if (daysSinceStart >= planDuration) {
          try {
            // Bloquear usuário e downgrade para PRATA
            await doc.ref.update({
              status: 'expired',
              plan: 'PRATA',
              previousPlan: plan,
              expiredAt: admin.firestore.FieldValue.serverTimestamp(),
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            expiredCount += 1;
            logger.info(`⏰ Plano expirado: ${userData.email} (${plan} → PRATA)`);
          } catch (error) {
            logger.error(`❌ Erro ao expirar plano de ${userData.email}:`, error.message);
          }
        } else {
          const daysRemaining = planDuration - daysSinceStart;
          
          // Alerta se faltam 7 dias ou menos
          if (daysRemaining <= 7) {
            logger.warn(`⚠️ Plano ${plan} de ${userData.email} expira em ${daysRemaining} dias`);
          }
        }
      }

      logger.info(
        `✅ Verificação concluída (${today}). Verificados: ${checkedCount}, Expirados: ${expiredCount}`,
      );
    } catch (error) {
      logger.error('❌ Erro ao verificar planos expirados:', error);
    }
  },
);
