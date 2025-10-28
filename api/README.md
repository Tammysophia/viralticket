# 🔒 Backend API - Agentes IA

## 📋 Endpoint Principal

### `POST /api/agents/run`

Gera ofertas usando agentes IA com prompts criptografados do Firestore.

---

## 🚨 IMPORTANTE: SEM FALLBACK

**Este endpoint NUNCA usa prompts genéricos ou fallback.**

Se o prompt não existir no Firestore, retorna erro **422** e **PARA A EXECUÇÃO**.

---

## 📥 Request

```json
POST /api/agents/run
Content-Type: application/json

{
  "agentId": "sophia-fenix",
  "userInput": "Comentário ou texto para análise",
  "apiKey": "sk-..."
}
```

### Parâmetros

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `agentId` | string | ✅ | ID da agente (`sophia-fenix` ou `sophia-universal`) |
| `userInput` | string | ✅ | Texto/comentários para análise |
| `apiKey` | string | ✅ | Chave da OpenAI API |

---

## 📤 Response

### ✅ Sucesso (200)

```json
{
  "success": true,
  "agent": "Sophia Fênix",
  "response": "{\n  \"title\": \"...\",\n  \"subtitle\": \"...\"\n  ...\n}",
  "usage": {
    "prompt_tokens": 2500,
    "completion_tokens": 800,
    "total_tokens": 3300
  }
}
```

### ❌ Erros

#### Agente não encontrada (422)
```json
{
  "error": "Agent not found",
  "message": "Agente 'sophia-fenix' não encontrada. Execute 'npm run inject-agents' para configurar."
}
```

#### Agente inativa (422)
```json
{
  "error": "Agent inactive",
  "message": "Agente 'sophia-fenix' está inativa."
}
```

#### Prompt não configurado (422)
```json
{
  "error": "Agent prompt missing",
  "message": "Prompt da agente 'sophia-fenix' não configurado."
}
```

#### Erro ao descriptografar (422)
```json
{
  "error": "Failed to decrypt agent prompt",
  "message": "Erro ao descriptografar prompt da agente. Verifique AGENT_MASTER_KEY."
}
```

#### Prompt vazio (422)
```json
{
  "error": "Empty agent prompt",
  "message": "Prompt da agente está vazio após descriptografia."
}
```

#### Parâmetro faltando (400)
```json
{
  "error": "agentId is required"
}
```

---

## 🔒 Fluxo de Segurança

```
1. Receber requisição
   ↓
2. Validar parâmetros (agentId, userInput, apiKey)
   ↓
3. Buscar agente no Firestore (agent_templates)
   ↓
4. ❌ SE NÃO EXISTIR → Retornar 422
   ↓
5. ❌ SE INATIVA → Retornar 422
   ↓
6. ❌ SE SEM PROMPT → Retornar 422
   ↓
7. Descriptografar prompt com AES-256-GCM
   ↓
8. ❌ SE FALHAR → Retornar 422
   ↓
9. ❌ SE VAZIO → Retornar 422
   ↓
10. Montar mensagens: [system, user]
    ↓
11. Chamar OpenAI API
    ↓
12. ✅ Retornar resposta
```

---

## ⚠️ REGRAS CRÍTICAS

### 🚫 NUNCA Fazer:

1. ❌ Usar prompt fallback ou genérico
2. ❌ Gerar resposta sem systemPrompt
3. ❌ Inventar mensagem de sistema
4. ❌ Continuar se prompt não existir
5. ❌ Retornar 200 com erro silencioso

### ✅ SEMPRE Fazer:

1. ✅ Verificar se agente existe
2. ✅ Verificar se agente está ativa
3. ✅ Verificar se prompt_enc existe
4. ✅ Descriptografar prompt
5. ✅ Validar que prompt não está vazio
6. ✅ Retornar erro 422 se qualquer validação falhar

---

## 🛠️ Variáveis de Ambiente

```env
# Obrigatórias
AGENT_MASTER_KEY=64_caracteres_hex
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

# Opcionais
OPENAI_MODEL=gpt-4  # Default: gpt-4
```

---

## 🧪 Teste Local

```bash
curl -X POST http://localhost:3000/api/agents/run \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "sophia-fenix",
    "userInput": "Me sinto sozinha e sempre escolho homens errados",
    "apiKey": "sk-..."
  }'
```

---

## 📊 Logs Esperados

### ✅ Sucesso:
```
🤖 API: Processando requisição para agente: sophia-fenix
🔓 API: Descriptografando prompt da agente sophia-fenix...
✅ API: Prompt descriptografado com sucesso (3254 caracteres)
🚀 API: Enviando requisição para OpenAI...
✅ API: Resposta recebida do OpenAI
```

### ❌ Erro (agente não encontrada):
```
🤖 API: Processando requisição para agente: sophia-fenix
❌ API: Agente sophia-fenix não encontrada
→ Retorna 422
```

### ❌ Erro (prompt vazio):
```
🤖 API: Processando requisição para agente: sophia-fenix
🔓 API: Descriptografando prompt da agente sophia-fenix...
❌ API: Prompt descriptografado está vazio para sophia-fenix
→ Retorna 422
```

---

## 🔄 Deploy

### Vercel

1. Criar função serverless em `/api/agents/run.js`
2. Configurar variáveis de ambiente no Vercel
3. Deploy automático via Git

### Outras plataformas

Adaptar handler para:
- AWS Lambda
- Google Cloud Functions
- Azure Functions

---

## 🚀 Integração com Frontend

```javascript
// Frontend (React)
async function generateOffer(agentId, userInput) {
  const apiKey = await getServiceAPIKey('openai');
  
  const response = await fetch('/api/agents/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agentId, userInput, apiKey })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error);
  }

  const data = await response.json();
  return JSON.parse(data.response);
}
```

---

✅ **Endpoint pronto e seguro!**
