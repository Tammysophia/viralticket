const functions = require("firebase-functions");
const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const MAX_BATCH_SIZE = 500;

const formatDate = (date = new Date()) => date.toISOString().slice(0, 10);

exports.resetDailyOffers = functions.pubsub
  .schedule("0 0 * * *")
  .timeZone("UTC")
  .onRun(async () => {
    const today = formatDate();
    functions.logger.info("Iniciando reset diário de ofertas", { today });

    try {
      const usersSnapshot = await db.collection("users").get();
      const totalUsers = usersSnapshot.size;
      let resetCount = 0;

      let batch = db.batch();
      let batchOperationCount = 0;

      for (const doc of usersSnapshot.docs) {
        const data = doc.data();
        const lastResetDate = data.lastResetDate || null;

        if (lastResetDate !== today) {
          batch.update(doc.ref, {
            offersGeneratedToday: 0,
            lastResetDate: today,
          });
          resetCount += 1;
          batchOperationCount += 1;
        }

        if (batchOperationCount === MAX_BATCH_SIZE) {
          await batch.commit();
          batch = db.batch();
          batchOperationCount = 0;
        }
      }

      if (batchOperationCount > 0) {
        await batch.commit();
      }

      functions.logger.info("Reset diário concluído com sucesso", {
        today,
        totalUsers,
        resetCount,
      });
    } catch (error) {
      functions.logger.error("Erro ao executar reset diário de ofertas", {
        today,
        error: error.message,
      });
      throw error;
    }

    return null;
  });
