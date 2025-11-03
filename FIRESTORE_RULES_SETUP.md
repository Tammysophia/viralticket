# 🔒 Configuração de Regras do Firestore

## ⚠️ URGENTE: Atualizar Regras de Segurança

Para corrigir o erro de permissão ao carregar prompts, as regras do Firestore precisam ser atualizadas.

---

## 📋 Passo a Passo

### 1. Acessar Firebase Console

```
https://console.firebase.google.com/project/studio-6502227051-763bf/firestore/rules
```

### 2. Copiar as Novas Regras

O arquivo `firestore.rules` na raiz do projeto contém as regras atualizadas.

**Principais mudanças:**

```javascript
// Coleção: prompts
// TODOS os usuários autenticados podem LER (necessário para IA funcionar)
// Apenas admin pode ESCREVER
match /prompts/{agentId} {
  allow read: if request.auth != null;
  allow write: if request.auth.token.email == 'tamara14@gmail.com';
}
```

### 3. Publicar as Regras

No Firebase Console:
1. Vá em **Firestore Database** → **Rules**
2. Cole as regras do arquivo `firestore.rules`
3. Clique em **Publicar**

---

## 🔄 Como Funciona Agora

### Fluxo Correto de Prompts

```
┌─────────────────────────────────────────────────────────┐
│  1️⃣ Admin inicializa prompts no Firestore              │
│     - Executa initializePrompts() uma vez              │
│     - Salva SOPHIA (6817+ chars)                       │
│     - Salva SOFIA (similar)                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  2️⃣ Usuário gera oferta com IA                         │
│     - Sistema busca prompt do Firestore                │
│     - ✅ LEITURA PERMITIDA (autenticado)               │
│     - Carrega prompt completo da SOPHIA                │
│     - Injeta comentários no prompt                     │
│     - Envia para OpenAI GPT-4                          │
└─────────────────────────────────────────────────────────┘
```

### Antes (❌ Com Erro)

```
[AGENTS][WARN] Firestore error, using MVP hardcoded prompt: Missing or insufficient permissions
```

### Depois (✅ Funcionando)

```
[AGENTS][SUCCESS] Prompt carregado do Firestore para sophia (6817 chars)
```

---

## 🔐 Estrutura de Permissões

| Coleção | Leitura | Escrita | Quem |
|---------|---------|---------|------|
| `users` | ✅ Próprio usuário | ✅ Próprio usuário | Autenticado |
| `apiKeys` | ✅ Admin apenas | ✅ Admin apenas | tamara14@gmail.com |
| `prompts` | ✅ TODOS autenticados | ✅ Admin apenas | Todos / Admin |
| `offers` | ✅ Próprio usuário | ✅ Próprio usuário | Autenticado |
| `webhooks` | ✅ Admin apenas | ✅ Admin apenas | tamara14@gmail.com |

**Por que todos podem ler prompts?**
- Os prompts precisam ser acessados em runtime para gerar ofertas
- Não contêm informações sensíveis (são instruções para IA)
- Apenas admin pode modificá-los (segurança mantida)

---

## 🚀 Inicializar Prompts (Admin)

### Opção 1: Console do Navegador (Recomendado)

1. Login como admin (tamara14@gmail.com)
2. Abrir DevTools (F12)
3. Ir para aba **Console**
4. Executar:

```javascript
import { initializePrompts } from './src/utils/initializePrompts';
await initializePrompts();
```

### Opção 2: Criar Botão Temporário no Admin

Adicionar no componente `AdminOverview.jsx`:

```javascript
import { initializePrompts } from '../utils/initializePrompts';

// No componente
const [initializing, setInitializing] = useState(false);

const handleInitPrompts = async () => {
  setInitializing(true);
  try {
    const result = await initializePrompts();
    if (result.success) {
      toast.success('✅ Prompts inicializados com sucesso!');
      console.log('Detalhes:', result.details);
    } else {
      toast.error(`❌ Erro: ${result.message}`);
    }
  } finally {
    setInitializing(false);
  }
};

// No JSX
<Button 
  onClick={handleInitPrompts}
  loading={initializing}
  variant="secondary"
>
  🔄 Inicializar Prompts no Firestore
</Button>
```

### Opção 3: Script Node (Avançado)

Criar arquivo `scripts/init-prompts.js`:

```javascript
import admin from 'firebase-admin';
import serviceAccount from './serviceAccountKey.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Copiar prompts de initializePrompts.js
// Salvar no Firestore

// Executar: node scripts/init-prompts.js
```

---

## ✅ Validação

### Verificar se Prompts Existem

No console:

```javascript
import { getAllPrompts } from './src/services/promptsService';
const prompts = await getAllPrompts();
console.log('Sophia chars:', prompts.sophia?.length);
console.log('Sofia chars:', prompts.sofia?.length);
```

Resultado esperado:
```
Sophia chars: 6817
Sofia chars: 5234
```

### Testar Geração de Oferta

1. Login como usuário normal
2. Ir para "AI Chat"
3. Gerar uma oferta
4. Verificar logs no console:

```
[AGENTS][SUCCESS] Prompt carregado do Firestore para sophia (6817 chars)
```

---

## 🐛 Troubleshooting

### Erro: "Missing or insufficient permissions"

**Causa**: Regras do Firestore não atualizadas

**Solução**:
1. Verificar regras no Firebase Console
2. Garantir que `allow read: if request.auth != null;` existe na coleção `prompts`
3. Republicar regras

### Erro: "Prompt não encontrado no Firestore"

**Causa**: Prompts não foram inicializados

**Solução**:
1. Executar `initializePrompts()` como admin
2. Verificar no Firebase Console → Firestore → Collection `prompts`
3. Confirmar existência dos documentos `sophia` e `sofia`

### Ainda usando MVP hardcoded

**Causa**: Cache ou Firebase não configurado

**Solução**:
1. Limpar cache: `clearPromptsCache()`
2. Recarregar página (Ctrl+Shift+R)
3. Verificar variáveis de ambiente Firebase

---

## 📊 Estrutura no Firestore

```
firestore/
└── prompts/
    ├── sophia/
    │   ├── content: string (6817+ chars)
    │   ├── agentId: "sophia"
    │   ├── version: "2.0"
    │   ├── description: string
    │   ├── active: true
    │   ├── charCount: 6817
    │   └── updatedAt: timestamp
    │
    └── sofia/
        ├── content: string (5234+ chars)
        ├── agentId: "sofia"
        ├── version: "2.0"
        ├── description: string
        ├── active: true
        ├── charCount: 5234
        └── updatedAt: timestamp
```

---

## 🎯 Próximos Passos

1. ✅ Atualizar regras do Firestore no console
2. ✅ Inicializar prompts com `initializePrompts()`
3. ✅ Testar geração de oferta
4. ✅ Verificar logs no console
5. ✅ Confirmar que está usando prompt do Firestore (6817 chars)

---

**Implementado em:** 28/10/2025  
**Status:** ✅ PRONTO PARA DEPLOY  
**Próximo:** Publicar regras e inicializar prompts
