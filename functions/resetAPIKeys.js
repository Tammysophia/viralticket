/**
 * Cloud Function para resetar quotas das chaves API diariamente
 */

const { onSchedule } = require('firebase-functions/v2/scheduler');
const { logger } = require('firebase-functions');
const admin = require('firebase-admin');

const db = admin.firestore();

/**
 * Reseta as quotas de todas as chaves API às 00:00 UTC
 */
exports.resetAPIKeysQuota = onSchedule(
  {
    schedule: 'every day 00:05', // 5 minutos após o reset de ofertas
    timeZone: 'UTC',
    retryConfig: {
      retryCount: 3,
      maxRetryDuration: '5m',
    },
  },
  async () => {
    const today = new Date().toISOString().split('T')[0];
    
    logger.info(`🔑 Iniciando reset de quotas das chaves API (${today})`);

    try {
      const apiKeysRef = db.collection('apiKeys');
      const snapshot = await apiKeysRef.get();

      if (snapshot.empty) {
        logger.info('ℹ️ Nenhuma chave API encontrada no Firestore');
        return;
      }

      let resetCount = 0;
      let errorCount = 0;

      for (const doc of snapshot.docs) {
        try {
          await doc.ref.update({
            requestCount: 0,
            quota: 0,
            lastReset: admin.firestore.FieldValue.serverTimestamp(),
          });
          resetCount += 1;
          logger.debug(`✅ Resetada: ${doc.id}`);
        } catch (error) {
          errorCount += 1;
          logger.error(`❌ Falha ao resetar ${doc.id}:`, error.message);
        }
      }

      logger.info(
        `🎯 Reset de chaves API concluído (${today}). Resetadas: ${resetCount}, Erros: ${errorCount}`,
      );
    } catch (error) {
      logger.error('❌ Erro ao resetar chaves API:', error);
    }
  },
);
