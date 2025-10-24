# 🎟️ ViralTicket

> Plataforma de IA que transforma comentários do YouTube em ofertas virais

## 🚀 Funcionalidades

### 📱 Dashboard do Usuário
- **Extrator YouTube**: Extrai até 50 comentários de vídeos do YouTube
- **Chat IA**: Dois agentes especializados (Sophia Fênix 🔥 e Sofia Universal 🌟) para gerar ofertas
- **Kanban de Ofertas**: Organize ofertas em 4 estágios (Pendente, Em Execução, Modelando, Concluído)
- **Sistema de Planos**: FREE, BRONZE, PRATA e OURO com limites progressivos

### 👑 Painel Administrativo
- **Visão Geral**: KPIs, gráficos e atividades recentes
- **Gerenciamento de Usuários**: Alterar planos, bloquear usuários
- **Chaves API**: Gerenciar YouTube Data API e OpenAI API com rotação
- **Webhooks**: Integração com plataformas de pagamento (Stripe, Hotmart, etc)

### 🌐 Recursos Globais
- **Multi-idioma**: Português (🇧🇷), Inglês (🇺🇸) e Espanhol (🇪🇸)
- **Dark Mode**: Tema escuro com gradiente roxo (#8B5CF6) → rosa (#EC4899)
- **Glassmorphism**: Design moderno com blur e transparências
- **Responsivo**: Mobile-first, adaptado para todos os dispositivos
- **Animações**: Transições suaves com Framer Motion

## 🛠️ Tecnologias

- **Frontend**: React 18 + Vite
- **Estilização**: TailwindCSS 3
- **Animações**: Framer Motion
- **Ícones**: Lucide React
- **Roteamento**: React Router DOM 6
- **Drag & Drop**: React Beautiful DnD
- **Tipografia**: Inter (Google Fonts)

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 🎨 Estrutura de Pastas

```
src/
├── components/        # Componentes reutilizáveis
│   ├── Toast.jsx
│   ├── Navbar.jsx
│   ├── Sidebar.jsx
│   ├── Card.jsx
│   ├── Modal.jsx
│   ├── Button.jsx
│   ├── Input.jsx
│   ├── Tabs.jsx
│   ├── ProgressBar.jsx
│   ├── PlanBadge.jsx
│   ├── YouTubeExtractor.jsx
│   ├── AIChat.jsx
│   ├── Kanban.jsx
│   ├── AdminOverview.jsx
│   ├── AdminUsers.jsx
│   ├── AdminAPIKeys.jsx
│   └── AdminWebhooks.jsx
├── pages/             # Páginas
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   └── Admin.jsx
├── context/           # Contexts
│   ├── AuthContext.jsx
│   └── LangContext.jsx
├── hooks/             # Hooks customizados
│   ├── useAuth.js
│   ├── useLanguage.js
│   └── useAPIKeys.js
├── utils/             # Funções utilitárias
│   ├── validation.js
│   └── plans.js
├── App.jsx            # Componente principal
├── main.jsx           # Entry point
└── index.css          # Estilos globais
```

## 🔐 Autenticação

O sistema está preparado para integração com Firebase Auth:
- Login com email e senha
- Registro de novos usuários
- Validação de formulários
- Sessão persistente no localStorage

## 📊 Planos Disponíveis

| Plano | Ofertas/dia | URLs/dia | Badge |
|-------|-------------|----------|-------|
| FREE | 3 | 3 | 🆓 |
| BRONZE | 5 | 5 | 🥉 |
| PRATA | 10 | 10 | 🥈 |
| OURO | Ilimitado | Ilimitado | 🥇 |

## 🎯 Próximos Passos

- [ ] Integrar Firebase Authentication
- [ ] Conectar Firebase Firestore para persistência
- [ ] Integrar YouTube Data API real
- [ ] Integrar OpenAI API para geração de ofertas
- [ ] Implementar sistema de pagamentos
- [ ] Deploy no Firebase Hosting ou Vercel

## 📝 Notas de Desenvolvimento

- Todos os dados são mockados/simulados
- As chaves API são apenas placeholders
- Sistema pronto para integração com APIs reais
- Código limpo, comentado e modular

## 🌟 Design System

### Cores Principais
- Purple: `#8B5CF6`
- Pink: `#EC4899`
- Background: Gradiente dark (`#1a1a2e` → `#16213e` → `#0f3460`)

### Glassmorphism
```css
background: rgba(255, 255, 255, 0.1)
backdrop-filter: blur(20px)
border: 1px solid rgba(255, 255, 255, 0.2)
```

---

**Desenvolvido com ❤️ para transformar comentários em ofertas virais**
