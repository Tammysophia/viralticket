# ✅ CHECKLIST DEPLOY - Correção Firestore

## 🎯 Problemas Corrigidos Neste Deploy

1. ✅ `createOfferFromAI is not defined` → Import adicionado
2. ✅ Permission denied ao ler prompts → Coleção renomeada para `agent_templates`
3. ✅ Permission denied ao salvar offers → Regras corrigidas
4. ✅ Prompt hardcoded curto → Logs e validação de tamanho
5. ✅ Script de injeção de prompts criado

---

## 📋 PASSOS OBRIGATÓRIOS APÓS DEPLOY

### 1. Atualizar Regras do Firestore (CRÍTICO!)

```bash
URL: https://console.firebase.google.com/project/studio-6502227051-763bf/firestore/rules
```

**Copiar e colar o conteúdo do arquivo `firestore.rules`**

Regras críticas a verificar:
```javascript
// ✅ Esta regra DEVE existir
match /agent_templates/{agentId} {
  allow read: if request.auth != null;  // TODOS podem ler
  allow write: if request.auth.token.email == 'tamara14@gmail.com';
}

// ✅ Esta regra DEVE permitir create
match /offers/{offerId} {
  allow create: if request.auth != null && 
    request.resource.data.userId == request.auth.uid;
  // ... resto
}
```

Clicar em **"Publicar"** e aguardar confirmação.

---

### 2. Injetar Prompts Reais no Firestore

**OPÇÃO A: Via Interface Admin (Recomendado)**

1. Login como `tamara14@gmail.com`
2. Ir em `/admin`
3. Scroll até "Gerenciamento de Prompts de IA"
4. Clicar em **"🔄 Inicializar Prompts no Firestore"**
5. Aguardar toast de sucesso
6. Clicar em **"🔍 Verificar Status dos Prompts"**
7. Confirmar que mostra:
   ```
   🔥 Sophia Fênix ✅ Carregado
   Carregado: 6817 chars (ou similar)
   
   🌟 Sofia Universal ✅ Carregado
   Carregado: 5234 chars (ou similar)
   ```

**OPÇÃO B: Via Script Node.js**

1. Editar `scripts/injectAgents.js`
2. Colar os prompts REAIS da Sophia e Sofia
3. Executar:
   ```bash
   node scripts/injectAgents.js
   ```

⚠️ **IMPORTANTE:** Os prompts MVP no código tem ~200-300 chars. 
Os prompts REAIS devem ter 3500+ chars cada um!

---

### 3. Verificar Estrutura no Firestore Console

```
Firebase Console → Firestore Database → Data
```

Deve existir:
```
agent_templates/
├── sophia/
│   ├── agentId: "sophia"
│   ├── content: "..." (3500+ chars)
│   ├── charCount: 3547 (ou similar)
│   ├── active: true
│   └── updatedAt: (timestamp)
│
└── sofia/
    ├── agentId: "sofia"  
    ├── content: "..." (3500+ chars)
    ├── charCount: 3234 (ou similar)
    ├── active: true
    └── updatedAt: (timestamp)
```

Se `agent_templates` não existir ou estiver vazio, executar passo 2.

---

### 4. Testar Fluxo Completo

#### Teste 1: Carregamento de Prompt

1. Login como usuário NORMAL (não admin)
2. Ir em "AI Chat"
3. Abrir DevTools (F12) → Console
4. Gerar uma oferta qualquer
5. **Verificar logs:**

✅ **Esperado:**
```javascript
[AGENTS][SUCCESS] Prompt carregado do Firestore para sophia (3547 chars)
[AGENTS][DEBUG] Agent: sophia, systemPrompt chars=3547
```

❌ **Se aparecer isso, FALHOU:**
```javascript
[AGENTS][WARN] Firestore error, using MVP hardcoded prompt
[AGENTS][WARN] Prompt muito curto (234 chars), esperado 3500+
```

**Se falhou:** Voltar ao passo 1 (regras) e passo 2 (prompts)

#### Teste 2: Salvamento de Oferta

1. Ainda na geração de oferta
2. **Verificar logs:**

✅ **Esperado:**
```javascript
VT: Oferta salva automaticamente: [algum-id]
// Toast aparece: "📝 Oferta salva no Kanban!"
```

❌ **Se aparecer isso, FALHOU:**
```javascript
VT: Erro ao salvar oferta: FirebaseError: Missing or insufficient permissions
Firestore save failed, using localStorage
```

**Se falhou:** Voltar ao passo 1 (verificar regra de `offers`)

#### Teste 3: Resposta da IA

1. Verificar se a oferta gerada tem todos os campos:

✅ **Esperado:**
```javascript
{
  title: "🔥 Título impactante com emoji...",
  subtitle: "Subtítulo persuasivo...",
  bullets: [
    "✅ Primeiro bullet...",
    "✅ Segundo bullet...",
    "✅ Terceiro bullet...",
    "✅ Quarto bullet..."
  ],
  cta: "🚀 CTA com urgência...",
  bonus: "🎁 BÔNUS: Descrição do bônus..."
}
```

❌ **Se algum campo estiver faltando ou vazio, investigar prompt**

---

## 🔍 Como Debugar Problemas

### Problema: Permission Denied ao ler prompts

```javascript
// Console mostra:
[AGENTS][WARN] Firestore error: Missing or insufficient permissions
```

**Diagnóstico:**
1. Ir em Firebase Console → Firestore → Rules
2. Procurar por `match /agent_templates/{agentId}`
3. Verificar se tem: `allow read: if request.auth != null;`

**Se não tiver ou estiver diferente:**
- Copiar `firestore.rules` novamente
- Publicar
- Aguardar 1-2 minutos
- Testar novamente

---

### Problema: Permission Denied ao salvar offers

```javascript
// Console mostra:
VT: Erro ao salvar oferta: FirebaseError: Missing or insufficient permissions
```

**Diagnóstico:**
1. Verificar se usuário está autenticado (tem `user.id`)
2. Ir em Firebase Console → Firestore → Rules
3. Procurar por `match /offers/{offerId}`
4. Verificar se tem: `allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;`

**Solução:**
- Copiar `firestore.rules` novamente
- Publicar
- Limpar cache do navegador (Ctrl+Shift+Del)
- Fazer logout e login novamente
- Testar novamente

---

### Problema: Prompt muito curto (MVP hardcoded)

```javascript
// Console mostra:
[AGENTS][DEBUG] systemPrompt chars=234
[AGENTS][WARN] Prompt muito curto (234 chars), esperado 3500+
```

**Diagnóstico:**
1. Ir em Firebase Console → Firestore → Data
2. Verificar se existe coleção `agent_templates`
3. Verificar se tem documentos `sophia` e `sofia`
4. Verificar campo `charCount` de cada um

**Se não existir ou charCount < 3000:**
- Executar passo 2 (Injetar prompts)
- Usar prompts REAIS (não MVP)
- Verificar se tem 3500+ chars antes de salvar

---

### Problema: Oferta não aparece no Kanban

**Diagnóstico:**
1. Verificar se oferta foi salva com sucesso (log no console)
2. Ir em Kanban e recarregar
3. Verificar se filtro de status está correto

**Solução:**
- Ofertas novas aparecem na coluna "Em Execução"
- Se não aparecer, verificar em Firebase Console → Firestore → offers
- Verificar se o `userId` da oferta é igual ao `user.id` do usuário logado

---

## 📊 Resumo dos Arquivos Modificados

| Arquivo | O Que Foi Alterado |
|---------|-------------------|
| `src/components/AIChat.jsx` | ✅ Import `createOfferFromAI` adicionado |
| `src/services/promptsService.js` | ✅ Coleção `prompts` → `agent_templates` |
| `src/services/openaiService.js` | ✅ Logs detalhados de tamanho do prompt |
| `src/components/AdminOverview.jsx` | ✅ UI atualizada para `agent_templates` |
| `firestore.rules` | ✅ Permissões corrigidas |
| `scripts/injectAgents.js` | ✅ Script criado |

---

## ✅ Checklist Final

Antes de considerar o deploy completo, verificar:

- [ ] Código atualizado deployado com sucesso
- [ ] Regras do Firestore publicadas (passo 1)
- [ ] Prompts injetados no Firestore (passo 2)
- [ ] Verificado no Firebase Console que `agent_templates` existe
- [ ] Teste 1 passou: Log mostra `systemPrompt chars=3500+`
- [ ] Teste 2 passou: Oferta salva sem erro de permissão
- [ ] Teste 3 passou: Resposta da IA completa com todos os campos
- [ ] Oferta aparece no Kanban após geração

---

## 🚨 AVISOS IMPORTANTES

⚠️ **NÃO pular o passo 1** - Sem as regras corretas, NADA funcionará

⚠️ **NÃO usar prompts MVP** - Eles são curtos (200-300 chars) e foram feitos apenas para fallback

⚠️ **Prompts REAIS devem ter 3500+ chars** - Caso contrário a IA não gera ofertas de qualidade

⚠️ **Aguardar 1-2 minutos** após publicar regras para propagação

⚠️ **Fazer logout/login** se mudar regras com sessão ativa

---

**Criado em:** 28/10/2025  
**Branch:** `cursor/fix-firestore-prompt-permission-error-bb54`  
**Documentação completa:** `CORREÇÃO_CRÍTICA_FIRESTORE.md`
