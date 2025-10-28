# 🧪 Guia de Teste - Sistema de Agentes IA

## ✅ Sistema Implementado

O sistema agora usa **SEMPRE** prompts COMPLETOS do Firestore. **NENHUM fallback genérico**.

### Mudanças Críticas:
- ❌ **REMOVIDO**: Prompts hardcoded/simplificados
- ✅ **ADICIONADO**: Descriptografia Web Crypto API (AES-256-GCM)
- ✅ **ADICIONADO**: Códigos de erro específicos
- ✅ **ADICIONADO**: Toasts amigáveis para usuários
- ✅ **ADICIONADO**: Toasts detalhados para admins

---

## 📋 Pré-requisitos

### 1. Variáveis de Ambiente (Front)

Crie/atualize `.env` na raiz do projeto:

```bash
# Chave mestra para descriptografia (front)
VITE_AGENT_MASTER_KEY=sua_chave_hex_64_caracteres

# Firebase config (já existe)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

# Debug (opcional)
VITE_VT_DEBUG=1
```

### 2. Variáveis de Ambiente (Scripts/Backend)

Para executar `npm run inject-agents`:

```bash
# Chave mestra para criptografia (back)
AGENT_MASTER_KEY=mesma_chave_hex_64_caracteres

# Service Account do Firebase
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

**⚠️ IMPORTANTE**: `VITE_AGENT_MASTER_KEY` e `AGENT_MASTER_KEY` devem ter o MESMO valor!

### 3. Gerar Chave Mestra

Se você ainda não tem uma chave:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Isso gera uma chave de 64 caracteres hexadecimais.

---

## 🚀 Passo a Passo

### Etapa 1: Injetar Prompts no Firestore

```bash
# Instalar dependências do script
cd scripts
npm install
cd ..

# Executar injeção (certifique-se de ter as ENVs corretas)
npm run inject-agents
```

**Saída esperada:**
```
✅ Sophia Fênix injetada com sucesso!
✅ Sophia Universal injetada com sucesso!
🚀 Prompts injetados com sucesso.
```

### Etapa 2: Verificar no Firestore

Acesse Firebase Console → Firestore:

```
📂 agent_templates/
  ├── sophia-fenix/
  │   ├── name: "Sophia Fênix"
  │   ├── description: "..."
  │   ├── prompt_enc: "abc123...:def456...:..." (texto GRANDE criptografado)
  │   ├── active: true
  │   └── version: 1
  │
  └── sophia-universal/
      └── (mesma estrutura)
```

**✅ Checklist:**
- [ ] Documentos existem
- [ ] Campo `prompt_enc` está preenchido (texto longo)
- [ ] Campo `active` = true

---

## 🧪 Cenários de Teste

### Cenário 1: ✅ Tudo Configurado Corretamente

**Setup:**
- ✅ `.env` com `VITE_AGENT_MASTER_KEY` correto
- ✅ Firestore com docs `sophia-fenix` e `sophia-universal`
- ✅ Chaves OpenAI e YouTube configuradas no Admin

**Teste:**
1. Login como usuário comum
2. Ir para "Criar Oferta"
3. Colar comentários do YouTube
4. Selecionar "Sophia Fênix"
5. Clicar em "Gerar Oferta"

**Resultado Esperado:**
```
Console:
  [AGENTS] fetching template: sophia-fenix
  [AGENTS] decrypting template with WebCrypto (AES-256-GCM)...
  [AGENTS] decrypt OK (chars=3500+)
  [OPENAI] systemPrompt chars=3500+
  [OPENAI] Calling OpenAI API...
  [OPENAI] Response status=200
  [OPENAI] JSON parsed successfully
  [OPENAI] Complete offer structure detected

UI:
  ✅ Toast: "Oferta completa gerada com sucesso!"
  📋 Oferta exibida com:
    - Título emocional
    - Subtítulo
    - Bullets com benefícios
    - CTA forte
    - Bônus
```

---

### Cenário 2: ❌ Agente Não Encontrada

**Setup:**
1. Renomear doc `sophia-fenix` no Firestore para `sophia-fenix-OLD`
2. Tentar gerar oferta

**Resultado Esperado:**

**Admin vê:**
```
❌ Toast: "Agente não encontrada no Firestore. Execute: npm run inject-agents"

Console:
  [AGENTS] fetching template: sophia-fenix
  [AGENTS][ERR] AGENT_NOT_FOUND: Document does not exist
  [AIChat][ERR] Error { code: 'AGENT_NOT_FOUND', ... }
```

**Usuário comum vê:**
```
⚠️ Toast: "Sistema em configuração. Tente novamente em alguns minutos."
```

**✅ Correção:**
```bash
npm run inject-agents
```

---

### Cenário 3: ❌ Chave Mestra Inválida

**Setup:**
1. Alterar `.env` → `VITE_AGENT_MASTER_KEY=chave_errada_123`
2. Rebuild front: `npm run build`
3. Tentar gerar oferta

**Resultado Esperado:**

**Admin vê:**
```
❌ Toast: "Chave mestre inválida ou ausente. Verifique VITE_AGENT_MASTER_KEY e faça redeploy."

Console:
  [AGENTS] fetching template: sophia-fenix
  [AGENTS] decrypting template with WebCrypto (AES-256-GCM)...
  [AGENTS][ERR] AGENT_KEY_INVALID: Missing or invalid VITE_AGENT_MASTER_KEY
```

**Usuário comum vê:**
```
⚠️ Toast: "Configuração pendente. Aguarde alguns instantes."
```

**✅ Correção:**
1. Corrigir `.env` com chave correta
2. Rebuild: `npm run build`
3. Redeploy

---

### Cenário 4: ❌ Chave OpenAI Ausente

**Setup:**
1. Remover chave OpenAI do painel Admin
2. Tentar gerar oferta

**Resultado Esperado:**
```
❌ Toast: "Chave da API do OpenAI não configurada no painel administrativo"

Console:
  [OPENAI] Starting offer generation...
  [OPENAI][ERR] Fatal error: Chave da API do OpenAI não configurada
```

**✅ Correção:**
1. Admin → API Keys
2. Adicionar chave OpenAI (começa com `sk-`)

---

## 🔍 Logs de Debug

### Ativar Debug Completo

Adicione ao `.env`:
```bash
VITE_VT_DEBUG=1
```

Rebuild e você verá logs extras:
```
[OPENAI][DEBUG] Full response structure: ["microOfertas", "top3Ofertas", ...]
[OPENAI][DEBUG] Raw content: { ... }
```

### Logs Obrigatórios (Sempre Presentes)

```
[AGENTS] fetching template: <agentId>
[AGENTS] decrypting template with WebCrypto (AES-256-GCM)...
[AGENTS] decrypt OK (chars=<len>)
[OPENAI] systemPrompt chars=<len>
[OPENAI] Calling OpenAI API...
[OPENAI] Response status=<code>
[OPENAI] JSON parsed successfully
[AIChat] Offer generated successfully
```

---

## ✅ Checklist Final

Antes de considerar completo, verifique:

- [ ] Nenhum prompt hardcoded/simplificado no código
- [ ] Ofertas contêm TODOS os campos:
  - [ ] microOfertas (10 itens)
  - [ ] top3Ofertas (3 itens)
  - [ ] ofertaCampea (completa)
  - [ ] ebookCapitulos (20+)
  - [ ] quiz15Perguntas (15)
  - [ ] orderBumps (3)
  - [ ] paginaVendas17Blocos (17)
- [ ] Erros têm mensagens claras para admin
- [ ] Erros têm mensagens amigáveis para usuário
- [ ] Console mostra logs `[AGENTS]` e `[OPENAI]`
- [ ] Nenhum crash silencioso

---

## 🆘 Troubleshooting

### "Failed to decrypt prompt"

**Causa:** Chave `VITE_AGENT_MASTER_KEY` diferente da usada na injeção.

**Solução:**
1. Garantir que `.env` tem a MESMA chave
2. Rebuild: `npm run build`

### "Agent template not found"

**Causa:** Docs não foram injetados no Firestore.

**Solução:**
```bash
npm run inject-agents
```

### "OpenAI API Error: Invalid API key"

**Causa:** Chave OpenAI inválida.

**Solução:**
1. Gerar nova chave em: https://platform.openai.com/api-keys
2. Adicionar no Admin → API Keys

### Ofertas ainda saem genéricas

**Causa:** Cache do browser ou build antigo.

**Solução:**
1. Hard refresh: `Ctrl+Shift+R` (ou `Cmd+Shift+R` no Mac)
2. Limpar cache do navegador
3. Rebuild: `npm run build && npm run dev`
4. Verificar console: deve mostrar `chars=3000+` no systemPrompt

---

## 📞 Suporte

Se após seguir todos os passos ainda tiver problemas:

1. Abra console (F12)
2. Tente gerar oferta
3. Copie TODOS os logs que começam com `[AGENTS]` e `[OPENAI]`
4. Compartilhe para análise

**Lembre-se:** O sistema NÃO usa mais fallback. Se algo falhar, é porque falta configuração!
