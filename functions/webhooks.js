/**
 * Cloud Functions para processar Webhooks de Plataformas de Pagamento
 * 
 * Suporta:
 * - Hotmart
 * - Stripe
 * - Monetizze
 * - Eduzz
 * - PayPal
 */

const { onRequest } = require('firebase-functions/v2/https');
const { logger } = require('firebase-functions');
const admin = require('firebase-admin');
const { sendPasswordCreationEmail } = require('./services/emailService');

const db = admin.firestore();

/**
 * Gera uma senha temporária aleatória
 */
function generateTempPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `Temp${password}!`;
}

/**
 * Webhook genérico para todas as plataformas
 * URL: https://us-central1-[PROJECT_ID].cloudfunctions.net/processWebhook
 */
exports.processWebhook = onRequest(async (req, res) => {
  try {
    // Aceitar apenas POST
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    const platform = req.query.platform || 'unknown';
    const payload = req.body;

    logger.info(`📥 Webhook recebido de ${platform}`, { payload });

    // Processar de acordo com a plataforma
    let result;
    switch (platform.toLowerCase()) {
      case 'hotmart':
        result = await processHotmart(payload);
        break;
      case 'stripe':
        result = await processStripe(payload);
        break;
      case 'monetizze':
        result = await processMonetizze(payload);
        break;
      case 'eduzz':
        result = await processEduzz(payload);
        break;
      case 'paypal':
        result = await processPayPal(payload);
        break;
      default:
        logger.warn(`⚠️ Plataforma desconhecida: ${platform}`);
        res.status(400).send('Unknown platform');
        return;
    }

    // Salvar log do webhook
    await db.collection('webhookLogs').add({
      platform,
      event: result.event,
      email: result.email,
      plan: result.plan,
      status: result.status,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      payload,
    });

    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    logger.error('❌ Erro ao processar webhook:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Processar webhook da Hotmart
 */
async function processHotmart(payload) {
  const event = payload.event;
  const data = payload.data;

  const email = data.buyer?.email;
  const productName = data.product?.name;
  const status = data.purchase?.status;
  const transactionId = data.purchase?.transaction || data.transaction;

  // IDEMPOTÊNCIA: Verificar se a transação já foi processada
  if (transactionId) {
    const existingTransaction = await db.collection('processedTransactions')
      .doc(`hotmart_${transactionId}`)
      .get();
    
    if (existingTransaction.exists) {
      logger.info(`⚠️ Transação já processada: ${transactionId}`);
      return { event, email, plan: null, status: 'duplicate', message: 'Transação já processada' };
    }
  }

  logger.info(`🔥 Hotmart - Evento: ${event}, Email: ${email}, Status: ${status}`);

  if (event === 'PURCHASE_COMPLETE' || event === 'PURCHASE_APPROVED') {
    // Venda confirmada - Liberar acesso
    const plan = mapProductToPlan(productName);
    await createOrUpdateUser(email, plan, 'active');
    
    // Registrar transação como processada
    if (transactionId) {
      await db.collection('processedTransactions').doc(`hotmart_${transactionId}`).set({
        platform: 'hotmart',
        transactionId,
        email,
        event,
        processedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    return { event, email, plan, status: 'granted', message: 'Acesso liberado' };
  } else if (event === 'PURCHASE_REFUNDED' || event === 'PURCHASE_CHARGEBACK') {
    // Reembolso ou chargeback - Remover acesso
    await blockUser(email);
    return { event, email, plan: null, status: 'revoked', message: 'Acesso removido' };
  }

  return { event, email, plan: null, status: 'ignored', message: 'Evento ignorado' };
}

/**
 * Processar webhook do Stripe
 */
async function processStripe(payload) {
  const event = payload.type;
  const data = payload.data.object;

  const email = data.customer_email || data.receipt_email;
  const productId = data.lines?.data[0]?.price?.product;

  logger.info(`💳 Stripe - Evento: ${event}, Email: ${email}`);

  if (event === 'checkout.session.completed' || event === 'payment_intent.succeeded') {
    // Pagamento confirmado - Liberar acesso
    const plan = mapProductToPlan(productId);
    await createOrUpdateUser(email, plan, 'active');
    return { event, email, plan, status: 'granted', message: 'Acesso liberado' };
  } else if (event === 'charge.refunded' || event === 'charge.dispute.created') {
    // Reembolso ou disputa - Remover acesso
    await blockUser(email);
    return { event, email, plan: null, status: 'revoked', message: 'Acesso removido' };
  }

  return { event, email, plan: null, status: 'ignored', message: 'Evento ignorado' };
}

/**
 * Processar webhook da Monetizze
 */
async function processMonetizze(payload) {
  const status = payload.venda?.status;
  const email = payload.comprador?.email;
  const productId = payload.produto?.codigo;

  logger.info(`💰 Monetizze - Status: ${status}, Email: ${email}`);

  if (status === '2' || status === 2) {
    // Venda aprovada - Liberar acesso
    const plan = mapProductToPlan(productId);
    await createOrUpdateUser(email, plan, 'active');
    return { event: 'approved', email, plan, status: 'granted', message: 'Acesso liberado' };
  } else if (status === '6' || status === 6 || status === '7' || status === 7) {
    // Reembolso ou chargeback - Remover acesso
    await blockUser(email);
    return { event: 'refunded', email, plan: null, status: 'revoked', message: 'Acesso removido' };
  }

  return { event: status, email, plan: null, status: 'ignored', message: 'Evento ignorado' };
}

/**
 * Processar webhook da Eduzz
 */
async function processEduzz(payload) {
  const status = payload.trans_status;
  const email = payload.cus_email;
  const productId = payload.product_id;

  logger.info(`🔵 Eduzz - Status: ${status}, Email: ${email}`);

  if (status === 'aprovado' || status === 'Aprovado') {
    // Venda aprovada - Liberar acesso
    const plan = mapProductToPlan(productId);
    await createOrUpdateUser(email, plan, 'active');
    return { event: 'approved', email, plan, status: 'granted', message: 'Acesso liberado' };
  } else if (status === 'reembolsado' || status === 'cancelado') {
    // Reembolso ou cancelamento - Remover acesso
    await blockUser(email);
    return { event: 'refunded', email, plan: null, status: 'revoked', message: 'Acesso removido' };
  }

  return { event: status, email, plan: null, status: 'ignored', message: 'Evento ignorado' };
}

/**
 * Processar webhook do PayPal
 */
async function processPayPal(payload) {
  const eventType = payload.event_type;
  const resource = payload.resource;
  const email = resource.payer?.email_address;

  logger.info(`🅿️ PayPal - Evento: ${eventType}, Email: ${email}`);

  if (eventType === 'PAYMENT.SALE.COMPLETED') {
    // Pagamento confirmado - Liberar acesso
    const plan = mapProductToPlan(resource.custom_id);
    await createOrUpdateUser(email, plan, 'active');
    return { event: eventType, email, plan, status: 'granted', message: 'Acesso liberado' };
  } else if (eventType === 'PAYMENT.SALE.REFUNDED' || eventType === 'PAYMENT.SALE.REVERSED') {
    // Reembolso - Remover acesso
    await blockUser(email);
    return { event: eventType, email, plan: null, status: 'revoked', message: 'Acesso removido' };
  }

  return { event: eventType, email, plan: null, status: 'ignored', message: 'Evento ignorado' };
}

/**
 * Mapear produto/código para plano
 * Você pode configurar isso no painel admin
 */
function mapProductToPlan(productIdentifier) {
  // Buscar mapeamento do Firestore (configurado no admin)
  // Por enquanto, lógica simples baseada no nome/código
  const identifier = String(productIdentifier).toLowerCase();

  if (identifier.includes('mentoria') || identifier.includes('mentorship')) {
    return 'MENTORIA';
  } else if (identifier.includes('prata') || identifier.includes('silver') || identifier.includes('basic')) {
    return 'PRATA';
  } else if (identifier.includes('ouro') || identifier.includes('gold') || identifier.includes('pro')) {
    return 'OURO';
  } else if (identifier.includes('diamante') || identifier.includes('diamond') || identifier.includes('premium')) {
    return 'DIAMANTE';
  }

  // Padrão: PRATA
  return 'PRATA';
}

/**
 * Criar ou atualizar usuário com plano
 */
async function createOrUpdateUser(email, plan, status) {
  if (!email) {
    logger.error('❌ Email não fornecido');
    return;
  }

  try {
    // Buscar usuário por email
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();

    const userData = {
      email,
      plan,
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    // Se for plano MENTORIA, adicionar data de início
    if (plan === 'MENTORIA') {
      userData.planStartDate = admin.firestore.FieldValue.serverTimestamp();
    }

    if (snapshot.empty) {
      // Criar novo usuário
      const displayName = email.split('@')[0];
      const tempPassword = generateTempPassword();
      
      // 1. Criar usuário no Firebase Auth
      let authUser;
      try {
        authUser = await admin.auth().createUser({
          email,
          password: tempPassword,
          displayName,
        });
        logger.info(`✅ Usuário criado no Auth: ${email}`);
      } catch (authError) {
        logger.error(`❌ Erro ao criar usuário no Auth: ${authError.message}`);
        throw authError;
      }
      
      // 2. Criar perfil no Firestore
      userData.uid = authUser.uid;
      userData.displayName = displayName;
      userData.name = displayName;
      userData.avatar = `https://ui-avatars.com/api/?name=${displayName}&background=8B5CF6&color=fff`;
      userData.dailyUsage = { offers: 0, urls: 0 };
      userData.createdAt = admin.firestore.FieldValue.serverTimestamp();
      userData.status = 'active';
      // NÃO forçar troca de senha para quem comprou (já recebeu senha própria)
      
      await db.collection('users').doc(authUser.uid).set(userData);
      logger.info(`✅ Perfil criado no Firestore: ${email} - Plano: ${plan}`);
      
      // 3. Enviar email com credenciais
      try {
        await sendPasswordCreationEmail(email, tempPassword, displayName);
        logger.info(`📧 Email com credenciais enviado para ${email}`);
      } catch (emailError) {
        logger.error(`❌ Erro ao enviar email para ${email}:`, emailError);
        // Não falhar o webhook se o email falhar
      }
    } else {
      // Atualizar usuário existente
      const userDoc = snapshot.docs[0];
      await userDoc.ref.update(userData);
      logger.info(`✅ Usuário atualizado: ${email} - Plano: ${plan}`);
    }
  } catch (error) {
    logger.error(`❌ Erro ao criar/atualizar usuário ${email}:`, error);
    throw error;
  }
}

/**
 * Bloquear usuário (reembolso/chargeback)
 */
async function blockUser(email) {
  if (!email) {
    logger.error('❌ Email não fornecido');
    return;
  }

  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();

    if (!snapshot.empty) {
      const userDoc = snapshot.docs[0];
      await userDoc.ref.update({
        status: 'blocked',
        plan: 'PRATA', // Downgrade para plano básico
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      logger.info(`🚫 Usuário bloqueado: ${email}`);
    } else {
      logger.warn(`⚠️ Usuário não encontrado para bloquear: ${email}`);
    }
  } catch (error) {
    logger.error(`❌ Erro ao bloquear usuário ${email}:`, error);
    throw error;
  }
}
