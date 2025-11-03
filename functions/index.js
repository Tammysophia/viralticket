// VT: secure-agent - Firebase Cloud Functions - Entry Point
import { onRequest } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { OpenAI } from 'openai';
import express from 'express';

// Inicializar Firebase Admin
initializeApp();

// Importar serviços e middleware
import { authenticateUser, requireAdmin, requirePlan, rateLimit } from './middleware/auth.js';
import { 
  listAgentTemplates, 
  saveAgentTemplate, 
  deactivateAgentTemplate,
  getAgentHistory 
} from './services/agentTemplateService.js';
import { 
  executeAgent, 
  getUserRuns, 
  getRunResult 
} from './services/agentRunService.js';

// Criar app Express
const app = express();
// CORS: permitir todas as origens (ajustar para produção se necessário)
app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }
  next();
});
app.use(express.json());

// ============================================
// ROTAS PÚBLICAS (sem autenticação)
// ============================================

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'viralticket-agents', timestamp: Date.now() });
});

// ============================================
// ROTAS DE EXECUÇÃO DE AGENTES (autenticadas)
// ============================================

/**
 * POST /agents/run
 * Executa um agente de IA
 * Body: { agentId, userInput, context?: { offerId } }
 */
app.post('/agents/run', 
  authenticateUser, 
  rateLimit(30, 60000), // 30 reqs/min
  async (req, res) => {
    try {
      const { agentId, userInput, context } = req.body;
      
      if (!agentId || !userInput) {
        return res.status(400).json({
          error: 'Parâmetros obrigatórios: agentId, userInput',
          code: 'INVALID_PARAMS'
        });
      }
      
      // Inicializar OpenAI
      const openaiKey = process.env.OPENAI_API_KEY;
      if (!openaiKey) {
        return res.status(500).json({
          error: 'Serviço de IA não configurado',
          code: 'SERVICE_ERROR'
        });
      }
      
      const openai = new OpenAI({ apiKey: openaiKey });
      
      // Executar agente
      const result = await executeAgent({
        userId: req.user.uid,
        agentId,
        userInput,
        context: context || {}
      }, openai);
      
      // Retornar APENAS o resultado (NUNCA o prompt)
      res.json({
        success: true,
        runId: result.runId,
        result: result.result,
        metadata: result.metadata
      });
      
    } catch (error) {
      console.error('Erro ao executar agente:', error);
      res.status(500).json({
        error: error.message || 'Erro ao executar agente',
        code: 'EXECUTION_ERROR'
      });
    }
  }
);

/**
 * GET /agents/templates
 * Lista templates disponíveis (sem prompts)
 */
app.get('/agents/templates', authenticateUser, async (req, res) => {
  try {
    const templates = await listAgentTemplates();
    res.json({ templates });
  } catch (error) {
    console.error('Erro ao listar templates:', error);
    res.status(500).json({
      error: 'Erro ao listar templates',
      code: 'LIST_ERROR'
    });
  }
});

/**
 * GET /agents/runs
 * Lista histórico de runs do usuário
 */
app.get('/agents/runs', authenticateUser, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const runs = await getUserRuns(req.user.uid, limit);
    res.json({ runs });
  } catch (error) {
    console.error('Erro ao buscar runs:', error);
    res.status(500).json({
      error: 'Erro ao buscar histórico',
      code: 'FETCH_ERROR'
    });
  }
});

/**
 * GET /agents/runs/:runId
 * Obtém resultado de um run específico
 */
app.get('/agents/runs/:runId', authenticateUser, async (req, res) => {
  try {
    const { runId } = req.params;
    const result = await getRunResult(runId, req.user.uid);
    res.json(result);
  } catch (error) {
    console.error('Erro ao buscar resultado:', error);
    res.status(404).json({
      error: error.message || 'Resultado não encontrado',
      code: 'NOT_FOUND'
    });
  }
});

// ============================================
// ROTAS ADMIN (apenas administradores)
// ============================================

/**
 * POST /admin/agents/templates
 * Cria ou atualiza um template (ADMIN apenas)
 * Body: { agentId, name, description, promptPlaintext, changeReason, model?, temperature?, max_tokens? }
 */
app.post('/admin/agents/templates',
  authenticateUser,
  requireAdmin,
  async (req, res) => {
    try {
      const { agentId, name, description, promptPlaintext, changeReason, model, temperature, max_tokens } = req.body;
      
      if (!agentId || !name || !promptPlaintext) {
        return res.status(400).json({
          error: 'Parâmetros obrigatórios: agentId, name, promptPlaintext',
          code: 'INVALID_PARAMS'
        });
      }
      
      if (!changeReason) {
        return res.status(400).json({
          error: 'changeReason é obrigatório para auditoria',
          code: 'MISSING_REASON'
        });
      }
      
      const saved = await saveAgentTemplate(
        agentId,
        { name, description, promptPlaintext, model, temperature, max_tokens },
        req.user.uid,
        changeReason
      );
      
      res.json({
        success: true,
        template: saved
      });
      
    } catch (error) {
      console.error('Erro ao salvar template:', error);
      res.status(500).json({
        error: error.message || 'Erro ao salvar template',
        code: 'SAVE_ERROR'
      });
    }
  }
);

/**
 * DELETE /admin/agents/templates/:agentId
 * Desativa um template (ADMIN apenas)
 */
app.delete('/admin/agents/templates/:agentId',
  authenticateUser,
  requireAdmin,
  async (req, res) => {
    try {
      const { agentId } = req.params;
      await deactivateAgentTemplate(agentId, req.user.uid);
      res.json({ success: true, message: 'Template desativado' });
    } catch (error) {
      console.error('Erro ao desativar template:', error);
      res.status(500).json({
        error: 'Erro ao desativar template',
        code: 'DELETE_ERROR'
      });
    }
  }
);

/**
 * GET /admin/agents/templates/:agentId/history
 * Obtém histórico de um template (ADMIN apenas)
 */
app.get('/admin/agents/templates/:agentId/history',
  authenticateUser,
  requireAdmin,
  async (req, res) => {
    try {
      const { agentId } = req.params;
      const history = await getAgentHistory(agentId);
      res.json({ history });
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      res.status(500).json({
        error: 'Erro ao buscar histórico',
        code: 'FETCH_ERROR'
      });
    }
  }
);

// ============================================
// EXPORT CLOUD FUNCTION
// ============================================

export const agents = onRequest({
  region: 'us-central1',
  memory: '256MiB',
  timeoutSeconds: 60,
  maxInstances: 100
}, app);
