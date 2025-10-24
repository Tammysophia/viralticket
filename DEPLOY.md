# 🚀 Guia de Deploy - ViralTicket

## Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta no Vercel ou Firebase (para deploy)

## 📝 Checklist Pré-Deploy

- [ ] Testar build localmente: `npm run build`
- [ ] Verificar preview: `npm run preview`
- [ ] Configurar variáveis de ambiente
- [ ] Revisar configurações de segurança
- [ ] Testar em diferentes navegadores
- [ ] Testar responsividade (mobile, tablet, desktop)

## 🔧 Configuração de Variáveis de Ambiente

### 1. Crie arquivo `.env` (não commitado)

```bash
cp .env.example .env
```

### 2. Preencha as variáveis

```env
VITE_FIREBASE_API_KEY=sua_chave
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto_id
VITE_YOUTUBE_API_KEY=AIza...
VITE_OPENAI_API_KEY=sk-...
```

## 🌐 Deploy no Vercel

### Método 1: CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy de produção
vercel --prod
```

### Método 2: GitHub Integration

1. Push para GitHub
2. Acesse [vercel.com](https://vercel.com)
3. Import o repositório
4. Configure as variáveis de ambiente
5. Deploy automático!

### Configuração Vercel

**vercel.json**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "routes": [
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

## 🔥 Deploy no Firebase

### 1. Instalar Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Login

```bash
firebase login
```

### 3. Inicializar Projeto

```bash
firebase init hosting
```

Configuração:
- Public directory: `dist`
- Single-page app: `Yes`
- GitHub integration: `Yes` (opcional)

### 4. Build e Deploy

```bash
npm run build
firebase deploy --only hosting
```

### Configuração Firebase

**firebase.json**
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

## 📦 Deploy no Netlify

### Método 1: Drag & Drop

```bash
npm run build
```

Arraste a pasta `dist` para [app.netlify.com/drop](https://app.netlify.com/drop)

### Método 2: CLI

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

### Configuração Netlify

**netlify.toml**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 🔒 Configurações de Segurança

### Headers de Segurança

```javascript
// vercel.json ou netlify.toml
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

## 🎯 Domínio Customizado

### Vercel
1. Vá em Settings > Domains
2. Adicione seu domínio
3. Configure DNS (A ou CNAME)

### Firebase
```bash
firebase hosting:channel:deploy production --only hosting
```

## 📊 Monitoramento

### Google Analytics (Opcional)

1. Crie conta no Google Analytics
2. Adicione script no `index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🔄 CI/CD com GitHub Actions

**.github/workflows/deploy.yml**

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
      env:
        VITE_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
        VITE_YOUTUBE_API_KEY: ${{ secrets.YOUTUBE_API_KEY }}
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

## ⚡ Otimizações

### 1. Code Splitting

Já configurado automaticamente pelo Vite.

### 2. Lazy Loading de Rotas

```javascript
// App.jsx
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Admin = lazy(() => import('./pages/Admin'));

// Wrap routes with Suspense
<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/admin" element={<Admin />} />
  </Routes>
</Suspense>
```

### 3. Image Optimization

Use formatos modernos (WebP) e lazy loading:

```jsx
<img 
  src="image.webp" 
  loading="lazy" 
  alt="Description"
/>
```

## 🐛 Troubleshooting

### Build Falha

```bash
# Limpar cache
rm -rf node_modules dist
npm install
npm run build
```

### 404 em Rotas

Certifique-se de que está configurado SPA redirect (ver configurações acima).

### Variáveis de Ambiente Não Funcionam

- Verifique o prefix `VITE_`
- Rebuild após mudar variáveis
- Configure no painel da plataforma de deploy

## 📈 Performance

### Lighthouse Score Target

- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 90+

### Checklist de Otimização

- [ ] Minificação de assets
- [ ] Compression (gzip/brotli)
- [ ] CDN para assets estáticos
- [ ] Cache headers configurados
- [ ] Lazy loading de imagens
- [ ] Code splitting implementado

---

**Deploy bem-sucedido?** 🎉 Compartilhe seu link!
