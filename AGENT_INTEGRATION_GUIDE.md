# 🔒 Guia de Integração - Sophia Fênix & Sophia Universal

## ✅ Implementação Completa

Sistema de Agentes Camuflados totalmente integrado com os prompts reais da Tamara Dutra.

---

## 🚀 Setup Rápido (5 Passos)

### 1️⃣ Instalar Dependências

```bash
# Root (se ainda não instalou)
npm install

# Cloud Functions
cd functions
npm install
cd ..
```

### 2️⃣ Configurar Chave Mestra

```bash
# Gerar chave mestra (64 caracteres hex)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copie o resultado e configure no Firebase
firebase functions:config:set agent.master_key="COLE_A_CHAVE_AQUI"

# Verificar
firebase functions:config:get
```

### 3️⃣ Popular Agentes no Firestore

```bash
# Executar script de seed
cd functions
AGENT_MASTER_KEY="SUA_CHAVE" node scripts/seedAgents.js
cd ..
```

Esse script vai criar:
- ✅ `sophia-fenix` (Ofertas emocionais)
- ✅ `sophia-universal` (Qualquer nicho)

### 4️⃣ Deploy das Cloud Functions

```bash
# Deploy completo
firebase deploy --only functions,firestore:rules,firestore:indexes

# Ou apenas functions
firebase deploy --only functions
```

### 5️⃣ Testar no Frontend

1. Acesse https://viralticket.vercel.app/dashboard
2. Vá em "AI Chat" ou onde os agentes aparecem
3. Selecione "Sophia Fênix 🔥" ou "Sophia Universal 🌟"
4. Cole um comentário ou texto
5. Clique em "Gerar"
6. Aguarde "Sophia está gerando sua oferta..."
7. ✅ Resultado aparece com badges de segurança
8. ✅ Oferta salva automaticamente no Kanban

---

## 📊 O Que Foi Integrado

### ✅ Backend

**Cloud Functions (`functions/`)**
- ✅ `index.js` - API Express com endpoints seguros
- ✅ `utils/encryption.js` - AES-256-GCM
- ✅ `services/agentTemplateService.js` - CRUD de templates
- ✅ `services/agentRunService.js` - Execução de agentes
- ✅ `middleware/auth.js` - Autenticação + rate limiting
- ✅ `scripts/seedAgents.js` - Seed dos prompts reais ⭐

**Prompts Implementados:**
- ✅ Sophia Fênix (prompt completo da Tamara)
- ✅ Sophia Universal (prompt completo da Tamara)

### ✅ Frontend

**Components**
- ✅ `AIChat.jsx` - Atualizado para usar sistema seguro
- ✅ `AgentRunner.jsx` - Componente standalone
- ✅ `AdminAgentTemplates.jsx` - Painel admin

**Hooks**
- ✅ `useAgents.js` - Gerenciamento de agentes

**Services**
- ✅ `agentsService.js` - API client seguro

### ✅ Database

**Collections Firestore**
- ✅ `agent_templates` - Templates criptografados
- ✅ `agent_runs` - Logs de execução
- ✅ `agent_outputs` - Resultados
- ✅ `agent_audit_logs` - Auditoria

**Security Rules**
- ✅ Templates protegidos (apenas leitura metadata)
- ✅ Runs protegidos (apenas próprio usuário)
- ✅ Admin-only para edição

---

## 🎨 Ajustes Visuais Aplicados

### ✅ Badges de Segurança

```jsx
// Badge no header
<Lock className="w-3 h-3" />
IA Exclusiva

// Badge em cada agente
<Lock className="w-4 h-4 text-purple-400" />

// Notice no resultado
<Shield className="w-4 h-4" />
Resultado gerado por IA proprietária - template protegido
```

### ✅ Loading Personalizado

```
"Sophia Fênix está gerando sua oferta..."
"Sophia Universal está gerando sua oferta..."
```

### ✅ Contador de Caracteres

```
{inputText.length} / 10.000 caracteres
Mínimo 10 caracteres
```

### ✅ Removidos

- ❌ Badge "API Conectada" (conforme solicitado)
- ❌ Botão "Verificar Conexão" (usuários comuns)
- ❌ Qualquer menção a prompts ou templates

---

## 🔐 Segurança Garantida

### ✅ O Que Está Protegido

```
1. Prompts criptografados (AES-256-GCM)
2. Chave mestra em variável de ambiente
3. Processamento 100% backend
4. Frontend NUNCA vê prompts
5. Firestore Rules restritivas
6. Rate limiting ativo
7. Auditoria completa
8. Input sanitizado
```

### ❌ O Que NÃO É Possível

```
❌ Ver prompts no frontend
❌ Copiar templates do banco
❌ Acessar via Network tab
❌ Descriptografar sem chave
❌ Burlar rate limiting
❌ Editar sem ser admin
```

---

## 📤 Resultado no Frontend

### Tela de Seleção de Agentes

```
┌─────────────────────────────────────────────────────┐
│ Selecione a IA 🛡️            🔒 IA Exclusiva      │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────┐        ┌──────────────┐         │
│  │     🔥       │        │      🌟      │         │
│  │ Sophia Fênix │  🔒    │   Sophia     │  🔒     │
│  │              │        │  Universal   │         │
│  │ Especialista │        │ IA versátil  │         │
│  │ em ofertas   │        │ para todos   │         │
│  │ emocionais   │        │ os nichos    │         │
│  └──────────────┘        └──────────────┘         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Resultado Gerado

```
┌─────────────────────────────────────────────────────┐
│ ✨ Oferta Gerada              📋 Copiar           │
│ ID: abc12345...                                    │
├─────────────────────────────────────────────────────┤
│ 🛡️ Resultado gerado por IA proprietária           │
│    template protegido com criptografia             │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 🎯 [Título Impactante da Oferta]                   │
│                                                     │
│ Subtítulo persuasivo que amplifica o desejo...    │
│                                                     │
│ ┌─────────────────────────────────┐               │
│ │ HERO                            │               │
│ │ Texto do hero principal...      │               │
│ └─────────────────────────────────┘               │
│                                                     │
│ ┌─────────────────────────────────┐               │
│ │ BENEFITS                        │               │
│ │ ✅ Benefício 1                 │               │
│ │ ✅ Benefício 2                 │               │
│ │ ✅ Benefício 3                 │               │
│ └─────────────────────────────────┘               │
│                                                     │
│ ┌─────────────────────────────────┐               │
│ │ CTA                             │               │
│ │ 🚀 SIM! QUERO TRANSFORMAR        │               │
│ │    MINHA VIDA AGORA             │               │
│ │ ⏰ Últimas 10 vagas             │               │
│ └─────────────────────────────────┘               │
│                                                     │
└─────────────────────────────────────────────────────┘

✅ Oferta salva no Kanban automaticamente!
```

---

## 🎯 Integração com Kanban

### ✅ Salvamento Automático

Quando uma oferta é gerada:

1. ✅ Resultado mostrado na tela
2. ✅ Oferta criada automaticamente no Firestore (`offers`)
3. ✅ Card aparece no Kanban na coluna "Execução"
4. ✅ Vinculado ao `aiRunId` para rastreabilidade

Estrutura salva:
```javascript
{
  userId: "user123",
  title: "Título da Oferta",
  description: "Subtítulo/descrição",
  status: "execucao",
  agent: "sophia-fenix",
  aiRunId: "run_abc123",
  copy: {
    page: "Copy completa formatada",
    adHeadline: "Título",
    adDescription: "Descrição"
  },
  createdAt: Timestamp,
  youtubeLinks: []
}
```

---

## 👥 Controle Admin

### Editar Templates (apenas tamara14@gmail.com)

**Via Admin Panel:**
1. Acessar `/admin`
2. Ir em "Templates IA"
3. Ver lista de agentes (sem prompts)
4. Clicar em "Editar"
5. Prompt aparece mascarado (tipo password)
6. Botão "Mostrar/Ocultar" para ver prompt
7. Editar e salvar com motivo da mudança
8. ✅ Automaticamente criptografado e salvo

**Via Script:**
```bash
cd functions
node scripts/seedAgents.js
# Re-executa seed com novos prompts
```

### Ver Auditoria

Firestore Console → `agent_audit_logs`:
```
{
  agentId: "sophia-fenix",
  action: "update",
  userId: "tamara14@gmail.com",
  changeReason: "Ajuste no tom de voz",
  promptHash: "sha256...",
  version: 4,
  timestamp: Timestamp
}
```

---

## 🔄 Atualizar Prompts

### Método 1: Admin UI (Recomendado)

1. Login como admin
2. `/admin` → Templates IA
3. Editar template
4. Colar novo prompt
5. Adicionar motivo (ex: "Melhorias baseadas em feedback")
6. Salvar

### Método 2: Script (Mais Rápido)

1. Editar `functions/scripts/seedAgents.js`
2. Atualizar `SOPHIA_FENIX_PROMPT` ou `SOPHIA_UNIVERSAL_PROMPT`
3. Executar:
```bash
cd functions
AGENT_MASTER_KEY="..." node scripts/seedAgents.js
```

### Método 3: API (Programático)

```javascript
import { saveAgentTemplate } from './services/agentsService';

await saveAgentTemplate(
  'sophia-fenix',
  {
    name: 'Sophia Fênix',
    description: '...',
    promptPlaintext: 'Novo prompt aqui...',
    model: 'gpt-4o-mini',
    temperature: 0.75,
    max_tokens: 2500
  },
  'Motivo da atualização'
);
```

---

## 🧪 Testar Integração

### Teste 1: Seed dos Agentes

```bash
cd functions
AGENT_MASTER_KEY="SUA_CHAVE" node scripts/seedAgents.js

# Esperado:
# ✅ Sophia Fênix criado (v1)
# ✅ Sophia Universal criado (v1)
```

### Teste 2: Verificar no Firestore

Firebase Console → Firestore:
- `agent_templates/sophia-fenix`
  - ✅ `prompt_enc`: BASE64 string longa
  - ✅ `name`: "Sophia Fênix"
  - ✅ `emoji`: "🔥"
  - ❌ NÃO tem `prompt` em texto plano

### Teste 3: Executar via Frontend

1. Login no sistema
2. Dashboard → AI Chat
3. Selecionar agente
4. Colar texto:
```
Comentários:
- "Quero perder peso rápido"
- "Como emagrecer sem sofrimento?"
- "Preciso de ajuda urgente!"
```
5. Clicar "Gerar"
6. ✅ Loading: "Sophia Fênix está gerando..."
7. ✅ Resultado aparece com blocos estruturados
8. ✅ Toast: "Oferta salva no Kanban!"

### Teste 4: Verificar Segurança

**Network Tab (Chrome DevTools):**
- ❌ Prompts NÃO devem aparecer
- ✅ Apenas `runId` e `result` devem aparecer
- ✅ Headers têm `Authorization: Bearer ...`

**Console:**
```
VT: Executando agente: sophia-fenix
VT: Resultado recebido: run_abc123
VT: Oferta salva no Kanban: offer_xyz789
```

---

## 📊 Métricas de Sucesso

Após integração, você deve ver:

```
✅ Firestore: 2 agent_templates criados
✅ Prompts criptografados (não legíveis no console)
✅ Frontend exibe agentes com badges 🔒
✅ Execução gera ofertas estruturadas
✅ Kanban recebe ofertas automaticamente
✅ Rate limiting funciona (30 req/min)
✅ Auditoria registra todas as ações
✅ Nenhum erro no console
```

---

## 🆘 Troubleshooting

### "AGENT_MASTER_KEY não configurada"

```bash
firebase functions:config:set agent.master_key="SUA_CHAVE_64_CHARS"
firebase deploy --only functions
```

### "Template não encontrado"

```bash
# Re-executar seed
cd functions
AGENT_MASTER_KEY="..." node scripts/seedAgents.js
```

### "Erro ao salvar oferta no Kanban"

Verificar se `createOffer` existe:
```javascript
// src/services/offersService.js
export async function createOffer(offerData) { ... }
```

### Agentes não aparecem no frontend

1. Verificar se Cloud Function está deployada
2. Verificar URL em `.env`: `VITE_FUNCTIONS_URL`
3. Verificar auth token do usuário
4. Ver logs: `firebase functions:log`

---

## ✨ Próximos Passos

### Imediato
1. ✅ Deploy completo
2. ✅ Testar ambos os agentes
3. ✅ Validar salvamento no Kanban

### Curto Prazo
1. Coletar feedback de uso
2. Ajustar prompts baseado em resultados
3. Monitorar métricas (tokens, tempo de resposta)

### Longo Prazo
1. Adicionar novos agentes especializados
2. A/B testing de prompts
3. Dashboard de analytics

---

## 📞 Suporte

**Admin**: tamara14@gmail.com  
**Docs Completas**: Ver `DOCS_INDEX.md`  
**Security Guide**: Ver `AGENT_SECURITY_GUIDE.md`

---

**Versão**: 1.0  
**Data**: 2025-10-27  
**Status**: ✅ INTEGRAÇÃO COMPLETA

🎉 **SOPHIA FÊNIX E SOPHIA UNIVERSAL ESTÃO PRONTAS!** 🎉
