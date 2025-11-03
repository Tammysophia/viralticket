# 📚 Índice de Documentação - ViralTicket

## 🔒 Agentes Camuflados (NOVO)

### Documentação Principal

1. **[AGENT_IMPLEMENTATION_SUMMARY.md](./AGENT_IMPLEMENTATION_SUMMARY.md)** ⭐
   - Resumo executivo da implementação
   - Status completo
   - Arquivos criados/modificados
   - Arquitetura e endpoints
   - **COMECE AQUI para entender o que foi feito**

2. **[AGENT_QUICKSTART.md](./AGENT_QUICKSTART.md)** 🚀
   - Setup rápido em 5 minutos
   - Comandos essenciais
   - Como usar no código
   - Rotação de chaves
   - **COMECE AQUI para implementar**

3. **[AGENT_SECURITY_GUIDE.md](./AGENT_SECURITY_GUIDE.md)** 🔐
   - Guia completo de segurança
   - Detalhes da criptografia AES-256-GCM
   - Arquitetura detalhada
   - Troubleshooting
   - Boas práticas
   - **REFERÊNCIA COMPLETA**

4. **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** ✅
   - Checklist passo-a-passo
   - Pré-deploy, deploy, pós-deploy
   - Testes de segurança
   - Monitoramento
   - **USE ANTES DE FAZER DEPLOY**

### Arquivos de Configuração

- **[.env.example](./.env.example)** - Template de variáveis de ambiente
- **[firebase.json](./firebase.json)** - Configuração Firebase
- **[firestore.rules](./firestore.rules)** - Regras de segurança
- **[firestore.indexes.json](./firestore.indexes.json)** - Índices do banco

### Scripts

- **[functions/scripts/initializeTemplates.js](./functions/scripts/initializeTemplates.js)**
  - Inicializa templates padrão (Sophia Fênix e Sophia Universal)
  - Gera chave mestra se necessário
  
- **[functions/scripts/rotateKeys.js](./functions/scripts/rotateKeys.js)**
  - Rotação segura de chaves
  - Re-criptografa todos os templates

---

## 🚀 Deploy e Infraestrutura

1. **[DEPLOY.md](./DEPLOY.md)**
   - Guia geral de deploy
   
2. **[DEPLOY_STATUS.md](./DEPLOY_STATUS.md)**
   - Status atual do deploy
   
3. **[VERIFY_DEPLOY.md](./VERIFY_DEPLOY.md)**
   - Verificação pós-deploy

4. **[VERCEL_ENV_SETUP.md](./VERCEL_ENV_SETUP.md)**
   - Setup de ambiente Vercel

---

## 🔧 Implementação e Técnico

1. **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)**
   - Resumo geral da implementação do projeto
   
2. **[TECHNICAL.md](./TECHNICAL.md)**
   - Detalhes técnicos do projeto
   
3. **[API_INTEGRATION.md](./API_INTEGRATION.md)**
   - Integração com APIs externas

---

## 🔥 Firebase

1. **[FIREBASE_AUTH.md](./FIREBASE_AUTH.md)**
   - Autenticação Firebase
   
2. **[firestore.rules](./firestore.rules)** ⭐ NOVO
   - Regras de segurança incluindo proteção de agentes
   
3. **[firestore.indexes.json](./firestore.indexes.json)** ⭐ NOVO
   - Índices para queries otimizadas

---

## 🆘 Troubleshooting

1. **[FIX_BLUE_SCREEN.md](./FIX_BLUE_SCREEN.md)**
   - Correção de tela azul
   
2. **[URGENT_FIX_BLANK_SCREEN.md](./URGENT_FIX_BLANK_SCREEN.md)**
   - Correção de tela em branco

---

## 📖 Guias Rápidos

1. **[QUICK_START.md](./QUICK_START.md)**
   - Quick start geral do projeto
   
2. **[README.md](./README.md)**
   - README principal

---

## 🎯 Fluxo de Trabalho Recomendado

### Para Desenvolvedores Novos

1. Ler **README.md** - Visão geral do projeto
2. Ler **QUICK_START.md** - Setup básico
3. Ler **AGENT_IMPLEMENTATION_SUMMARY.md** - Entender agentes
4. Seguir **AGENT_QUICKSTART.md** - Implementar agentes

### Para Deploy em Produção

1. Revisar **AGENT_SECURITY_GUIDE.md** - Entender segurança
2. Seguir **AGENT_QUICKSTART.md** (seção Setup)
3. Usar **DEPLOYMENT_CHECKLIST.md** - Checklist completo
4. Executar **VERIFY_DEPLOY.md** - Validar deploy

### Para Manutenção de Segurança

1. **AGENT_SECURITY_GUIDE.md** > Rotação de Chaves
2. Executar **functions/scripts/rotateKeys.js**
3. Atualizar variáveis de ambiente
4. Testar execução de agentes

### Para Troubleshooting

1. **AGENT_SECURITY_GUIDE.md** > Troubleshooting
2. Verificar logs: `firebase functions:log`
3. Revisar **DEPLOYMENT_CHECKLIST.md** > Problemas Comuns

---

## 📂 Estrutura de Arquivos (Backend)

```
functions/
├── package.json                    - Dependências
├── index.js                        - Entry point (Express + routes)
├── utils/
│   └── encryption.js              - AES-256-GCM utils
├── services/
│   ├── agentTemplateService.js    - CRUD de templates
│   └── agentRunService.js         - Execução de agentes
├── middleware/
│   └── auth.js                    - Auth + rate limiting
└── scripts/
    ├── initializeTemplates.js     - Setup inicial
    └── rotateKeys.js              - Rotação de chaves
```

## 📂 Estrutura de Arquivos (Frontend)

```
src/
├── services/
│   ├── agentsService.js           - Client da API (seguro)
│   └── openaiService.js           - Legacy (deprecated)
└── components/
    ├── AgentRunner.jsx            - UI para executar agentes
    └── AdminAgentTemplates.jsx    - Admin UI para templates
```

---

## 🔑 Variáveis de Ambiente Críticas

```bash
# Chave mestra (64 caracteres hex)
AGENT_MASTER_KEY=...

# OpenAI API
OPENAI_API_KEY=sk-proj-...

# Firebase (frontend)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FUNCTIONS_URL=https://...
```

**⚠️ NUNCA commitar essas chaves!**

---

## 🎓 Aprendizado e Referências

### Segurança
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [AES-GCM (Node.js)](https://nodejs.org/api/crypto.html)

### Firebase
- [Cloud Functions Docs](https://firebase.google.com/docs/functions)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

### OpenAI
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Best Practices](https://platform.openai.com/docs/guides/production-best-practices)

---

## 📞 Contatos e Suporte

**Segurança**: security@viralticket.com  
**Suporte Técnico**: dev@viralticket.com  
**Vulnerabilidades**: security-report@viralticket.com

---

## 🔄 Histórico de Atualizações

### v1.0 (2025-10-27)
- ✅ Implementação completa de Agentes Camuflados
- ✅ Criptografia AES-256-GCM
- ✅ Backend com Cloud Functions
- ✅ Frontend com componentes React
- ✅ Documentação completa
- ✅ Scripts de manutenção

---

## ✨ Próximas Atualizações Planejadas

- [ ] Cache de resultados similares
- [ ] A/B testing de prompts
- [ ] Dashboard de métricas
- [ ] Webhooks para integrações
- [ ] Multi-idioma nos agentes

---

**Última atualização**: 2025-10-27  
**Versão**: 1.0  
**Mantido por**: Equipe ViralTicket
