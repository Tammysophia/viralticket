# 🔄 Cloud Function - Reset de Limites Diários

## ✅ O que foi criado:

**Arquivo:** `functions/index.js`

**Função:** `resetDailyLimits`
- Roda **automaticamente** todo dia às **00:00** (meia-noite de Brasília)
- Reseta `dailyUsage.offers` e `dailyUsage.urls` para 0
- Atualiza `ultimoReset` com a data atual
- **NÃO altera** `limiteDiario` nem outros campos
- Usa **batches** para escalar (500 usuários por batch)

---

## 📦 Como fazer deploy:

### 1️⃣ Instalar Firebase CLI (se ainda não tiver):
```bash
npm install -g firebase-tools
firebase login
```

### 2️⃣ Inicializar Functions no projeto:
```bash
cd /workspace
firebase init functions
# Escolher: Use an existing project
# Escolher: JavaScript
# Instalar dependências: Yes
```

### 3️⃣ Fazer deploy da função:
```bash
cd /workspace/functions
npm install
cd ..
firebase deploy --only functions
```

### 4️⃣ Verificar no Console Firebase:
- Acesse: https://console.firebase.google.com
- Vá em: **Functions** → Veja `resetDailyLimits`
- Logs: **Functions** → **Logs** para ver execuções

---

## 🧪 Como testar manualmente:

### Opção 1: Testar via HTTP (função de teste incluída):
```bash
curl -X POST \
  https://southamerica-east1-[SEU-PROJECT-ID].cloudfunctions.net/testResetDailyLimits \
  -H "Authorization: Bearer [SEU-TOKEN]"
```

### Opção 2: Disparar manualmente no console:
1. Acesse: https://console.firebase.google.com
2. Functions → `resetDailyLimits` → **Executar**

---

## 📊 Logs e Monitoramento:

A função registra no console:
- ✅ Quantos usuários foram encontrados
- ✅ Quantos precisavam de reset
- ✅ Quantos foram atualizados com sucesso
- ✅ Quantos erros ocorreram

**Exemplo de log:**
```
🔄 VT: Iniciando reset de limites diários...
📊 VT: Encontrados 1234 usuários
✅ VT: Usuário abc123 será resetado (último reset: 2025-11-10)
📦 VT: Executando 3 batch(es) com 1234 atualizações...
✅ VT: Batch 1/3 executado com sucesso
🎉 VT: Reset concluído! 1234 usuários atualizados, 0 erros
```

---

## ⚙️ Configuração:

**Horário:** 00:00 (meia-noite) - Horário de Brasília  
**Região:** southamerica-east1 (São Paulo)  
**Cron:** `0 0 * * *` (todo dia à meia-noite)  

**Campos resetados:**
- `dailyUsage.offers` → 0
- `dailyUsage.urls` → 0
- `ultimoReset` → data atual (YYYY-MM-DD)

**Campos preservados:**
- `limiteDiario` (NÃO alterado)
- `plan` (NÃO alterado)
- Todos os outros campos permanecem intactos

---

## 🚨 Importante:

- ✅ Função é **idempotente** (pode rodar várias vezes sem problema)
- ✅ Usa **batches** para performance (até 500 usuários por batch)
- ✅ **NÃO altera** layout, cores, UI ou lógica de IA
- ✅ Registra todos os passos no console do Firebase
- ✅ Segura para rodar com milhares de usuários

---

## 🎯 Pronto para usar!

Após o deploy, a função vai rodar **automaticamente** todo dia à meia-noite.
Os usuários terão seus limites diários resetados sem precisar fazer nada! 🚀
