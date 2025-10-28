# 🔥 CONFIGURAR FIRESTORE - Resolver "Missing or insufficient permissions"

## ✅ SITUAÇÃO ATUAL:

**BOA NOTÍCIA:** O sistema está funcionando! 
- ✅ Prompt carregando: **6817 chars** (COMPLETO!)
- ✅ Fallback MVP funcionando perfeitamente
- ⚠️ Firestore dando erro de permissão (esperado)

**Você tem 2 opções:**

---

## 🚀 OPÇÃO 1: CONTINUAR COM MVP (RECOMENDADO AGORA)

**Status:** ✅ **JÁ FUNCIONA!**

O fallback hardcoded está:
- ✅ Carregando prompt completo (6817 chars)
- ✅ Gerando ofertas detalhadas
- ✅ Sem necessidade de Firestore

**Nada a fazer!** Continue usando assim.

**Quando migrar para produção:** Use Opção 2 abaixo.

---

## 🔧 OPÇÃO 2: CONFIGURAR FIRESTORE (PRODUÇÃO)

### Passo 1: Atualizar Regras do Firestore

1. Acesse: https://console.firebase.google.com/
2. Selecione projeto: **studio-6502227051-763bf**
3. Menu lateral → **Firestore Database**
4. Aba **"Rules"** (Regras)
5. **SUBSTITUIR** todo o conteúdo por isto:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // TEMPLATES DE AGENTES - LEITURA PÚBLICA
    match /agent_templates/{agentId} {
      allow read: if true;  // Qualquer um pode ler
      allow write: if false; // Ninguém escreve (só scripts)
    }
    
    // API KEYS - Apenas autenticados
    match /api_keys/{keyId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // USERS - Próprios dados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // OFFERS - Próprias ofertas
    match /offers/{offerId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Bloquear resto
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

6. Clicar **"Publish"** (Publicar)

### Passo 2: Injetar Prompts no Firestore

Agora que as regras permitem leitura, você pode injetar:

1. **Baixar Service Account:**
   - Firebase Console → ⚙️ Settings → Service Accounts
   - **"Generate new private key"**
   - Baixar JSON

2. **Configurar variáveis:**

Edite `.env` (ou adicione no Vercel):
```bash
# Já tem estas:
VITE_AGENT_MASTER_KEY=ccdcb0de4c801f9a53b9d3223aacf1f40d823fe062a36259209f150123f7c7c4

# ADICIONAR ESTAS (para scripts):
AGENT_MASTER_KEY=ccdcb0de4c801f9a53b9d3223aacf1f40d823fe062a36259209f150123f7c7c4
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

3. **Executar injeção:**
```bash
npm run inject-agents
```

**Saída esperada:**
```
✅ Injetado: Sophia Fênix
✅ Injetado: Sophia Universal
🚀 Prompts injetados com sucesso.
```

4. **Verificar no Firestore:**
   - Firebase Console → Firestore
   - Deve ver coleção `agent_templates`
   - Com docs: `sophia-fenix` e `sophia-universal`

5. **Testar:**
   - Gerar oferta no app
   - Console deve mostrar:
   ```
   [AGENTS] ✅ Firestore prompt loaded successfully
   📍 FONTE: Firestore descriptografado
   ```

---

## 📊 COMPARAÇÃO:

| Feature | MVP (atual) | Firestore |
|---------|-------------|-----------|
| **Funciona?** | ✅ SIM | ✅ SIM |
| **Prompt completo?** | ✅ 6817 chars | ✅ 6817 chars |
| **Segurança** | ⚠️ Código visível | ✅ Criptografado |
| **Atualização** | Redeploy | Sem redeploy |
| **Setup** | ✅ Zero | Precisa configurar |

---

## 🎯 RECOMENDAÇÃO:

### **AGORA:** Use MVP (opção 1)
- Já está funcionando
- Prompt completo (6817 chars)
- Zero configuração adicional

### **DEPOIS:** Migre para Firestore (opção 2)
- Quando tiver tempo
- Para maior segurança
- Para facilitar atualizações

---

## 🆘 TROUBLESHOOTING:

### "Missing or insufficient permissions"
**CAUSA:** Regras do Firestore bloqueando
**SOLUÇÃO:** Seguir Passo 1 acima (atualizar regras)

### "Agent template not found"
**CAUSA:** Prompts não foram injetados
**SOLUÇÃO:** Seguir Passo 2 acima (injetar prompts)

### "Failed to decrypt"
**CAUSA:** Chave mestra diferente
**SOLUÇÃO:** Mesma chave em `AGENT_MASTER_KEY` e `VITE_AGENT_MASTER_KEY`

---

## ✅ CONCLUSÃO:

**Você TEM 2 sistemas funcionais:**

1. ✅ **MVP (atual):** Hardcoded, 6817 chars, funciona perfeitamente
2. ✅ **Firestore (opcional):** Criptografado, mais seguro, precisa configurar

**Escolha:**
- **Precisa AGORA?** → Use MVP (já funciona!)
- **Tem 10 minutos?** → Configure Firestore (mais seguro)

**Ambos geram ofertas COMPLETAS!** 🚀
