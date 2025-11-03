# 🚀 Quick Start - Agentes Camuflados

## ⚡ Setup Rápido (5 minutos)

### 1. Instalar Dependências

```bash
# Root (frontend)
npm install

# Cloud Functions
cd functions
npm install
cd ..
```

### 2. Configurar Variáveis de Ambiente

```bash
# Gerar chave mestra
cd functions
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copie o resultado (64 caracteres)

# Configurar no Firebase
firebase functions:config:set \
  agent.master_key="COLE_A_CHAVE_AQUI" \
  openai.api_key="sk-proj-SEU_KEY_OPENAI"

# Verificar
firebase functions:config:get
```

### 3. Inicializar Templates

```bash
# Criar templates padrão (Sophia Fênix e Sophia Universal)
cd functions
AGENT_MASTER_KEY="SUA_CHAVE" node scripts/initializeTemplates.js
cd ..
```

### 4. Deploy

```bash
# Deploy Cloud Functions
firebase deploy --only functions

# Deploy Firestore Rules
firebase deploy --only firestore:rules,firestore:indexes

# Deploy Frontend (opcional)
npm run build
firebase deploy --only hosting
```

### 5. Testar

```bash
# Abrir aplicação
npm run dev

# Ou acessar deploy
# https://SEU_PROJECT.web.app
```

## 📍 URLs Importantes

**Frontend:**
- Local: http://localhost:5173
- Produção: https://SEU_PROJECT.web.app

**Cloud Functions:**
- Local: http://localhost:5001/SEU_PROJECT/us-central1/agents
- Produção: https://us-central1-SEU_PROJECT.cloudfunctions.net/agents

## 🎯 Usar Agentes no Código

### Frontend

```javascript
import { runAgent } from './services/agentsService';

// Executar Sophia Fênix
const result = await runAgent(
  'sophia-fenix', 
  'Comentários sobre emagrecimento...',
  { offerId: 'offer123' }
);

console.log(result.result.title);
console.log(result.result.blocks);
```

### Componente

```jsx
import AgentRunner from './components/AgentRunner';

function MyPage() {
  return (
    <AgentRunner 
      agentId="sophia-fenix"
      agentName="Sophia Fênix"
      onComplete={(result, runId) => {
        console.log('Oferta gerada!', result);
      }}
    />
  );
}
```

## 🔧 Admin

### Acessar Painel

```jsx
import AdminAgentTemplates from './components/AdminAgentTemplates';

// Em Admin.jsx
<Tabs>
  <Tab label="Templates IA">
    <AdminAgentTemplates />
  </Tab>
</Tabs>
```

### Criar Novo Template

1. Acessar painel admin
2. Clicar em "Novo Template"
3. Preencher:
   - ID: `meu-agente`
   - Nome: Meu Agente
   - Descrição: Descrição do agente
   - Prompt: Instruções completas
   - Motivo: Criação inicial
4. Salvar (será criptografado automaticamente)

## 🔄 Rotação de Chaves

**A cada 90 dias ou quando necessário:**

```bash
cd functions
node scripts/rotateKeys.js

# Seguir instruções:
# 1. Digitar chave antiga
# 2. Nova chave será gerada
# 3. SALVAR nova chave
# 4. Confirmar operação

# Atualizar ambiente
firebase functions:config:set agent.master_key="NOVA_CHAVE"
firebase deploy --only functions
```

## 📊 Monitoramento

```bash
# Logs em tempo real
firebase functions:log --only agents

# Audito ria (Firestore Console)
# Collection: agent_audit_logs

# Runs (Firestore Console)
# Collection: agent_runs
```

## 🆘 Problemas Comuns

### "AGENT_MASTER_KEY não configurada"

```bash
firebase functions:config:set agent.master_key="SUA_CHAVE_64_CHARS"
firebase deploy --only functions
```

### "Erro ao executar agente"

1. Verificar se template existe: Firestore > `agent_templates`
2. Verificar se está ativo: `active: true`
3. Verificar logs: `firebase functions:log`

### "Token inválido"

```bash
# Re-autenticar
firebase login --reauth
```

## 📚 Documentação Completa

Veja `AGENT_SECURITY_GUIDE.md` para:
- Arquitetura detalhada
- Segurança e criptografia
- Troubleshooting avançado
- Boas práticas

## ✅ Checklist Pós-Deploy

- [ ] Templates inicializados
- [ ] Cloud Function respondendo
- [ ] Frontend consegue executar agentes
- [ ] Admin consegue editar templates
- [ ] Auditoria registrando ações
- [ ] Rate limiting funcionando
- [ ] Chave mestra salva em local seguro

---

**Pronto! Seus agentes estão protegidos e funcionando! 🎉**
