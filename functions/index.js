/**
 * Funções Cloud para resetar os limites diários de ofertas
 */
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { logger } = require('firebase-functions');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Helper para obter data no formato YYYY-MM-DD em UTC
 */
const getTodayISODate = () => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Importar webhooks
const webhooks = require('./webhooks');
const resetAPIKeys = require('./resetAPIKeys');

// Exportar funções de webhook
exports.processWebhook = webhooks.processWebhook;

// Exportar função de reset de chaves API
exports.resetAPIKeysQuota = resetAPIKeys.resetAPIKeysQuota;

// Reset diário de ofertas
exports.resetDailyOffers = onSchedule(
  {
    schedule: 'every day 00:00',
    timeZone: 'UTC',
    retryConfig: {
      retryCount: 3,
      maxRetryDuration: '5m',
    },
  },
  async () => {
    const today = getTodayISODate();
    const usersRef = db.collection('users');
    const snapshot = await usersRef.get();

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    logger.info(`🚀 Iniciando reset diário de ofertas (${today}). Total de usuários: ${snapshot.size}`);

    for (const doc of snapshot.docs) {
      const userData = doc.data();
      const plan = userData.plan || 'FREE';
      const lastResetDate = userData.lastResetDate || null;

      // Se já foi resetado hoje, ignorar
      if (lastResetDate === today) {
        skippedCount += 1;
        continue;
      }

      try {
        await doc.ref.update({
          offersGeneratedToday: 0,
          lastResetDate: today,
        });
        updatedCount += 1;
        logger.debug(`✅ Resetado: ${doc.id} | Plano: ${plan}`);
      } catch (error) {
        errorCount += 1;
        logger.error(`❌ Falha ao resetar ${doc.id}`, {
          error: error.message,
          plan,
        });
      }
    }

    logger.info(
      `🎯 Reset diário concluído (${today}). Atualizados: ${updatedCount}, ignorados: ${skippedCount}, erros: ${errorCount}`,
    );
  },
);
