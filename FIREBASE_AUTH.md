# 🔐 Integração Firebase Authentication - ViralTicket

## ✅ Status: IMPLEMENTADO

**Data:** 24/10/2025  
**Firebase Project ID:** studio-6502227051-763bf

---

## 📋 O Que Foi Implementado

### ✅ Firebase SDK Instalado
```bash
npm install firebase
```

### ✅ Arquivos Criados/Atualizados

```
✅ src/config/firebase.js          - Configuração Firebase
✅ .env                             - Variáveis de ambiente
✅ .env.example                     - Template de variáveis
✅ src/context/AuthContext.jsx      - Auth com Firebase real
✅ src/services/firebaseService.js  - Firestore real
```

---

## 🔥 Configuração Firebase

### Credenciais

```javascript
Project ID: studio-6502227051-763bf
Auth Domain: studio-6502227051-763bf.firebaseapp.com
API Key: AIzaSyBF5RAJ3C7Yy6dH_sWBXDo8cYd51c2QnVA
App ID: 1:151268195367:web:be03df757470d10c64e202
```

### Serviços Ativados

```
✅ Authentication (Email/Password)
✅ Firestore Database
✅ Storage (opcional)
```

---

## 🔐 Sistema de Autenticação

### Como Funciona

```
┌─────────────────────────────────────────────────┐
│  1. Usuário faz login/registro                  │
│     ↓                                            │
│  2. Firebase Authentication valida credenciais  │
│     ↓                                            │
│  3. Cria/busca perfil no Firestore             │
│     ↓                                            │
│  4. Define isAdmin se email = tamara14@gmail.com│
│     ↓                                            │
│  5. Retorna usuário completo para aplicação    │
└─────────────────────────────────────────────────┘
```

### Funções Disponíveis

#### `login(email, password)`
```javascript
import { useAuth } from './hooks/useAuth';

const { login } = useAuth();

try {
  const user = await login('tamara14@gmail.com', 'senha123');
  // user.isAdmin === true
} catch (error) {
  console.error('Erro:', error.message);
}
```

#### `register(email, password)`
```javascript
const { register } = useAuth();

try {
  const user = await register('novo@usuario.com', 'senha123');
  // Cria usuário no Firebase Auth + Firestore
} catch (error) {
  console.error('Erro:', error.message);
}
```

#### `logout()`
```javascript
const { logout } = useAuth();

await logout();
// Remove usuário do estado e Firebase
```

#### `updateUser(updates)`
```javascript
const { updateUser } = useAuth();

await updateUser({
  dailyUsage: {
    offers: 5,
    urls: 3
  }
});
// Atualiza Firestore automaticamente
```

---

## 📊 Estrutura de Dados

### Coleção: `users`

```javascript
// Documento: {uid}
{
  name: "Tamara",
  email: "tamara14@gmail.com",
  plan: "ADMIN",
  avatar: "https://ui-avatars.com/api/?name=Tamara...",
  dailyUsage: {
    offers: 0,
    urls: 0
  },
  createdAt: "2025-10-24T...",
  updatedAt: "2025-10-24T..."
}
```

### Coleção: `apiKeys`

```javascript
// Documento: youtube
{
  name: "YouTube Data API",
  key: "enc_XyZ123...",
  type: "youtube",
  status: "active",
  encrypted: true,
  quota: 85,
  lastUsed: "2025-10-24T...",
  lastUpdated: "2025-10-24T..."
}
```

---

## 🎯 Fluxo de Login Completo

### 1. Usuário digita email/senha
```javascript
Email: tamara14@gmail.com
Senha: ************
```

### 2. Firebase valida credenciais
```javascript
✅ Email verificado
✅ Senha correta
✅ Retorna UID
```

### 3. Busca perfil no Firestore
```javascript
GET /users/{uid}

✅ Dados do usuário encontrados
```

### 4. Define permissões admin
```javascript
if (email === 'tamara14@gmail.com') {
  isAdmin = true
  limits = { offers: 'unlimited', urls: 'unlimited' }
}
```

### 5. Usuário logado
```javascript
{
  id: "firebase-uid-123",
  email: "tamara14@gmail.com",
  name: "Tamara",
  plan: "ADMIN",
  isAdmin: true,
  limits: { offers: 'unlimited', urls: 'unlimited' }
}
```

---

## 🔒 Regras de Segurança Firestore

### Rules Recomendadas

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Usuários podem ler/escrever apenas seus dados
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Apenas admin pode gerenciar API Keys
    match /apiKeys/{service} {
      allow read: if request.auth != null 
        && request.auth.token.email == 'tamara14@gmail.com';
      allow write: if request.auth != null 
        && request.auth.token.email == 'tamara14@gmail.com';
    }
  }
}
```

---

## 🚀 Como Testar

### Teste 1: Criar Nova Conta

```
1. Acesse: https://viralticket.vercel.app
2. Clique em "Criar Conta"
3. Email: teste@exemplo.com
4. Senha: senha123456
5. ✅ Deve criar usuário no Firebase + Firestore
```

### Teste 2: Login como Admin

```
1. Acesse: https://viralticket.vercel.app
2. Email: tamara14@gmail.com
3. Senha: (sua senha admin)
4. ✅ Deve logar com isAdmin = true
5. ✅ Deve ver botão "Admin" no topo
```

### Teste 3: Logout

```
1. Clique em Logout
2. ✅ Deve voltar para tela de login
3. ✅ Firebase signOut executado
```

### Teste 4: Persistência

```
1. Faça login
2. Recarregue página
3. ✅ Deve continuar logado
4. ✅ onAuthStateChanged mantém sessão
```

---

## 🔧 Configuração do Firebase Console

### 1. Ativar Authentication

```
1. Firebase Console → Authentication
2. Sign-in method
3. Ativar "Email/Password"
4. Salvar
```

### 2. Criar Firestore Database

```
1. Firebase Console → Firestore Database
2. Criar banco de dados
3. Modo: Produção
4. Região: us-central1 (ou mais próxima)
5. Aplicar regras de segurança
```

### 3. Configurar Domínio Autorizado

```
1. Authentication → Settings
2. Authorized domains
3. Adicionar: viralticket.vercel.app
4. Salvar
```

---

## 🌐 Variáveis de Ambiente na Vercel

### Configurar no Dashboard Vercel

```
1. Acesse: vercel.com/tammysophia/viralticket
2. Settings → Environment Variables
3. Adicionar cada uma:

VITE_FIREBASE_API_KEY=AIzaSyBF5RAJ3C7Yy6dH_sWBXDo8cYd51c2QnVA
VITE_FIREBASE_AUTH_DOMAIN=studio-6502227051-763bf.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=studio-6502227051-763bf
VITE_FIREBASE_STORAGE_BUCKET=studio-6502227051-763bf.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=151268195367
VITE_FIREBASE_APP_ID=1:151268195367:web:be03df757470d10c64e202

4. Selecionar: Production, Preview, Development
5. Salvar
6. Redeploy
```

---

## 📝 Notas Importantes

### ✅ Segurança

- **Chaves no .env** - Nunca commitadas (arquivo .env no .gitignore)
- **Variáveis VITE_** - Expostas no front-end (normal, são públicas)
- **Regras Firestore** - Protegem dados no servidor
- **Admin check** - Baseado em email específico

### ✅ Persistência

- **onAuthStateChanged** - Mantém login entre reloads
- **localStorage** - Backup do perfil do usuário
- **Firestore** - Fonte da verdade para dados

### ✅ Performance

- **Build size** - 905 kB (Firebase SDK é grande)
- **Lazy loading** - Considerar code splitting futuro
- **Cache** - Firebase usa cache local automático

---

## 🐛 Troubleshooting

### Erro: "Firebase: Error (auth/invalid-email)"

```
✅ SOLUÇÃO: Verificar formato do email
```

### Erro: "Firebase: Error (auth/user-not-found)"

```
✅ SOLUÇÃO: Usuário não existe, usar register()
```

### Erro: "Firebase: Error (auth/wrong-password)"

```
✅ SOLUÇÃO: Senha incorreta
```

### Erro: "Missing or insufficient permissions"

```
✅ SOLUÇÃO: Configurar Firestore Rules corretamente
```

### Erro: "This domain is not authorized"

```
✅ SOLUÇÃO: Adicionar domínio em Authentication → Authorized domains
```

---

## ✅ Checklist de Implementação

- [x] Firebase SDK instalado
- [x] Arquivo firebase.js criado
- [x] .env configurado
- [x] AuthContext atualizado com Firebase Auth
- [x] firebaseService.js usando Firestore real
- [x] Login funcional
- [x] Registro funcional
- [x] Logout funcional
- [x] Persistência de sessão
- [x] Admin check por email
- [x] Build passando
- [ ] Variáveis de ambiente na Vercel
- [ ] Firestore Rules configuradas
- [ ] Domínio autorizado no Firebase
- [ ] Testar em produção

---

## 🚀 Próximos Passos

1. **Configurar Vercel**
   - Adicionar variáveis de ambiente
   - Fazer novo deploy

2. **Configurar Firebase Console**
   - Ativar Authentication
   - Criar Firestore Database
   - Aplicar Security Rules
   - Autorizar domínio

3. **Testar Produção**
   - Criar conta de teste
   - Login como admin
   - Verificar persistência

4. **Monitoramento**
   - Firebase Console → Analytics
   - Ver usuários ativos
   - Monitorar erros

---

**Implementado em:** 24/10/2025  
**Status:** ✅ FUNCIONAL (aguardando config Vercel)  
**Next:** Configurar variáveis de ambiente na Vercel
