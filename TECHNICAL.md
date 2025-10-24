# 📘 Documentação Técnica - ViralTicket

## 🏗️ Arquitetura do Projeto

### Estrutura de Componentes

#### Componentes Base
- **Toast**: Sistema de notificações com auto-dismiss (3s)
- **Navbar**: Barra superior com seletor de idioma e informações do usuário
- **Sidebar**: Menu lateral com navegação e logout
- **Card**: Container glassmorphic reutilizável
- **Modal**: Dialog modal com backdrop e animações
- **Button**: Botão com estados (loading, disabled) e variantes
- **Input**: Campo de entrada com validação e ícones
- **Tabs**: Sistema de abas com animação de transição
- **ProgressBar**: Barra de progresso com cores dinâmicas
- **PlanBadge**: Badge de plano do usuário

#### Componentes de Funcionalidade
- **YouTubeExtractor**: Extração de comentários do YouTube
- **AIChat**: Interface de chat com agentes IA
- **Kanban**: Board drag-and-drop para organização de ofertas

#### Componentes Admin
- **AdminOverview**: Dashboard com KPIs e gráficos
- **AdminUsers**: Gerenciamento de usuários
- **AdminAPIKeys**: Gerenciamento de chaves API
- **AdminWebhooks**: Gerenciamento de webhooks

## 🔐 Sistema de Autenticação

### AuthContext
```javascript
{
  user: {
    id: string,
    email: string,
    name: string,
    plan: 'FREE' | 'BRONZE' | 'PRATA' | 'OURO',
    avatar: string,
    dailyUsage: {
      offers: number,
      urls: number
    },
    limits: {
      offers: number | 'unlimited',
      urls: number | 'unlimited'
    }
  },
  loading: boolean,
  login: (email, password) => Promise,
  register: (email, password) => Promise,
  logout: () => void,
  updateUser: (updates) => void
}
```

### Fluxo de Autenticação
1. Usuário acessa `/` (Login)
2. Preenche email/senha
3. Sistema valida credenciais (mock atualmente)
4. Cria sessão no localStorage
5. Redireciona para `/dashboard`
6. PrivateRoute verifica autenticação
7. Carrega dados do usuário

## 🌐 Sistema Multi-idioma

### LangContext
```javascript
{
  language: 'pt-BR' | 'en-US' | 'es-ES',
  changeLanguage: (lang) => void,
  t: (key) => string
}
```

### Adicionar Nova Tradução
1. Edite `src/context/LangContext.jsx`
2. Adicione chave no objeto `translations`
3. Use `t('chave')` nos componentes

## 🎨 Sistema de Design

### Cores
```javascript
Purple: #8B5CF6
Pink: #EC4899
Background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)
```

### Classes Utility (Tailwind)
```css
.glass - Glassmorphism base
.glass-hover - Glassmorphism com hover
.gradient-primary - Gradiente roxo → rosa
.gradient-bg - Gradiente de fundo
```

## 📊 Sistema de Planos

### Estrutura de Planos
```javascript
FREE: { offers: 3, urls: 3 }
BRONZE: { offers: 5, urls: 5 }
PRATA: { offers: 10, urls: 10 }
OURO: { offers: 'unlimited', urls: 'unlimited' }
```

### Verificação de Limites
```javascript
// Em qualquer ação que consome recurso:
if (user.dailyUsage.offers >= user.limits.offers && 
    user.limits.offers !== 'unlimited') {
  error('Limite atingido');
  return;
}
```

## 🔧 Hooks Customizados

### useAuth
```javascript
const { user, loading, login, logout, updateUser } = useAuth();
```

### useLanguage
```javascript
const { language, changeLanguage, t } = useLanguage();
```

### useAPIKeys
```javascript
const { 
  apiKeys, 
  loading, 
  addAPIKey, 
  updateAPIKey, 
  deleteAPIKey, 
  rotateAPIKey 
} = useAPIKeys();
```

## 🔄 Fluxo de Dados

### Extração de Comentários
1. Usuário insere URLs do YouTube
2. Sistema valida URLs (`validateYouTubeUrl`)
3. Verifica limite diário (`user.limits.urls`)
4. Faz requisição à API (mock)
5. Retorna array de comentários
6. Atualiza `dailyUsage.urls`
7. Exibe toast de sucesso

### Geração de Ofertas
1. Usuário seleciona agente IA
2. Insere texto/comentário
3. Sistema verifica limite (`user.limits.offers`)
4. Envia para API (mock)
5. Retorna oferta formatada
6. Atualiza `dailyUsage.offers`
7. Exibe resultado com opção de copiar

## 🎯 Validações

### Email
```javascript
validateEmail(email) // Regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
```

### Senha
```javascript
validatePassword(password) // Mínimo 6 caracteres
```

### YouTube URL
```javascript
validateYouTubeUrl(url) // youtube.com ou youtu.be
```

### API Keys
```javascript
validateYouTubeAPIKey(key) // Começa com 'AIza', 39+ chars
validateOpenAIKey(key) // Começa com 'sk-', 20+ chars
```

## 📱 Responsividade

### Breakpoints
```javascript
sm: 640px   // Mobile landscape
md: 768px   // Tablet
lg: 1024px  // Desktop
xl: 1280px  // Large desktop
```

### Mobile-First
- Sidebar recolhível em mobile
- Grid adaptativo
- Cards empilhados
- Animações otimizadas

## 🚀 Próximas Integrações

### Firebase Auth
```javascript
// Em AuthContext.jsx
import { auth } from './firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const login = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  // ...
};
```

### YouTube Data API
```javascript
// Em YouTubeExtractor.jsx
const extractComments = async (url) => {
  const videoId = extractVideoId(url);
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/commentThreads?videoId=${videoId}&key=${API_KEY}`
  );
  // ...
};
```

### OpenAI API
```javascript
// Em AIChat.jsx
const generateOffer = async (text, agent) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: text }]
    })
  });
  // ...
};
```

## 🧪 Testing (Futuro)

### Estrutura de Testes
```
tests/
├── unit/
│   ├── utils/
│   ├── hooks/
│   └── components/
├── integration/
│   ├── auth.test.js
│   └── dashboard.test.js
└── e2e/
    └── user-flow.test.js
```

## 📦 Build & Deploy

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm run preview
```

### Deploy (Vercel)
```bash
vercel --prod
```

### Deploy (Firebase)
```bash
firebase deploy --only hosting
```

## 🔒 Segurança

### Variáveis de Ambiente
- Nunca commitar `.env`
- Usar `VITE_` prefix para exposição ao cliente
- Rotacionar chaves API periodicamente

### Validações
- Input sanitization
- CSRF protection (futuro)
- Rate limiting (futuro)

---

**Última atualização**: 2025-10-24
