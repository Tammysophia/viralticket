# ⚙️ Configurar Variáveis de Ambiente na Vercel

## 🎯 Passo a Passo Visual

### 📝 Variáveis para Adicionar

```bash
VITE_FIREBASE_API_KEY=AIzaSyBF5RAJ3C7Yy6dH_sWBXDo8cYd51c2QnVA
VITE_FIREBASE_AUTH_DOMAIN=studio-6502227051-763bf.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=studio-6502227051-763bf
VITE_FIREBASE_STORAGE_BUCKET=studio-6502227051-763bf.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=151268195367
VITE_FIREBASE_APP_ID=1:151268195367:web:be03df757470d10c64e202
```

---

## 🔧 Instruções Detalhadas

### Passo 1: Acessar Dashboard Vercel

```
1. Abrir navegador
2. Ir para: https://vercel.com
3. Fazer login
4. Clicar em "ViralTicket"
```

### Passo 2: Ir para Settings

```
1. No projeto ViralTicket
2. Clicar na aba "Settings" (topo)
3. Menu lateral → "Environment Variables"
```

### Passo 3: Adicionar Variável 1

```
Name:  VITE_FIREBASE_API_KEY
Value: AIzaSyBF5RAJ3C7Yy6dH_sWBXDo8cYd51c2QnVA

Environments:
☑ Production
☑ Preview  
☑ Development

[Add] ← Clicar aqui
```

### Passo 4: Adicionar Variável 2

```
Name:  VITE_FIREBASE_AUTH_DOMAIN
Value: studio-6502227051-763bf.firebaseapp.com

Environments:
☑ Production
☑ Preview
☑ Development

[Add]
```

### Passo 5: Adicionar Variável 3

```
Name:  VITE_FIREBASE_PROJECT_ID
Value: studio-6502227051-763bf

Environments:
☑ Production
☑ Preview
☑ Development

[Add]
```

### Passo 6: Adicionar Variável 4

```
Name:  VITE_FIREBASE_STORAGE_BUCKET
Value: studio-6502227051-763bf.firebasestorage.app

Environments:
☑ Production
☑ Preview
☑ Development

[Add]
```

### Passo 7: Adicionar Variável 5

```
Name:  VITE_FIREBASE_MESSAGING_SENDER_ID
Value: 151268195367

Environments:
☑ Production
☑ Preview
☑ Development

[Add]
```

### Passo 8: Adicionar Variável 6

```
Name:  VITE_FIREBASE_APP_ID
Value: 1:151268195367:web:be03df757470d10c64e202

Environments:
☑ Production
☑ Preview
☑ Development

[Add]
```

### Passo 9: Redeploy

```
1. Voltar para aba "Deployments"
2. Clicar no deployment mais recente
3. Menu (três pontos) → "Redeploy"
4. Confirmar
5. Aguardar build (2-3 min)
```

---

## ✅ Verificação

Após adicionar TODAS as 6 variáveis, você deve ver:

```
Environment Variables (6)

VITE_FIREBASE_API_KEY            AIzaSy... [Production] [Preview] [Development]
VITE_FIREBASE_AUTH_DOMAIN        studio... [Production] [Preview] [Development]
VITE_FIREBASE_PROJECT_ID         studio... [Production] [Preview] [Development]
VITE_FIREBASE_STORAGE_BUCKET     studio... [Production] [Preview] [Development]
VITE_FIREBASE_MESSAGING_SENDER_ID 15126... [Production] [Preview] [Development]
VITE_FIREBASE_APP_ID             1:151... [Production] [Preview] [Development]
```

---

## 🔍 Como Copiar/Colar Facilmente

### Método Rápido:

1. **Abrir este arquivo**
2. **Copiar cada linha** (Name e Value)
3. **Colar na Vercel**
4. **Repetir 6 vezes**

### Template de Cópia:

```
┌──────────────────────────────────────────────────────┐
│ 1. VITE_FIREBASE_API_KEY                             │
│    AIzaSyBF5RAJ3C7Yy6dH_sWBXDo8cYd51c2QnVA           │
├──────────────────────────────────────────────────────┤
│ 2. VITE_FIREBASE_AUTH_DOMAIN                         │
│    studio-6502227051-763bf.firebaseapp.com           │
├──────────────────────────────────────────────────────┤
│ 3. VITE_FIREBASE_PROJECT_ID                          │
│    studio-6502227051-763bf                           │
├──────────────────────────────────────────────────────┤
│ 4. VITE_FIREBASE_STORAGE_BUCKET                      │
│    studio-6502227051-763bf.firebasestorage.app       │
├──────────────────────────────────────────────────────┤
│ 5. VITE_FIREBASE_MESSAGING_SENDER_ID                 │
│    151268195367                                      │
├──────────────────────────────────────────────────────┤
│ 6. VITE_FIREBASE_APP_ID                              │
│    1:151268195367:web:be03df757470d10c64e202         │
└──────────────────────────────────────────────────────┘
```

---

## 🚨 Importante

### ⚠️ CUIDADO:

- **Não adicionar espaços** antes/depois dos valores
- **Não adicionar aspas** nos valores
- **Marcar todas as 3 checkboxes** (Production, Preview, Development)
- **Clicar "Add"** após cada variável

### ✅ Certo:

```
Value: AIzaSyBF5RAJ3C7Yy6dH_sWBXDo8cYd51c2QnVA
```

### ❌ Errado:

```
Value: "AIzaSyBF5RAJ3C7Yy6dH_sWBXDo8cYd51c2QnVA"
Value:  AIzaSyBF5RAJ3C7Yy6dH_sWBXDo8cYd51c2QnVA 
```

---

## 📊 Checklist

- [ ] Acessei vercel.com/tammysophia/viralticket
- [ ] Fui em Settings → Environment Variables
- [ ] Adicionei VITE_FIREBASE_API_KEY
- [ ] Adicionei VITE_FIREBASE_AUTH_DOMAIN
- [ ] Adicionei VITE_FIREBASE_PROJECT_ID
- [ ] Adicionei VITE_FIREBASE_STORAGE_BUCKET
- [ ] Adicionei VITE_FIREBASE_MESSAGING_SENDER_ID
- [ ] Adicionei VITE_FIREBASE_APP_ID
- [ ] Marquei todas 3 checkboxes em cada uma
- [ ] Fiz Redeploy do projeto
- [ ] Aguardei 2-3 minutos
- [ ] Testei a aplicação

---

## 🎯 Resultado Esperado

Após configurar e fazer redeploy:

✅ Site carrega normalmente  
✅ Login funciona  
✅ Registro funciona  
✅ Firebase Authentication ativo  
✅ Dados salvos no Firestore  
✅ Sem erros no console  

---

**Tempo estimado:** 5-10 minutos  
**Dificuldade:** Fácil  
**Obrigatório:** SIM
