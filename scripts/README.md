# 🤖 Sistema de Injeção de Agentes IA

## 📋 Visão Geral

Sistema seguro para armazenar prompts das agentes Sophia Fênix e Sophia Universal no Firestore com criptografia AES-256-GCM.

---

## 🔒 Segurança

- **Criptografia**: AES-256-GCM
- **Chave**: 256 bits (64 caracteres hex)
- **Armazenamento**: Firestore collection `agent_templates`
- **Descriptografia**: Runtime apenas quando necessário

---

## 🚀 Como Usar

### 1. Configurar Variáveis de Ambiente

```bash
# Gerar chave master (64 caracteres hex)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Adicionar ao .env
AGENT_MASTER_KEY=sua_chave_de_64_caracteres_hex
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
```

### 2. Instalar Dependências do Script

```bash
cd scripts
npm install
cd ..
```

### 3. Injetar Prompts no Firestore

```bash
npm run inject-agents
```

**Saída esperada:**
```
✅ Injetado: Sophia Fênix
✅ Injetado: Sophia Universal
🚀 Prompts injetados com sucesso.
```

---

## 📁 Estrutura no Firestore

### Collection: `agent_templates`

```javascript
// Documento: sophia-fenix
{
  name: "Sophia Fênix",
  description: "Transforma dores emocionais reais em ofertas low-ticket completas em até 48h.",
  prompt_enc: "iv:tag:encrypted_text",
  active: true,
  version: 1,
  updatedAt: Timestamp
}

// Documento: sophia-universal
{
  name: "Sophia Universal",
  description: "Cria ofertas virais em qualquer nicho, com mecanismos únicos e nomes chicletes.",
  prompt_enc: "iv:tag:encrypted_text",
  active: true,
  version: 1,
  updatedAt: Timestamp
}
```

---

## 🔄 Fluxo de Funcionamento

```
1. Admin executa: npm run inject-agents
   ↓
2. Script lê prompts de AGENTS array
   ↓
3. Criptografa com AES-256-GCM
   ↓
4. Salva no Firestore (agent_templates)
   ↓
5. Usuário gera oferta no dashboard
   ↓
6. Frontend busca prompt_enc do Firestore
   ↓
7. Descriptografa em runtime
   ↓
8. Concatena com input do usuário
   ↓
9. Envia para OpenAI GPT-4
   ↓
10. Retorna oferta gerada
```

---

## 🛠️ Arquivos do Sistema

```
scripts/
├── injectAgents.js        # Script de injeção
├── package.json           # Dependências (firebase-admin)
└── README.md             # Esta documentação

src/services/
├── agentService.js        # Busca e descriptografa prompts
└── openaiService.js       # Gera ofertas com GPT-4
```

---

## ⚠️ Importante

1. **NUNCA commitar** chaves reais no código
2. **SEMPRE usar** variáveis de ambiente
3. **Prompts são secretos** - não expor no frontend
4. **Descriptografia** ocorre apenas em runtime
5. **Backup** dos prompts originais em local seguro

---

## 🧪 Teste de Funcionamento

### 1. Verificar se prompts foram injetados

```javascript
// No Firebase Console
// Firestore → agent_templates
// Verificar documentos: sophia-fenix, sophia-universal
```

### 2. Testar geração de oferta

```javascript
// No Dashboard
// 1. Cole texto de exemplo
// 2. Selecione agente (Sophia Fênix ou Sofia Universal)
// 3. Clique em "Gerar"
// 4. Verifique logs no console (F12):
//    🤖 VT: Gerando oferta com agente: sophia-fenix
//    🔍 VT: Buscando prompt da agente: sophia-fenix
//    🔓 VT: Descriptografando prompt da agente sophia-fenix...
//    ✅ VT: Prompt da agente sophia-fenix descriptografado com sucesso
```

---

## 🔧 Troubleshooting

### Erro: "AGENT_MASTER_KEY não configurada"
**Solução**: Adicionar variável de ambiente no .env

### Erro: "Agente não encontrada no Firestore"
**Solução**: Executar `npm run inject-agents`

### Erro: "Falha ao descriptografar"
**Solução**: Verificar se AGENT_MASTER_KEY é a mesma usada na criptografia

### Erro: "Prompt vazio ou null"
**Solução**: Verificar se prompts foram colados corretamente em AGENTS array

---

## 📊 Logs de Debug

O sistema emite logs detalhados:

| Emoji | Significado |
|-------|-------------|
| 🤖 | Operação da agente |
| 🔍 | Busca no Firestore |
| 🔓 | Descriptografia |
| ✅ | Sucesso |
| ❌ | Erro |
| ⚠️ | Aviso/Fallback |

---

## 🎯 Próximos Passos

1. ✅ Injetar prompts no Firestore
2. ✅ Testar geração de ofertas
3. ⏳ Implementar cache de prompts (opcional)
4. ⏳ Criar painel admin para editar prompts (futuro)
5. ⏳ Adicionar versionamento de prompts (futuro)

---

✅ **Sistema pronto para uso!**
