# 🔧 Como Resolver o Erro ao Gerar Ofertas

## ❌ Erro que Você Está Vendo

Provavelmente está vendo um destes erros:

1. **"Agent not found: sophia-fenix"**
2. **"Agent prompt missing"**
3. **"Failed to decrypt prompt"**
4. **"Firestore: Missing or insufficient permissions"**

---

## ✅ SOLUÇÃO RÁPIDA (3 Passos)

### Passo 1: Gerar Chave Master

No terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Copie o resultado** (64 caracteres, algo como: `a1b2c3d4e5f6...`)

---

### Passo 2: Criar Arquivo `.env`

Na **RAIZ DO PROJETO** (mesmo nível do `package.json`), crie o arquivo `.env`:

```env
# OBRIGATÓRIO: Chave Master para descriptografia
VITE_AGENT_MASTER_KEY=cole_aqui_a_chave_que_voce_gerou_acima

# OBRIGATÓRIO: Configuração do Firebase (pegue no Firebase Console)
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# Para o script de injeção (backend)
AGENT_MASTER_KEY=mesma_chave_do_VITE_acima
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}
```

**IMPORTANTE:** 
- `VITE_AGENT_MASTER_KEY` e `AGENT_MASTER_KEY` devem ter o **MESMO VALOR**
- Pegue as credenciais do Firebase no [Console do Firebase](https://console.firebase.google.com)

---

### Passo 3: Injetar Prompts no Firestore

```bash
# 1. Instalar dependências do script
cd scripts
npm install

# 2. Voltar para raiz
cd ..

# 3. Injetar prompts COMPLETOS
npm run inject-agents
```

**Saída esperada:**
```
✅ Injetado: Sophia Fênix
✅ Injetado: Sophia Universal
🚀 Prompts injetados com sucesso.
```

---

## 🧪 Testar Agora

1. **Recarregue a página** (Ctrl+R ou F5)
2. Vá em **IA Chat**
3. Selecione **Sophia Fênix**
4. Cole: "Me sinto sozinha e sempre escolho homens errados"
5. Clique em **"Gerar"**

**Console (F12) deve mostrar:**
```
🚀 VT: Gerando oferta sem limites!
🤖 VT: Gerando oferta com agente: sophia-fenix
🔥 VT: Buscando prompt COMPLETO (3000+ palavras) do Firestore...
🔍 VT: Buscando prompt COMPLETO da agente: sophia-fenix
🔓 VT: Descriptografando prompt COMPLETO da agente sophia-fenix...
✅ VT: Prompt COMPLETO descriptografado com sucesso! (3254 caracteres)
✅ VT: Prompt COMPLETO carregado! Gerando oferta profissional...
```

---

## 🚨 Troubleshooting

### Erro: "Cannot find module 'firebase-admin'"
```bash
cd scripts
npm install
cd ..
```

### Erro: "FIREBASE_SERVICE_ACCOUNT_KEY is not defined"
**Solução:** 
1. Vá no [Firebase Console](https://console.firebase.google.com)
2. Configurações do Projeto → Contas de Serviço
3. Clique em "Gerar nova chave privada"
4. Copie TODO o JSON e coloque no `.env`:
```env
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"...","private_key":"..."}
```

### Erro: "AGENT_MASTER_KEY is not defined"
**Solução:** Execute o passo 1 novamente e adicione a chave no `.env`

### Erro: "Failed to decrypt"
**Causa:** Chaves diferentes entre injeção e frontend  
**Solução:** Use a MESMA chave em `VITE_AGENT_MASTER_KEY` e `AGENT_MASTER_KEY`

### Erro: "Agent not found"
**Causa:** Prompts não foram injetados  
**Solução:** Execute `npm run inject-agents` novamente

---

## ✅ LIMITES REMOVIDOS

Agora o sistema é **ILIMITADO**:

- ✅ **Comentários YouTube**: ILIMITADOS (extraia quantos quiser)
- ✅ **Ofertas IA**: ILIMITADAS (gere quantas quiser)
- ✅ **Sem contadores**: Sistema não rastreia uso
- ✅ **Sem bloqueios**: Nunca vai parar por limite atingido

---

## 📊 Como Saber se Está Funcionando

### ✅ Funcionando:
- Console mostra: `✅ Prompt COMPLETO descriptografado`
- Oferta gerada tem conteúdo RICO e DETALHADO
- Não aparece mensagem de limite

### ❌ Não Funcionando:
- Console mostra: `❌ Agent not found`
- Erro ao gerar oferta
- Firestore não configurado

---

## 🎯 Resumo dos 3 Passos

```bash
# 1. Gerar chave
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 2. Criar .env (copiar chave gerada + credenciais Firebase)

# 3. Injetar prompts
cd scripts && npm install && cd ..
npm run inject-agents
```

---

## 📞 Se Continuar Dando Erro

Abra o console (F12) e me envie:
1. A mensagem de erro completa em vermelho
2. Os logs que aparecem (emojis 🔍 🔓 ❌ etc)
3. Qual passo dos 3 você completou

Assim consigo identificar exatamente o problema! 🔍

---

**Execute os 3 passos acima e teste novamente! 🚀**
