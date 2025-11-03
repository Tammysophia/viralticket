# 🔧 DEBUG RÁPIDO - Erro ao Gerar Oferta

## 🚨 PASSO 1: Ver Logs do Console

**Abra o Console (F12)** e tente gerar uma oferta novamente.

Procure por estas mensagens:

### ❌ Erro: "AGENT_NOT_FOUND"
```
[AGENTS] fetching template: sophia-fenix
[AGENTS][ERR] AGENT_NOT_FOUND: Document does not exist
```
**CAUSA:** Firestore não tem os documentos das agentes
**SOLUÇÃO:**
```bash
npm run inject-agents
```

---

### ❌ Erro: "AGENT_KEY_INVALID"
```
[AGENTS] fetching template: sophia-fenix
[AGENTS] decrypting template with WebCrypto (AES-256-GCM)...
[AGENTS][ERR] AGENT_KEY_INVALID: Missing or invalid VITE_AGENT_MASTER_KEY
```
**CAUSA:** `.env` não tem `VITE_AGENT_MASTER_KEY` ou está errada
**SOLUÇÃO:**
1. Gerar chave:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
2. Criar/editar `.env` na raiz:
```bash
VITE_AGENT_MASTER_KEY=sua_chave_hex_64_chars
```
3. Rebuild:
```bash
npm run build
npm run dev
```

---

### ❌ Erro: "AGENT_DECRYPT_FAIL"
```
[AGENTS] fetching template: sophia-fenix
[AGENTS] decrypting template with WebCrypto (AES-256-GCM)...
[AGENTS][ERR] AGENT_DECRYPT_FAIL: ...
```
**CAUSA:** Chave do `.env` é diferente da usada para injetar
**SOLUÇÃO:**
1. Garantir mesma chave em `.env` e nas variáveis do script
2. Re-injetar:
```bash
npm run inject-agents
```

---

### ❌ Erro: "Chave da API do OpenAI não configurada"
```
[OPENAI] Starting offer generation...
Error: Chave da API do OpenAI não configurada
```
**CAUSA:** Não tem chave OpenAI no Admin
**SOLUÇÃO:**
1. Admin → API Keys
2. Adicionar chave OpenAI (começa com `sk-`)

---

## 🚀 SOLUÇÃO RÁPIDA (Caso não tenha nada configurado)

### 1️⃣ Gerar Chave Mestra
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
**Copie o resultado!** (algo como: `a1b2c3d4e5f6...`)

### 2️⃣ Criar arquivo `.env` na raiz
```bash
# .env (na raiz do projeto, mesmo nível do package.json)
VITE_AGENT_MASTER_KEY=COLE_A_CHAVE_AQUI

# Firebase (você já deve ter isso)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 3️⃣ Configurar scripts para injetar
```bash
# Criar arquivo .env na raiz (ou adicionar estas linhas)
AGENT_MASTER_KEY=MESMA_CHAVE_DO_PASSO_1
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

### 4️⃣ Injetar prompts
```bash
cd scripts
npm install
cd ..
npm run inject-agents
```

### 5️⃣ Rebuild e testar
```bash
npm run build
npm run dev
```

---

## 📋 CHECKLIST DE VERIFICAÇÃO

Marque o que você JÁ FEZ:

- [ ] Arquivo `.env` existe na raiz?
- [ ] `.env` tem `VITE_AGENT_MASTER_KEY=...`?
- [ ] Executou `npm run inject-agents`?
- [ ] Viu mensagem "✅ Sophia Fênix injetada"?
- [ ] No Firebase Console → Firestore tem coleção `agent_templates`?
- [ ] Tem docs `sophia-fenix` e `sophia-universal`?
- [ ] Campo `prompt_enc` está preenchido (texto grande)?
- [ ] No Admin → API Keys tem chave OpenAI cadastrada?
- [ ] Executou `npm run build` depois de criar `.env`?

---

## 🆘 AINDA COM ERRO?

**Me envie os logs do console:**
1. Abra F12
2. Vá na aba "Console"
3. Clique em "Gerar Oferta"
4. Copie TODAS as mensagens que aparecem (principalmente as que começam com `[AGENTS]`, `[OPENAI]` ou `[AIChat]`)

**Ou me diga qual destas mensagens você vê:**
- ❌ "Agente não encontrada no Firestore"
- ❌ "Chave mestre inválida ou ausente"
- ❌ "Chave da API do OpenAI não configurada"
- ❌ Outro erro (qual?)
