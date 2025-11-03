# ✅ Checklist de Deploy - Agentes Camuflados

Use este checklist antes de fazer deploy em produção.

## 🔧 Pré-Deploy

### 1. Dependências

- [ ] `npm install` executado no root
- [ ] `cd functions && npm install` executado
- [ ] Todas as dependências instaladas sem erros

### 2. Configuração Firebase

- [ ] Projeto Firebase criado
- [ ] Firebase CLI instalado: `npm install -g firebase-tools`
- [ ] Login feito: `firebase login`
- [ ] Projeto selecionado: `firebase use --add`

### 3. Variáveis de Ambiente

- [ ] Chave mestra gerada (64 caracteres hex)
- [ ] Chave salva em local SEGURO (gerenciador de senhas)
- [ ] Firebase Functions Config:
  ```bash
  firebase functions:config:set agent.master_key="..."
  firebase functions:config:set openai.api_key="sk-proj-..."
  ```
- [ ] Verificar: `firebase functions:config:get`
- [ ] `.env` local criado (se necessário para dev)
- [ ] `.env` NÃO está no git (verificar .gitignore)

### 4. Firestore

- [ ] Banco de dados criado (Firestore)
- [ ] Localização selecionada (ex: us-central1)
- [ ] Regras de segurança revisadas
- [ ] Índices configurados

### 5. Inicialização

- [ ] Templates inicializados:
  ```bash
  cd functions
  AGENT_MASTER_KEY="..." node scripts/initializeTemplates.js
  ```
- [ ] Templates visíveis no Firestore: `agent_templates`
- [ ] Auditoria registrada: `agent_audit_logs`

## 🚀 Deploy

### 1. Functions

```bash
# Deploy
firebase deploy --only functions

# Verificar logs
firebase functions:log --only agents
```

- [ ] Deploy bem-sucedido
- [ ] URL da function anotada
- [ ] Health check OK: `curl https://URL/health`

### 2. Firestore Rules

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

- [ ] Rules deployadas
- [ ] Índices criados
- [ ] Regras testadas (tentar acesso não autorizado)

### 3. Frontend

```bash
# Build
npm run build

# Deploy
firebase deploy --only hosting
```

- [ ] Build sem erros
- [ ] Deploy bem-sucedido
- [ ] Site acessível

## 🧪 Testes Pós-Deploy

### 1. Health Check

```bash
curl https://us-central1-SEU_PROJECT.cloudfunctions.net/agents/health
# Esperado: {"status":"ok","service":"viralticket-agents","timestamp":...}
```

- [ ] Health check respondendo
- [ ] Timestamp correto

### 2. Autenticação

- [ ] Login funciona
- [ ] Token gerado
- [ ] Middleware valida token

### 3. Execução de Agente

- [ ] Frontend exibe AgentRunner
- [ ] Input aceito
- [ ] Loading state funciona
- [ ] Resultado exibido corretamente
- [ ] Prompt NÃO aparece em nenhum lugar

### 4. Admin

- [ ] Painel Admin acessível
- [ ] Lista de templates carrega
- [ ] Criar novo template funciona
- [ ] Editar template funciona
- [ ] Histórico exibe logs
- [ ] Prompt fica mascarado no formulário

### 5. Segurança

- [ ] Prompts NÃO visíveis no Network tab
- [ ] Prompts NÃO no código fonte da página
- [ ] Apenas resultado retornado na API
- [ ] Rate limiting funciona (testar múltiplas requests)
- [ ] Non-admin não acessa rotas admin

### 6. Firestore

- [ ] `agent_templates` tem dados criptografados
- [ ] `agent_runs` registra execuções
- [ ] `agent_outputs` salva resultados
- [ ] `agent_audit_logs` registra ações admin

## 🔒 Segurança Final

### Verificações

- [ ] `AGENT_MASTER_KEY` NÃO está no código
- [ ] `AGENT_MASTER_KEY` NÃO está no git
- [ ] Chave salva em 2 locais seguros diferentes
- [ ] Equipe sabe onde encontrar chave
- [ ] Plano de rotação de chave documentado
- [ ] Firestore Rules protegem collections
- [ ] Auditoria habilitada e funcionando

### Access Control

- [ ] Apenas admins editam templates
- [ ] Users só veem próprios runs
- [ ] Roles configurados no Firestore
- [ ] Middleware valida roles

## 📊 Monitoramento

### Configurar Alertas

- [ ] Firebase Alerts habilitado
- [ ] Alerta: Falha em Cloud Function
- [ ] Alerta: Rate limit excedido
- [ ] Alerta: Erro de autenticação repetido
- [ ] Email/Slack configurado para alertas

### Logs

- [ ] Logs das functions acessíveis
- [ ] Firestore audit logs monitorados
- [ ] Sistema de busca em logs configurado

## 📝 Documentação

- [ ] AGENT_SECURITY_GUIDE.md revisado
- [ ] AGENT_QUICKSTART.md revisado
- [ ] Equipe treinada em rotação de chaves
- [ ] Procedimentos de emergência documentados
- [ ] URLs e credenciais compartilhadas de forma segura

## 🎯 Métricas

### KPIs para Acompanhar

- [ ] Taxa de sucesso das execuções
- [ ] Tempo médio de resposta
- [ ] Tokens consumidos por mês
- [ ] Taxa de erro
- [ ] Rate limits atingidos
- [ ] Tentativas de acesso não autorizado

## 🆘 Plano B

### Se algo der errado

- [ ] Backup do Firestore habilitado
- [ ] Chave antiga guardada (para rollback)
- [ ] Processo de rollback documentado
- [ ] Contato de suporte Firebase anotado
- [ ] Canais de comunicação da equipe definidos

## ✅ Sign-Off

Antes de marcar como concluído:

**Data**: _______________  
**Deploy por**: _______________  
**Revisado por**: _______________  
**Aprovado por**: _______________

**Observações**:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

---

## 🎉 Deploy Concluído!

Se todos os itens estão marcados:
- ✅ Sistema está seguro
- ✅ Agentes protegidos e funcionais
- ✅ Monitoramento ativo
- ✅ Equipe treinada

**Próximos passos:**
1. Comunicar à equipe que sistema está no ar
2. Monitorar primeiras 24h ativamente
3. Agendar primeira rotação de chaves (90 dias)
4. Coletar feedback dos usuários
5. Otimizar baseado em métricas

**Documentação de referência:**
- 📖 AGENT_SECURITY_GUIDE.md
- 🚀 AGENT_QUICKSTART.md
- 🔄 functions/scripts/rotateKeys.js
