# 🔒 Guia de Segurança - Agentes Camuflados ViralTicket

## 📋 Visão Geral

Este documento descreve a implementação do sistema de **Agentes Camuflados** do ViralTicket, onde os prompts de IA são completamente protegidos e nunca expostos ao frontend ou usuários finais.

## 🎯 Objetivos de Segurança

1. ✅ **NUNCA** expor prompts internos no frontend
2. ✅ Criptografar todos os prompts com AES-256-GCM
3. ✅ Processar agentes apenas no backend (Cloud Functions)
4. ✅ Registrar todas as alterações em logs de auditoria
5. ✅ Restringir edição de templates apenas para ADMIN
6. ✅ Implementar rate limiting por usuário
7. ✅ Permitir rotação segura de chaves

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│  - AgentRunner.jsx: UI para executar agentes                   │
│  - AdminAgentTemplates.jsx: Painel admin (apenas metadata)     │
│  - agentsService.js: Chamadas seguras às Cloud Functions       │
│  ❌ SEM acesso direto aos prompts                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS + Auth
┌─────────────────────────────────────────────────────────────────┐
│                    CLOUD FUNCTIONS (Backend)                    │
│                                                                 │
│  📝 /agents/run (POST)                                          │
│     - Valida autenticação                                       │
│     - Rate limiting                                             │
│     - Descriptografa prompt                                     │
│     - Monta prompt final                                        │
│     - Chama OpenAI                                              │
│     - Retorna APENAS resultado (sem prompt)                     │
│                                                                 │
│  📝 /admin/agents/templates (POST) - ADMIN apenas               │
│     - Criptografa prompt antes de salvar                        │
│     - Registra auditoria                                        │
│                                                                 │
│  🔒 Encryption: AES-256-GCM                                     │
│  🔒 Master Key: AGENT_MASTER_KEY (env var)                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      FIRESTORE DATABASE                         │
│                                                                 │
│  Collection: agent_templates                                    │
│  ├─ sophia-fenix                                                │
│  │  ├─ name: "Sophia Fênix"                                    │
│  │  ├─ description: "..."                                       │
│  │  ├─ prompt_enc: "BASE64_ENCRYPTED_DATA" 🔒                  │
│  │  ├─ version: 3                                              │
│  │  └─ ...metadata                                             │
│  │                                                              │
│  Collection: agent_runs                                         │
│  ├─ {runId}                                                     │
│  │  ├─ userId: "..."                                            │
│  │  ├─ agentId: "sophia-fenix"                                 │
│  │  ├─ promptHash: "sha256..." (apenas hash, não o prompt)    │
│  │  └─ ...metadata                                             │
│  │                                                              │
│  Collection: agent_audit_logs                                   │
│  └─ {logId}                                                     │
│     ├─ action: "create|update|deactivate"                       │
│     ├─ userId: "admin@..."                                      │
│     ├─ changeReason: "..."                                      │
│     └─ timestamp                                                │
└─────────────────────────────────────────────────────────────────┘
```

## 🔐 Criptografia

### Algoritmo: AES-256-GCM

- **Chave**: 32 bytes (64 caracteres hex)
- **IV**: 12 bytes (GCM standard)
- **Auth Tag**: 16 bytes
- **Formato**: `BASE64(IV + AuthTag + CipherText)`

### Geração de Chave Mestra

```bash
# Gerar nova chave (64 caracteres hex)
node functions/scripts/initializeTemplates.js
```

### Configurar Chave no Firebase

```bash
# Firebase Functions Config
firebase functions:config:set agent.master_key="SUA_CHAVE_DE_64_CARACTERES"

# .env local (desenvolvimento)
AGENT_MASTER_KEY=SUA_CHAVE_DE_64_CARACTERES
```

## 🚀 Deploy e Configuração

### 1. Instalar Dependências

```bash
cd functions
npm install
```

### 2. Configurar Firebase

```bash
# Login
firebase login

# Inicializar projeto (se necessário)
firebase init functions

# Configurar variáveis de ambiente
firebase functions:config:set \
  agent.master_key="SUA_CHAVE_64_CHARS" \
  openai.api_key="sk-..."
```

### 3. Inicializar Templates

```bash
# Executar script de inicialização
node functions/scripts/initializeTemplates.js
```

Este script:
- Gera chave mestra (se não existir)
- Cria templates padrão (Sophia Fênix e Sophia Universal)
- Criptografa prompts
- Salva no Firestore
- Registra auditoria

### 4. Deploy

```bash
# Deploy das Cloud Functions
firebase deploy --only functions

# Verificar logs
firebase functions:log
```

## 🔄 Rotação de Chaves

**QUANDO rotacionar:**
- A cada 90 dias (política de segurança)
- Suspeita de vazamento
- Mudança de equipe admin
- Conformidade regulatória

**COMO rotacionar:**

```bash
node functions/scripts/rotateKeys.js
```

O script:
1. Solicita chave antiga
2. Gera nova chave
3. Descriptografa todos os prompts (chave antiga)
4. Re-criptografa com nova chave
5. Atualiza banco de dados
6. Registra auditoria

**APÓS rotação:**
1. Atualizar `AGENT_MASTER_KEY` no ambiente de produção
2. Reiniciar Cloud Functions
3. Testar execução de agentes
4. Guardar chave antiga em backup (30 dias)
5. Destruir chave antiga após período de segurança

## 👥 Controle de Acesso

### Roles

- **admin**: Pode criar/editar templates, ver auditoria
- **user**: Pode executar agentes, ver resultados próprios
- **free**: Limitações adicionais de rate limiting

### Verificação de Permissão

```javascript
// Middleware authenticateUser
const token = req.headers.authorization.split('Bearer ')[1];
const decodedToken = await getAuth().verifyIdToken(token);
req.user = { uid: decodedToken.uid, role: ... };

// Middleware requireAdmin
if (req.user.role !== 'admin') {
  return res.status(403).json({ error: 'Forbidden' });
}
```

## 📊 Auditoria

Todas as ações críticas são registradas:

```javascript
await db.collection('agent_audit_logs').add({
  agentId: 'sophia-fenix',
  action: 'update',
  userId: 'admin@example.com',
  changeReason: 'Ajuste no tom de voz',
  promptHash: 'sha256...',
  version: 4,
  timestamp: new Date()
});
```

**Visualizar auditoria:**
- Frontend: Painel Admin > Templates > Histórico
- Firestore Console: Collection `agent_audit_logs`

## 🛡️ Segurança Adicional

### Rate Limiting

- **Execução de Agentes**: 30 requisições/minuto por usuário
- **Admin APIs**: 60 requisições/minuto
- **Por Agente**: 20 execuções/hora por usuário

### Sanitização de Input

```javascript
function sanitizeUserInput(input) {
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
    .slice(0, 10000); // Máximo 10k caracteres
}
```

### Validação de Output

```javascript
// Parse JSON com try/catch
try {
  parsedResult = JSON.parse(rawContent);
} catch (parseError) {
  throw new Error('Resposta inválida da IA');
}
```

## 🧪 Testes

### Testar Criptografia

```javascript
import { encryptPrompt, decryptPrompt } from './utils/encryption.js';

const original = "Prompt secreto";
const encrypted = encryptPrompt(original);
const decrypted = decryptPrompt(encrypted);

console.assert(decrypted === original);
```

### Testar Endpoint

```bash
# Obter token de autenticação
firebase login --reauth

# Testar execução de agente
curl -X POST https://us-central1-SEU_PROJECT.cloudfunctions.net/agents/agents/run \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "sophia-fenix",
    "userInput": "Comentários sobre emagrecimento..."
  }'
```

## 🚨 Monitoramento

### Logs Importantes

```bash
# Logs em tempo real
firebase functions:log --only agents

# Filtrar erros
firebase functions:log --only agents | grep ERROR

# Logs de auditoria (Firestore Console)
# Collection: agent_audit_logs
```

### Alertas Críticos

Configure alertas para:
- ❌ Falhas de descriptografia (possível chave errada)
- ❌ Rate limit excedido repetidamente (possível ataque)
- ❌ Tentativas de acesso sem autenticação
- ⚠️  Edições de templates fora do horário comercial

## 📝 Checklist de Segurança

Antes de ir para produção:

- [ ] AGENT_MASTER_KEY configurada e salva em local seguro
- [ ] Backups automáticos do Firestore habilitados
- [ ] Regras de segurança do Firestore configuradas
- [ ] Rate limiting testado e funcionando
- [ ] Auditoria registrando todas as ações
- [ ] Frontend NÃO expõe prompts em nenhum lugar
- [ ] Admin UI exige autenticação + role admin
- [ ] OpenAI API key separada por ambiente (dev/prod)
- [ ] Logs de erro sendo monitorados
- [ ] Plano de rotação de chaves documentado

## 🆘 Troubleshooting

### Erro: "AGENT_MASTER_KEY não configurada"

```bash
firebase functions:config:set agent.master_key="SUA_CHAVE"
firebase deploy --only functions
```

### Erro: "Falha na descriptografia"

Possíveis causas:
1. Chave errada no ambiente
2. Dados corrompidos
3. Formato inválido

Solução:
```bash
# Verificar chave
firebase functions:config:get

# Re-criptografar template específico (via Admin UI)
```

### Erro: "Rate limit exceeded"

Usuário atingiu limite de requisições. Aguardar reset ou aumentar limite para usuário específico.

## 📚 Referências

- [AES-GCM (Node.js Crypto)](https://nodejs.org/api/crypto.html)
- [Firebase Cloud Functions](https://firebase.google.com/docs/functions)
- [OpenAI API](https://platform.openai.com/docs)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

## 📞 Suporte

Em caso de dúvidas ou problemas de segurança:
- 📧 Email: security@viralticket.com
- 🔒 Relatar vulnerabilidade: security-report@viralticket.com
- 📖 Documentação: /docs/security

---

**IMPORTANTE**: Este documento contém informações sensíveis sobre a arquitetura de segurança. 
Mantenha-o em local seguro e acessível apenas para a equipe autorizada.

**Versão**: 1.0  
**Última atualização**: 2025-10-27  
**Próxima revisão**: 2026-01-27
