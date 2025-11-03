# 🔐 Guia de Implementação das Regras de Segurança do Firebase

## 📋 Índice
1. [Regras do Firestore Database](#firestore-database-rules)
2. [Regras do Firebase Storage](#firebase-storage-rules)
3. [Como Aplicar no Console do Firebase](#como-aplicar)
4. [Estrutura de Dados](#estrutura-de-dados)
5. [Testando as Regras](#testando-as-regras)

---

## 🗄️ Firestore Database Rules

### Passo 1: Acessar o Console do Firebase

1. Vá para [console.firebase.google.com](https://console.firebase.google.com)
2. Selecione seu projeto: **studio-6502227051-763bf**
3. No menu lateral, clique em **"Firestore Database"**
4. Clique na aba **"Regras"** (Rules)

### Passo 2: Copiar e Colar as Regras

Copie **TODO** o conteúdo do arquivo `firestore.rules` e cole no editor de regras.

### Resumo das Regras do Firestore:

```
✅ users/{userId}
   - Leitura: Próprio usuário ou admin
   - Criação: Durante registro (userId = auth.uid)
   - Atualização: Próprio usuário (não pode mudar isAdmin/plan)
   - Deleção: Próprio usuário ou admin

✅ apiKeys/{service}
   - Acesso: APENAS ADMIN
   - Protege chaves sensíveis (YouTube, OpenAI)

✅ offers/{offerId}
   - Leitura: Dono da oferta ou admin
   - Criação: Usuário autenticado (com validações)
   - Atualização: Dono ou admin
   - Deleção: Dono ou admin

✅ webhooks/{webhookId}
   - Acesso: APENAS ADMIN

❌ Qualquer outra coleção: BLOQUEADA
```

### Passo 3: Publicar

Clique no botão **"Publicar"** (Publish) no canto superior direito.

---

## 📦 Firebase Storage Rules

### Passo 1: Acessar Storage Rules

1. No menu lateral do Firebase Console, clique em **"Storage"**
2. Clique na aba **"Regras"** (Rules)

### Passo 2: Copiar e Colar as Regras

Copie **TODO** o conteúdo do arquivo `storage.rules` e cole no editor de regras.

### Resumo das Regras do Storage:

```
✅ users/{userId}/offers/{offerId}/{fileName}
   - Upload: Apenas o usuário dono
   - Tipos: Imagem, vídeo, PDF, texto
   - Tamanho máximo: 100MB
   - Acesso: Dono ou admin

✅ users/{userId}/avatar/{fileName}
   - Upload: Apenas o usuário dono
   - Tipos: Apenas imagens
   - Tamanho máximo: 5MB
   - Visualização: Qualquer usuário autenticado

✅ admin/{allPaths}
   - Acesso: APENAS ADMIN
   - Sem limite de tamanho/tipo

❌ Qualquer outro caminho: BLOQUEADO
```

### Passo 3: Publicar

Clique no botão **"Publicar"** (Publish).

---

## 🚀 Como Aplicar no Console do Firebase

### Método Rápido (Recomendado)

1. **Firestore Database Rules:**
   ```
   Console Firebase → Firestore Database → Regras → Colar conteúdo de firestore.rules → Publicar
   ```

2. **Storage Rules:**
   ```
   Console Firebase → Storage → Regras → Colar conteúdo de storage.rules → Publicar
   ```

### Verificação de Sintaxe

Antes de publicar, o Firebase valida automaticamente a sintaxe das regras. Se houver erros:
- ❌ Linha vermelha = erro de sintaxe
- ⚠️ Linha amarela = aviso (pode publicar)
- ✅ Sem marcações = pronto para publicar

---

## 📊 Estrutura de Dados

### Coleção: `users/{userId}`
```javascript
{
  email: "user@example.com",
  name: "Nome do Usuário",
  plan: "FREE" | "BRONZE" | "PRATA" | "OURO",
  isAdmin: false,
  createdAt: Timestamp,
  limits: {
    offers: 5,
    videos: 10,
    comments: 100
  },
  dailyUsage: {
    offers: 0,
    videos: 0,
    comments: 0
  },
  avatar: "https://..."
}
```

### Coleção: `apiKeys/{service}`
```javascript
{
  service: "openai" | "youtube",
  key: "sk-...",
  name: "Minha Chave OpenAI",
  status: "active" | "inactive",
  lastUpdated: Timestamp,
  type: "openai" | "youtube"
}
```

### Coleção: `offers/{offerId}`
```javascript
{
  userId: "uid123",
  title: "Minha Oferta",
  status: "pendente" | "execucao" | "modelando" | "concluido",
  agent: "sophia" | "sofia",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  copy: {
    page: "Texto da página...",
    adPrimary: "Texto do anúncio principal...",
    adHeadline: "Título do anúncio",
    adDescription: "Descrição do anúncio"
  },
  modeling: {
    fanpageUrl: "https://facebook.com/...",
    salesPageUrl: "https://...",
    checkoutUrl: "https://...",
    creativesCount: 5,
    monitorStart: Timestamp | null,
    monitorDays: 7,
    trend: "up" | "down" | "stable" | null,
    modelavel: false
  },
  youtubeLinks: ["https://youtube.com/..."],
  attachments: {
    files: [
      {
        name: "arquivo.pdf",
        url: "https://storage.googleapis.com/...",
        size: 1024,
        type: "application/pdf"
      }
    ]
  }
}
```

---

## 🧪 Testando as Regras

### No Console do Firebase

1. Vá para **Firestore Database → Regras**
2. Clique em **"Simulador de Regras"** (Rules Playground)
3. Configure:
   - **Tipo:** `get`, `create`, `update`, `delete`
   - **Localização:** Ex: `/users/uid123`
   - **Usuário autenticado:** Marque e adicione UID
4. Clique em **"Executar"**

### Exemplos de Teste

#### ✅ Teste 1: Usuário lendo seus próprios dados
```
Tipo: get
Localização: /users/abc123
Autenticado como: abc123
Resultado esperado: PERMITIDO ✅
```

#### ❌ Teste 2: Usuário lendo dados de outro usuário
```
Tipo: get
Localização: /users/xyz789
Autenticado como: abc123
Resultado esperado: NEGADO ❌
```

#### ✅ Teste 3: Admin acessando chaves de API
```
Tipo: get
Localização: /apiKeys/openai
Autenticado como: admin-uid (com custom claim isAdmin: true)
Resultado esperado: PERMITIDO ✅
```

#### ❌ Teste 4: Usuário comum tentando acessar chaves de API
```
Tipo: get
Localização: /apiKeys/openai
Autenticado como: user-uid (sem admin claim)
Resultado esperado: NEGADO ❌
```

---

## 🔧 Configuração de Admin

Para tornar um usuário **admin**, você precisa definir um custom claim:

### Via Firebase CLI:
```bash
firebase auth:users:set-claims user-uid --claims '{"admin":true}'
```

### Via Firebase Admin SDK (Node.js):
```javascript
const admin = require('firebase-admin');

admin.auth().setCustomUserClaims('user-uid', { admin: true })
  .then(() => {
    console.log('✅ Usuário agora é admin');
  });
```

### No código do app:
```javascript
// Após definir custom claim, também atualizar Firestore:
await setDoc(doc(db, 'users', userId), {
  isAdmin: true
}, { merge: true });
```

---

## ⚠️ Avisos Importantes

1. **Sempre teste as regras** antes de publicar em produção
2. **Faça backup** das regras antigas antes de substituir
3. **Não exponha chaves de API** diretamente no frontend
4. **Use variáveis de ambiente** para chaves sensíveis
5. **Monitore o uso** através do Firebase Console
6. **Defina alertas** para tentativas de acesso não autorizado

---

## 📝 Checklist de Implementação

- [ ] Acessar Console Firebase
- [ ] Copiar e colar regras do Firestore
- [ ] Publicar regras do Firestore
- [ ] Testar acesso a users (sucesso)
- [ ] Testar acesso a users de outro usuário (negado)
- [ ] Copiar e colar regras do Storage
- [ ] Publicar regras do Storage
- [ ] Testar upload de arquivo (sucesso)
- [ ] Configurar pelo menos um usuário como admin
- [ ] Testar acesso admin a apiKeys (sucesso)
- [ ] Documentar UIDs dos admins
- [ ] Configurar alertas de segurança (opcional)

---

## 🆘 Resolução de Problemas

### Erro: "Missing or insufficient permissions"
**Causa:** Regras bloqueando o acesso  
**Solução:** Verificar se o usuário está autenticado e tem permissão na regra específica

### Erro: "PERMISSION_DENIED"
**Causa:** Usuário tentando acessar recurso de outro usuário  
**Solução:** Verificar se `userId` no documento == `auth.uid`

### Erro ao publicar regras
**Causa:** Erro de sintaxe nas regras  
**Solução:** Verificar a linha indicada, corrigir sintaxe e tentar novamente

### Custom claims não estão funcionando
**Causa:** Token do usuário não foi atualizado  
**Solução:** Fazer logout e login novamente para obter novo token

---

## 📚 Recursos Adicionais

- [Documentação Oficial - Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Documentação Oficial - Storage Security Rules](https://firebase.google.com/docs/storage/security)
- [Exemplos de Regras Comuns](https://firebase.google.com/docs/firestore/security/rules-conditions)
- [Testing Security Rules](https://firebase.google.com/docs/rules/unit-tests)

---

## ✅ Conclusão

Após seguir este guia:
- ✅ Firestore Database estará protegido
- ✅ Storage terá controle de acesso adequado
- ✅ Apenas admins acessarão chaves sensíveis
- ✅ Usuários só verão seus próprios dados
- ✅ Sistema estará pronto para produção

**Projeto:** studio-6502227051-763bf  
**Última atualização:** 2025-10-28
