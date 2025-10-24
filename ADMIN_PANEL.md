# 👑 Painel Administrativo - ViralTicket

## 📋 Visão Geral

O Painel Administrativo do ViralTicket é uma interface completa e moderna para gerenciamento da plataforma, com acesso exclusivo ao administrador autenticado.

## 🔐 Acesso Administrativo

### Credenciais
- **Email Administrativo:** `tamara14@gmail.com`
- **Acesso:** Automático ao fazer login com o email cadastrado
- **Rota:** `/admin`

### Segurança
- ✅ Verificação automática de email no AuthContext
- ✅ Proteção de rota com redirecionamento
- ✅ Badge visual de identificação (Coroa 👑)
- ✅ Permissões ilimitadas de uso

## 🎨 Tema Visual

### Paleta de Cores
- **Background Principal:** `#0A0A0A`
- **Gradiente Primário:** Roxo (`#8B5CF6`) → Lilás (`#A78BFA`) → Dourado (`#FACC15`)
- **Efeitos:** Glassmorphism + Animações suaves
- **Scrollbar:** Customizada com gradiente roxo/lilás

### Design System
```css
.admin-gradient          /* Background do painel */
.admin-gradient-text     /* Texto com gradiente premium */
.gradient-admin-card     /* Cards com efeito glassmorphism */
```

## 📊 Módulos Disponíveis

### 1. 📈 Visão Geral (Overview)
**Arquivo:** `src/components/AdminOverview.jsx`

**Funcionalidades:**
- Cards de estatísticas em tempo real
- Gráfico de crescimento de usuários
- Distribuição de planos
- Atividades recentes

**Métricas Exibidas:**
- Total de usuários
- Ofertas geradas hoje
- APIs ativas
- Taxa de conversão

### 2. 👥 Usuários
**Arquivo:** `src/components/AdminUsers.jsx`

**Funcionalidades:**
- Lista completa de usuários
- Alteração de planos
- Bloqueio/desbloqueio
- Visualização de uso diário
- Status de conta

**Ações Disponíveis:**
- ✏️ Editar usuário
- 🔄 Alterar plano
- 🚫 Bloquear/desbloquear
- 📊 Ver estatísticas

### 3. ⚡ Planos
**Arquivo:** `src/components/AdminPlans.jsx`

**Funcionalidades:**
- Gerenciamento de todos os planos
- Edição de limites e preços
- Visualização de assinantes
- Cálculo de receita mensal

**Planos Disponíveis:**
- 🆓 **FREE** - Gratuito
- 🥉 **BRONZE** - R$ 29,90/mês
- 🥈 **PRATA** - R$ 49,90/mês
- 🥇 **OURO** - R$ 99,90/mês
- 👑 **ADMIN** - Acesso total

### 4. 🔑 Chaves API
**Arquivo:** `src/components/AdminAPIKeys.jsx`

**Funcionalidades:**
- Gerenciamento de chaves API
- Criptografia simulada (AES-256)
- Rotação de chaves
- Monitoramento de quota
- Mascaramento de chaves sensíveis

**APIs Suportadas:**
- YouTube Data API
- OpenAI API
- Stripe API

**Utilitário de Criptografia:**
```javascript
import { encrypt, decrypt, maskAPIKey } from '../utils/cryptoUtils';

// Criptografar chave
const encrypted = encrypt('minha-chave-secreta');

// Descriptografar chave
const decrypted = decrypt(encrypted);

// Mascarar para exibição
const masked = maskAPIKey('AIzaSyD...xyz123'); // AIza••••••••123
```

### 5. 🔌 Integrações
**Arquivo:** `src/components/AdminIntegrations.jsx`

**Funcionalidades:**
- Gerenciamento de integrações
- Configuração de webhooks
- Status de conexão
- Sincronização manual
- Monitoramento de quota

**Plataformas Disponíveis:**
- 💳 Stripe - Processamento de pagamentos
- 🔥 Hotmart - Produtos digitais
- ▶️ YouTube Data API
- 🤖 OpenAI - Geração de IA
- 💰 Monetizze - Afiliados
- 🛒 Eduzz - Marketplace

### 6. 🪝 Webhooks
**Arquivo:** `src/components/AdminWebhooks.jsx`

**Funcionalidades:**
- Lista de webhooks configurados
- Adicionar novos webhooks
- Monitoramento de eventos
- Histórico de disparos
- Status de conexão

**Eventos Monitorados:**
- Novos pagamentos
- Vendas concluídas
- Assinaturas criadas
- Upgrades de plano

### 7. 📝 Logs de Atividades
**Arquivo:** `src/components/AdminLogs.jsx`

**Funcionalidades:**
- Registro de todas as ações
- Filtros por tipo de atividade
- Status de operações
- Informações de IP e usuário
- Timestamps relativos

**Tipos de Log:**
- 👤 Ações de usuários
- 📊 Geração de ofertas
- 🔑 Uso de APIs
- 🪝 Disparos de webhook

## 🛠️ Utilitários

### cryptoUtils.js
**Localização:** `src/utils/cryptoUtils.js`

**Funções Disponíveis:**

```javascript
// Criptografia
encrypt(plaintext)              // Criptografa texto
decrypt(ciphertext)             // Descriptografa texto
hash(text)                      // Gera hash

// Validação e Geração
validateAPIKey(key, type)       // Valida formato de chave
generateTestAPIKey(type)        // Gera chave de teste
maskAPIKey(key)                // Mascara chave para exibição

// Armazenamento Seguro
secureStore(key, value)         // Salva criptografado no localStorage
secureRetrieve(key)             // Recupera e descriptografa
secureRemove(key)               // Remove do localStorage
```

**Exemplo de Uso:**
```javascript
import cryptoUtils from '../utils/cryptoUtils';

// Armazenar chave API de forma segura
cryptoUtils.secureStore('youtube_api', 'AIzaSyD...');

// Recuperar chave
const apiKey = cryptoUtils.secureRetrieve('youtube_api');

// Validar chave
if (cryptoUtils.validateAPIKey(apiKey, 'youtube')) {
  // Chave válida
}
```

## 🚀 Estrutura de Componentes

```
src/
├── components/
│   ├── AdminOverview.jsx        # Dashboard principal
│   ├── AdminUsers.jsx           # Gerenciamento de usuários
│   ├── AdminPlans.jsx           # Gerenciamento de planos
│   ├── AdminAPIKeys.jsx         # Chaves API
│   ├── AdminIntegrations.jsx    # Integrações
│   ├── AdminWebhooks.jsx        # Webhooks
│   ├── AdminLogs.jsx            # Logs de atividades
│   ├── Sidebar.jsx              # Menu lateral (modo admin)
│   ├── Navbar.jsx               # Barra superior
│   └── ...
├── pages/
│   └── Admin.jsx                # Página principal do admin
├── context/
│   └── AuthContext.jsx          # Autenticação + verificação admin
├── utils/
│   ├── cryptoUtils.js           # Utilitários de criptografia
│   └── plans.js                 # Definições de planos
└── index.css                    # Estilos com tema admin
```

## 🎯 Características Principais

### 1. Autenticação Automática
- Detecção automática de email admin
- Badge visual distintivo (👑)
- Permissões ilimitadas
- Plano ADMIN especial

### 2. Interface Premium
- Glassmorphism avançado
- Animações com Framer Motion
- Gradientes personalizados
- Scrollbar customizada
- Tema escuro otimizado

### 3. Segurança
- Proteção de rotas
- Criptografia de chaves sensíveis
- Mascaramento de dados
- Logs de auditoria
- Validação de formato

### 4. Responsividade
- Layout adaptável
- Sidebar colapsável em mobile
- Tabelas com scroll horizontal
- Grids responsivos

## 📱 Navegação

### Menu Lateral (Sidebar)
```
👑 ViralTicket
⚡ Admin Panel
━━━━━━━━━━━━━━━━
📊 Visão Geral
👥 Usuários
⚡ Planos
🔑 Chaves API
🔌 Integrações
🪝 Webhooks
📝 Logs
━━━━━━━━━━━━━━━━
🚪 Sair
```

### Barra Superior (Navbar)
- Avatar com coroa indicando admin
- Badge do plano ADMIN
- Status online
- Seletor de idioma

## 🔧 Configuração

### 1. Email do Admin
Alterar email administrativo em `src/context/AuthContext.jsx`:
```javascript
const ADMIN_EMAIL = 'seu-email@gmail.com';
```

### 2. Chave de Criptografia
Alterar em `src/utils/cryptoUtils.js`:
```javascript
const MASTER_KEY = 'SUA_CHAVE_MESTRA_SEGURA';
```

### 3. Adicionar Nova Integração
Em `src/components/AdminIntegrations.jsx`:
```javascript
{
  id: 'nova-integracao',
  name: 'Nome da Integração',
  description: 'Descrição',
  icon: '🔗',
  status: 'inactive',
  connected: false,
  webhookUrl: 'https://...',
  config: {},
}
```

## 📈 Métricas e Estatísticas

### Dashboard Principal
- 📊 Total de usuários
- 🎯 Ofertas geradas hoje
- 🔑 APIs ativas
- 📈 Taxa de conversão
- 💰 Receita mensal estimada
- 👥 Distribuição de planos

### Logs e Auditoria
- ✅ Ações bem-sucedidas
- ❌ Erros e falhas
- 👤 Ações de usuários
- 🔔 Eventos do sistema
- 📍 IPs e localizações
- ⏰ Timestamps

## 🌟 Próximos Passos (Etapa 3)

### Motor de Chaves Inteligente
- [ ] Rotação automática de chaves API
- [ ] Detecção de quota baixa
- [ ] Balanceamento de carga entre chaves
- [ ] Fallback automático

### Webhooks Automáticos
- [ ] Disparo automático de eventos
- [ ] Retry em caso de falha
- [ ] Fila de processamento
- [ ] Logs detalhados

### Relatórios Avançados
- [ ] Exportação de dados
- [ ] Gráficos interativos
- [ ] Análise de tendências
- [ ] Alertas personalizados

## 🐛 Troubleshooting

### Problema: Não consigo acessar /admin
**Solução:** Verifique se está logado com `tamara14@gmail.com`

### Problema: Chaves API não aparecem mascaradas
**Solução:** Verifique se `maskAPIKey()` está sendo importado corretamente

### Problema: Tema não está aplicado
**Solução:** Verifique se `index.css` foi importado no `main.jsx`

### Problema: Componentes não renderizam
**Solução:** Verifique se todos os componentes foram criados e importados

## 📞 Suporte

Para dúvidas ou suporte:
- 📧 Email: suporte@viralticket.com
- 📱 WhatsApp: Admin VIP
- 💬 Chat: Disponível no painel

---

**ViralTicket Admin Panel v1.0**
*Desenvolvido com ❤️ e ⚡ por ViralTicket Team*
