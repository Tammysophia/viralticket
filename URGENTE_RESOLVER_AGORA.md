# 🚨 URGENTE - RESOLVER AGORA (2 PASSOS)

## 📊 O que os logs mostram:

```
❌ [AGENTS][WARN] Prompt não encontrado no Firestore
❌ [AGENTS][WARN] Missing or insufficient permissions
❌ VT: Erro ao criar oferta: Missing or insufficient permissions
✅ [AGENTS][DEBUG] systemPrompt chars=14135 (mas é o MVP hardcoded, não seu prompt real)
```

---

## 🔴 PROBLEMA 1: Regras do Firestore NÃO FORAM ATUALIZADAS

### ➡️ SOLUÇÃO (5 minutos):

1. **Abra esta URL no navegador:**
   ```
   https://console.firebase.google.com/project/studio-6502227051-763bf/firestore/rules
   ```

2. **DELETE TODO o conteúdo atual**

3. **COLE EXATAMENTE ESTE CÓDIGO:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function: Verifica se é admin
    function isAdmin() {
      return request.auth != null && request.auth.token.email == 'tamara14@gmail.com';
    }
    
    // Helper function: Verifica se usuário está autenticado
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Coleção: users
    match /users/{userId} {
      allow read: if isAuthenticated() && request.auth.uid == userId;
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }
    
    // Coleção: apiKeys - TODOS podem ler (para sistema funcionar)
    match /apiKeys/{service} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Coleção: agent_templates - TODOS podem ler (para IA funcionar)
    match /agent_templates/{agentId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Coleção: offers - Usuários podem criar suas ofertas
    match /offers/{offerId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated();
      allow delete: if isAuthenticated();
    }
    
    // Coleção: webhooks
    match /webhooks/{webhookId} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }
    
    // Deny all por padrão
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

4. **Clique no botão AZUL "Publicar"**

5. **Aguarde a mensagem "Regras publicadas com sucesso"**

---

## 🔴 PROBLEMA 2: Seus Prompts NÃO ESTÃO no Firestore

### ➡️ SOLUÇÃO (10 minutos):

#### Opção A: Manual pelo Firebase Console (MAIS FÁCIL)

1. **Abra esta URL:**
   ```
   https://console.firebase.google.com/project/studio-6502227051-763bf/firestore/data
   ```

2. **Clique em "Iniciar coleção"**

3. **ID da coleção:** Digite exatamente: `agent_templates`

4. **Adicionar primeiro documento:**
   - **ID do documento:** `sophia`
   - **Campo 1:** 
     - Nome: `agentId`
     - Tipo: string
     - Valor: `sophia`
   - **Campo 2:**
     - Nome: `content`
     - Tipo: string
     - Valor: **[COLE SEU PROMPT COMPLETO DA SOPHIA AQUI - 3500+ caracteres]**
   - **Campo 3:**
     - Nome: `active`
     - Tipo: boolean
     - Valor: `true`
   - **Campo 4:**
     - Nome: `version`
     - Tipo: string
     - Valor: `2.0`
   - **Campo 5:**
     - Nome: `charCount`
     - Tipo: number
     - Valor: `3547` (ou o número de caracteres do seu prompt)
   
   Clique em **Salvar**

5. **Adicionar segundo documento:**
   - Na coleção `agent_templates`, clique em "Adicionar documento"
   - **ID do documento:** `sofia`
   - Repita os mesmos campos, mas com o prompt da SOFIA

#### Opção B: Via Interface Admin (DEPOIS de fazer Passo 1)

1. **Primeiro complete o PROBLEMA 1 acima** (atualizar regras)
2. **Edite o arquivo:** `src/utils/initializePrompts.js`
3. **Cole seu prompt REAL da Sophia** na constante `SOPHIA_PROMPT`
4. **Cole seu prompt REAL da Sofia** na constante `SOFIA_PROMPT`
5. **Faça novo deploy**
6. **Login como tamara14@gmail.com**
7. **Vá em /admin**
8. **Clique em "Inicializar Prompts no Firestore"**

---

## ✅ Como Saber que Funcionou

### Teste 1: Verificar no Firebase Console

1. Abra: `https://console.firebase.google.com/project/studio-6502227051-763bf/firestore/data`
2. Deve ver:
   ```
   agent_templates/
   ├── sophia
   │   └── content: (seu prompt longo)
   └── sofia
       └── content: (seu prompt longo)
   ```

### Teste 2: Verificar no site

1. Faça logout e login novamente
2. Vá em "AI Chat"
3. Gere uma oferta
4. Abra F12 → Console
5. Deve ver:
   ```
   ✅ [AGENTS][SUCCESS] Prompt carregado do Firestore para sophia (XXXX chars)
   ✅ VT: Oferta salva automaticamente: [id]
   ```

### Teste 3: Verificar que NÃO aparece mais:

```
❌ [AGENTS][WARN] Missing or insufficient permissions
❌ [AGENTS][WARN] Prompt não encontrado
❌ VT: Erro ao criar oferta
```

---

## 🎯 RESUMO - Faça AGORA Nesta Ordem:

1. ✅ **Atualizar regras Firestore** (Firebase Console → Rules → Copiar código acima → Publicar)
2. ✅ **Adicionar prompts no Firestore** (Firebase Console → Data → Criar agent_templates → Adicionar sophia e sofia)
3. ✅ **Testar** (Logout → Login → Gerar oferta → Ver F12)

---

## 📞 Se Ainda Não Funcionar:

Me envie screenshot de:
1. Firebase Console → Firestore → Data (mostrando a coleção agent_templates)
2. Firebase Console → Firestore → Rules (mostrando as regras publicadas)
3. Console do navegador (F12) ao gerar uma oferta

---

**SEM FAZER ESTES 2 PASSOS, NADA VAI FUNCIONAR!**

O código está correto, mas o Firebase precisa ser configurado.
