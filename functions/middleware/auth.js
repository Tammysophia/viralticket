// VT: secure-agent - Middleware de autenticação e autorização
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

/**
 * Middleware para verificar autenticação Firebase
 * Extrai token do header Authorization: Bearer <token>
 */
export async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Token de autenticação não fornecido',
        code: 'AUTH_REQUIRED'
      });
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    // Verificar token com Firebase Auth
    const decodedToken = await getAuth().verifyIdToken(token);
    
    // Adicionar dados do usuário no request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified
    };
    
    // Buscar dados adicionais do Firestore (role, plan, etc)
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    
    if (userDoc.exists) {
      req.user.role = userDoc.data().role || 'user';
      req.user.plan = userDoc.data().plan || 'free';
      req.user.displayName = userDoc.data().displayName;
    } else {
      req.user.role = 'user';
      req.user.plan = 'free';
    }
    
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(401).json({
      error: 'Token inválido ou expirado',
      code: 'AUTH_INVALID'
    });
  }
}

/**
 * Middleware para verificar se usuário é admin
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Autenticação necessária',
      code: 'AUTH_REQUIRED'
    });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Acesso negado - privilégios de administrador necessários',
      code: 'FORBIDDEN'
    });
  }
  
  next();
}

/**
 * Middleware para verificar plan do usuário
 * @param {Array<string>} allowedPlans - Plans permitidos
 */
export function requirePlan(allowedPlans = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Autenticação necessária',
        code: 'AUTH_REQUIRED'
      });
    }
    
    const userPlan = req.user.plan || 'free';
    
    if (!allowedPlans.includes(userPlan) && req.user.role !== 'admin') {
      return res.status(403).json({
        error: `Acesso negado - plano requerido: ${allowedPlans.join(' ou ')}`,
        code: 'PLAN_REQUIRED',
        userPlan,
        requiredPlans: allowedPlans
      });
    }
    
    next();
  };
}

/**
 * Middleware de rate limiting simples baseado em IP/User
 */
const rateLimitStore = new Map();

export function rateLimit(maxRequests = 60, windowMs = 60000) {
  return (req, res, next) => {
    const key = req.user?.uid || req.ip;
    const now = Date.now();
    
    if (!rateLimitStore.has(key)) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const record = rateLimitStore.get(key);
    
    if (now > record.resetTime) {
      // Reset window
      record.count = 1;
      record.resetTime = now + windowMs;
      return next();
    }
    
    if (record.count >= maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      return res.status(429).json({
        error: 'Muitas requisições',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter
      });
    }
    
    record.count++;
    next();
  };
}

// Limpar rate limit store a cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);
