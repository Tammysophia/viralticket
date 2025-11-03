# 📜 Scripts de Administração

## 🔧 injectAgents.js

Script para injetar prompts dos agentes de IA no Firestore.

### Pré-requisitos

1. **Service Account Key do Firebase**
   ```bash
   # Baixar de: Firebase Console → Project Settings → Service Accounts
   # Salvar como: serviceAccountKey.json (raiz do projeto)
   ```

2. **Instalar dependências**
   ```bash
   npm install firebase-admin
   ```

### Como Usar

#### Opção 1: Via Script Node.js (Recomendado para setup inicial)

1. **Editar o script**
   - Abrir `scripts/injectAgents.js`
   - Colar os prompts completos da SOPHIA e SOFIA nas constantes

2. **Executar**
   ```bash
   node scripts/injectAgents.js
   ```

3. **Verificar output**
   ```
   ✅ SOPHIA salva com sucesso (3547 chars)
   ✅ SOFIA salva com sucesso (3234 chars)
   ```

#### Opção 2: Via Interface Admin (Mais fácil)

1. Login como admin (`tamara14@gmail.com`)
2. Acessar `/admin`
3. Card "Gerenciamento de Prompts de IA"
4. Clicar em **"🔄 Inicializar Prompts no Firestore"**
5. Aguardar confirmação

> **Nota:** A opção 2 usa os prompts do arquivo `src/utils/initializePrompts.js`

### Validação

Após injetar os prompts:

```bash
# 1. Verificar no Firebase Console
# Firestore → agent_templates → sophia
# Firestore → agent_templates → sofia

# 2. Verificar logs da aplicação
# Gerar uma oferta e ver no console:
[AGENTS][DEBUG] Agent: sophia, systemPrompt chars=3547
```

### Troubleshooting

**Erro: "Cannot find module 'firebase-admin'"**
```bash
npm install firebase-admin
```

**Erro: "Cannot read serviceAccountKey.json"**
```bash
# Baixar do Firebase Console
# Salvar na raiz do projeto
```

**Erro: "Missing or insufficient permissions"**
```bash
# Atualizar regras do Firestore
# Copiar firestore.rules para Firebase Console
```

### Estrutura dos Prompts no Firestore

```javascript
agent_templates/sophia
{
  agentId: "sophia",
  name: "Sophia Fênix",
  description: "Especialista em ofertas de alto impacto",
  content: "...", // Prompt completo (3500+ chars)
  prompt: "...",  // Compatibilidade
  version: "2.0",
  active: true,
  charCount: 3547,
  updatedAt: Timestamp,
  createdAt: Timestamp
}
```

### Campos Importantes

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `content` | string | Prompt principal (usado pelo sistema) |
| `prompt` | string | Compatibilidade (mesmo que content) |
| `charCount` | number | Tamanho do prompt (deve ser 3500+) |
| `active` | boolean | Se o agente está ativo |
| `version` | string | Versão do prompt |

### Logs Esperados

```
[AGENTS][SUCCESS] Prompt carregado do Firestore para sophia (3547 chars)
[AGENTS][DEBUG] Agent: sophia, systemPrompt chars=3547
```

### Logs de Erro (Fallback)

```
[AGENTS][WARN] Firestore error, using MVP hardcoded prompt: Missing or insufficient permissions
[AGENTS][WARN] Prompt muito curto (234 chars), esperado 3500+
```

---

**Última atualização:** 28/10/2025
