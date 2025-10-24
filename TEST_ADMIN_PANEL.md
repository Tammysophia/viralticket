# 🧪 Teste do Painel Administrativo - ViralTicket

## 📋 Guia de Testes Completo

Este documento contém todos os testes que você deve realizar para verificar que o painel administrativo está funcionando perfeitamente.

---

## 🚀 PASSO 1: Iniciar o Projeto

```bash
# Terminal 1 - Instalar e iniciar
cd /workspace
npm install
npm run dev
```

**✅ Resultado Esperado:**
```
VITE v5.x.x  ready in XXX ms
➜  Local:   http://localhost:5173/
➜  press h to show help
```

---

## 🔐 PASSO 2: Testar Login Admin

### 2.1 Acessar Página de Login
```
URL: http://localhost:5173
```

### 2.2 Fazer Login como Admin
```
Email:    tamara14@gmail.com
Senha:    qualquer
```

### ✅ Verificações:
- [ ] Login realizado com sucesso
- [ ] Redirecionamento para `/dashboard`
- [ ] Badge ADMIN aparece no navbar
- [ ] Coroa (👑) visível no avatar
- [ ] Ícone de escudo ao lado do nome
- [ ] Plano exibido como "ADMIN"

---

## 👑 PASSO 3: Acessar Painel Admin

### 3.1 Navegar para o Painel
```
URL: http://localhost:5173/admin
```

### ✅ Verificações Visuais:
- [ ] Acesso permitido (não redireciona)
- [ ] Background preto (#0A0A0A) com overlay roxo
- [ ] Sidebar à esquerda com tema premium
- [ ] Badge "Acesso Administrativo" visível
- [ ] Gradiente roxo → lilás → dourado no título
- [ ] 7 módulos no menu lateral
- [ ] Ponto verde "Online" animado

---

## 📊 PASSO 4: Testar Módulo "Visão Geral"

### 4.1 Cards de Estatísticas
**✅ Verificações:**
- [ ] 4 cards principais exibidos
- [ ] Ícones coloridos e animados
- [ ] Valores numéricos visíveis
- [ ] Percentual de mudança (+12%, +8%, etc.)
- [ ] Hover effect funciona

### 4.2 Cards Secundários
**✅ Verificações:**
- [ ] 3 cards menores (Plano Popular, Integrações, Uptime)
- [ ] Ícones e emojis visíveis
- [ ] Border roxo/lilás

### 4.3 Gráfico de Crescimento
**✅ Verificações:**
- [ ] 7 barras animadas (Seg-Dom)
- [ ] Gradiente roxo → rosa
- [ ] Hover mostra tooltip com valores
- [ ] Animação suave ao carregar
- [ ] Total da semana exibido

### 4.4 Distribuição de Planos
**✅ Verificações:**
- [ ] 4 planos listados (FREE, BRONZE, PRATA, OURO)
- [ ] Progress bars animadas
- [ ] Emojis dos planos (🆓 🥉 🥈 🥇)
- [ ] Porcentagens corretas
- [ ] Receita mensal calculada

### 4.5 Atividades Recentes
**✅ Verificações:**
- [ ] 4 atividades listadas
- [ ] Avatar circular com inicial
- [ ] Hover effect com escala
- [ ] Badge de plano colorido
- [ ] Botão "Ver todas →"

### 4.6 Resumo Executivo
**✅ Verificações:**
- [ ] Card com background gradient especial
- [ ] 3 métricas (Crescimento, Engajamento, LTV)
- [ ] Badge "Atualizado agora"
- [ ] Ponto verde "Sistema operacional"
- [ ] Uptime exibido

---

## 👥 PASSO 5: Testar Módulo "Usuários"

### 5.1 Navegação
**Ação:** Clicar em "Usuários" no menu lateral

### ✅ Verificações:
- [ ] Transição suave de página
- [ ] Título atualiza para "Usuários"
- [ ] Tabela de usuários carregada
- [ ] 4+ usuários listados

### 5.2 Tabela de Usuários
**✅ Verificações:**
- [ ] Colunas: Usuário, Plano, Uso Diário, Status, Ações
- [ ] Badges de plano coloridos
- [ ] Status visual (ativo/bloqueado)
- [ ] Botão de ações (três pontos)
- [ ] Hover effect nas linhas

### 5.3 Modal de Gerenciamento
**Ação:** Clicar no botão de ações (três pontos)

**✅ Verificações:**
- [ ] Modal abre suavemente
- [ ] Informações do usuário exibidas
- [ ] Grid de planos (4 opções)
- [ ] Plano atual destacado
- [ ] Botões "Bloquear" e "Editar"
- [ ] Botão "Fechar" funciona

### 5.4 Alterar Plano
**Ação:** Clicar em um plano diferente

**✅ Verificações:**
- [ ] Plano atualizado na lista
- [ ] Toast de sucesso aparece
- [ ] Modal fecha automaticamente
- [ ] Tabela reflete a mudança

---

## ⚡ PASSO 6: Testar Módulo "Planos"

### 6.1 Navegação
**Ação:** Clicar em "Planos" no menu lateral

### ✅ Verificações:
- [ ] 4 cards de planos exibidos
- [ ] Grid responsivo (2x2 ou 4x1)
- [ ] Ícones dos planos coloridos
- [ ] Preços visíveis

### 6.2 Cards de Planos
**✅ Verificações para cada plano:**
- [ ] Nome do plano
- [ ] Ícone (🆓 🥉 🥈 🥇)
- [ ] Preço ou "Grátis"
- [ ] Limites (ofertas, URLs, créditos IA, suporte)
- [ ] Número de usuários ativos
- [ ] Botão "Editar Plano"

### 6.3 Receita Mensal
**✅ Verificações:**
- [ ] Card de receita no topo
- [ ] Valor calculado (R$ XX.XXX)
- [ ] Total de assinantes

### 6.4 Editar Plano
**Ação:** Clicar em "Editar Plano" em qualquer card

**✅ Verificações:**
- [ ] Modal abre com dados do plano
- [ ] Campos editáveis (nome, preço, limites)
- [ ] Grid 2x2 para ofertas/URLs
- [ ] Botão "Salvar Alterações"
- [ ] Botão "Cancelar"

### 6.5 Salvar Alterações
**Ação:** Modificar algum valor e salvar

**✅ Verificações:**
- [ ] Toast de sucesso aparece
- [ ] Valor atualizado no card
- [ ] Modal fecha
- [ ] Dados persistem

---

## 🔑 PASSO 7: Testar Módulo "Chaves API"

### 7.1 Lista de Chaves
**✅ Verificações:**
- [ ] Múltiplas chaves listadas
- [ ] Ícone de chave (🔑)
- [ ] Nome da chave
- [ ] Chave mascarada (AIza••••••••xyz)
- [ ] Último uso
- [ ] Status (ativa/inativa)
- [ ] Barra de quota

### 7.2 Botão "Nova Chave"
**Ação:** Clicar em "Nova Chave"

**✅ Verificações:**
- [ ] Modal abre
- [ ] Campo "Nome da Chave"
- [ ] Seletor de tipo (YouTube/OpenAI)
- [ ] Campo "Chave API" (senha)
- [ ] Placeholder muda conforme tipo
- [ ] Botões "Adicionar" e "Cancelar"

### 7.3 Adicionar Chave
**Ação:** Preencher e adicionar

**✅ Verificações:**
- [ ] Validação de campos vazios
- [ ] Toast de sucesso
- [ ] Nova chave aparece na lista
- [ ] Chave mascarada corretamente
- [ ] Modal fecha

### 7.4 Rotacionar Chave
**Ação:** Clicar em "Rotacionar" em uma chave

**✅ Verificações:**
- [ ] Toast de sucesso
- [ ] Data de último uso atualizada
- [ ] Animação visual

### 7.5 Excluir Chave
**Ação:** Clicar em "Excluir"

**✅ Verificações:**
- [ ] Confirmação aparece
- [ ] Chave removida da lista
- [ ] Toast de sucesso

---

## 🔌 PASSO 8: Testar Módulo "Integrações"

### 8.1 Cards de Estatísticas
**✅ Verificações:**
- [ ] 3 cards no topo
- [ ] Integrações ativas
- [ ] Total disponível
- [ ] Webhooks configurados

### 8.2 Grid de Integrações
**✅ Verificações:**
- [ ] 6 plataformas exibidas
- [ ] Emojis/ícones visíveis (💳 🔥 ▶️ 🤖 💰 🛒)
- [ ] Nome e descrição
- [ ] Status (conectado/desconectado)
- [ ] Toggle colorido (verde/cinza)

### 8.3 Plataformas Disponíveis
**✅ Verificar cada uma:**
- [ ] Stripe (Pagamentos)
- [ ] Hotmart (Produtos digitais)
- [ ] YouTube Data API
- [ ] OpenAI (IA)
- [ ] Monetizze (Afiliados)
- [ ] Eduzz (Marketplace)

### 8.4 Conectar/Desconectar
**Ação:** Clicar no toggle de status

**✅ Verificações:**
- [ ] Status muda (ativo ⟷ inativo)
- [ ] Toast de confirmação
- [ ] Ícone muda (✓ ⟷ ✗)
- [ ] Cor muda (verde ⟷ cinza)

### 8.5 Configurar Integração
**Ação:** Clicar em "Configurar"

**✅ Verificações:**
- [ ] Modal abre
- [ ] Info da plataforma exibida
- [ ] Campos de configuração (chaves)
- [ ] Webhook URL (se aplicável)
- [ ] Descrição de uso
- [ ] Botões "Salvar" e "Cancelar"

### 8.6 Sincronizar
**Ação:** Clicar em "Sincronizar"

**✅ Verificações:**
- [ ] Toast de sucesso
- [ ] Data de última sincronização atualiza
- [ ] Animação de loading breve

---

## 🪝 PASSO 9: Testar Módulo "Webhooks"

### 9.1 Lista de Webhooks
**✅ Verificações:**
- [ ] Webhooks listados
- [ ] Ícone (🪝)
- [ ] Nome e URL
- [ ] Plataforma
- [ ] Status (ativo/inativo)
- [ ] Total de eventos
- [ ] Último disparo

### 9.2 Adicionar Webhook
**Ação:** Clicar em "Novo Webhook"

**✅ Verificações:**
- [ ] Modal abre
- [ ] Campo "Nome do Webhook"
- [ ] Campo "URL do Webhook"
- [ ] Seletor de plataforma
- [ ] Opções: Stripe, Hotmart, Monetizze, Eduzz, PayPal
- [ ] Botões "Adicionar" e "Cancelar"

### 9.3 Salvar Webhook
**Ação:** Preencher e salvar

**✅ Verificações:**
- [ ] Validação de campos
- [ ] Webhook adicionado à lista
- [ ] Toast de sucesso
- [ ] Eventos em 0
- [ ] Status "ativo"

---

## 📝 PASSO 10: Testar Módulo "Logs"

### 10.1 Cards de Estatísticas
**✅ Verificações:**
- [ ] 4 cards no topo
- [ ] Total de logs
- [ ] Logs de sucesso
- [ ] Logs com erro
- [ ] Ações de usuários

### 10.2 Filtros
**✅ Verificações:**
- [ ] Botões de filtro visíveis
- [ ] Opções: Todos, User, Offer, API, Webhook
- [ ] Botão ativo destacado
- [ ] Ícone de filtro (🔍)

### 10.3 Lista de Logs
**✅ Verificações:**
- [ ] Múltiplos logs listados
- [ ] Ícone por tipo (👤 📊 🔑 🪝)
- [ ] Ação realizada
- [ ] Detalhes
- [ ] Status visual (success/error)
- [ ] Timestamp relativo ("há X min")
- [ ] Informações de usuário e IP
- [ ] Hover effect

### 10.4 Filtrar Logs
**Ação:** Clicar em cada botão de filtro

**✅ Verificações:**
- [ ] Lista atualiza conforme filtro
- [ ] Contador de logs correto
- [ ] Animação suave
- [ ] "Todos" mostra tudo

### 10.5 Tipos de Log
**✅ Verificar presença de:**
- [ ] Logs de usuário (cadastro, login, upgrade)
- [ ] Logs de oferta (geração, extração)
- [ ] Logs de API (adição, erro, quota)
- [ ] Logs de webhook (disparo, falha)

---

## 🎨 PASSO 11: Verificar Tema Visual

### 11.1 Cores
**✅ Verificações:**
- [ ] Background preto profundo (#0A0A0A)
- [ ] Gradiente roxo (#8B5CF6)
- [ ] Gradiente lilás (#A78BFA)
- [ ] Gradiente dourado (#FACC15)
- [ ] Texto em gradiente nos títulos

### 11.2 Efeitos
**✅ Verificações:**
- [ ] Glassmorphism em cards
- [ ] Backdrop blur visível
- [ ] Borders com transparência
- [ ] Shadows com glow roxo
- [ ] Hover effects suaves

### 11.3 Animações
**✅ Verificações:**
- [ ] Fade in ao carregar módulos
- [ ] Slide in em listas
- [ ] Scale em hover de botões
- [ ] Progress bars animadas
- [ ] Transições suaves entre páginas

### 11.4 Scrollbar
**✅ Verificações:**
- [ ] Scrollbar customizada
- [ ] Cor roxo/lilás
- [ ] Hover effect na scrollbar
- [ ] Thumb arredondado

---

## 📱 PASSO 12: Testar Responsividade

### 12.1 Desktop (> 1024px)
**✅ Verificações:**
- [ ] Sidebar fixa à esquerda
- [ ] Grid de 4 colunas em stats
- [ ] Todos os elementos visíveis
- [ ] Layout espaçoso

### 12.2 Redimensionar Janela
**Ação:** Reduzir largura da janela

**✅ Verificações:**
- [ ] Grid adapta para 2 colunas
- [ ] Sidebar permanece visível
- [ ] Texto não quebra incorretamente
- [ ] Cards reorganizam

### 12.3 Mobile (< 768px)
**Ação:** Abrir DevTools e selecionar dispositivo móvel

**✅ Verificações:**
- [ ] Botão hamburger aparece
- [ ] Sidebar vira overlay
- [ ] Grid vira 1 coluna
- [ ] Tabelas com scroll horizontal
- [ ] Texto legível
- [ ] Botões clicáveis

---

## 🔐 PASSO 13: Testar Segurança

### 13.1 Acesso Não-Admin
**Ação:** 
1. Fazer logout
2. Fazer login com outro email (não tamara14@gmail.com)
3. Tentar acessar /admin

**✅ Verificações:**
- [ ] Redirecionado para /dashboard
- [ ] Não consegue acessar /admin
- [ ] Sem badge de admin no navbar
- [ ] Sem coroa no avatar

### 13.2 Verificar LocalStorage
**Ação:** Abrir DevTools → Application → Local Storage

**✅ Verificações:**
- [ ] `viralticket_user` existe
- [ ] `isAdmin: true` para tamara14@gmail.com
- [ ] `plan: "ADMIN"` correto
- [ ] Limites ilimitados (999999)

### 13.3 Criptografia
**Ação:** Abrir Console e testar

```javascript
import { encrypt, decrypt, maskAPIKey } from './utils/cryptoUtils.js';

// Testar criptografia
const encrypted = encrypt('minha-chave-secreta');
console.log('Encrypted:', encrypted);

const decrypted = decrypt(encrypted);
console.log('Decrypted:', decrypted); // Deve retornar 'minha-chave-secreta'

// Testar mascaramento
console.log(maskAPIKey('AIzaSyD123456789xyz')); // AIza••••••••xyz
```

**✅ Verificações:**
- [ ] Criptografia funciona
- [ ] Descriptografia retorna original
- [ ] Mascaramento correto

---

## ⚡ PASSO 14: Testar Performance

### 14.1 Build
**Ação:** Rodar build

```bash
npm run build
```

**✅ Verificações:**
- [ ] Build sem erros
- [ ] Tempo < 10 segundos
- [ ] Bundle size razoável (< 500 KB JS)
- [ ] CSS otimizado

### 14.2 Lighthouse
**Ação:** DevTools → Lighthouse → Run

**✅ Metas:**
- [ ] Performance > 80
- [ ] Accessibility > 90
- [ ] Best Practices > 90
- [ ] SEO > 80

### 14.3 Navegação
**✅ Verificações:**
- [ ] Mudança entre módulos instantânea
- [ ] Sem lag ao abrir modais
- [ ] Animações a 60 FPS
- [ ] Scroll suave

---

## 🎯 CHECKLIST FINAL

### Funcionalidade
- [ ] ✅ Login admin funciona
- [ ] ✅ Todos os 7 módulos acessíveis
- [ ] ✅ Navegação entre módulos suave
- [ ] ✅ Modais abrem e fecham
- [ ] ✅ Toasts aparecem
- [ ] ✅ Formulários validam
- [ ] ✅ Dados persistem

### Visual
- [ ] ✅ Tema roxo → lilás → dourado
- [ ] ✅ Glassmorphism aplicado
- [ ] ✅ Animações suaves
- [ ] ✅ Hover effects
- [ ] ✅ Badge de admin
- [ ] ✅ Scrollbar customizada

### Técnico
- [ ] ✅ Build sem erros
- [ ] ✅ Console sem errors
- [ ] ✅ Performance adequada
- [ ] ✅ Responsivo
- [ ] ✅ Seguro

---

## 🐛 Problemas Comuns e Soluções

### Problema: "Cannot find module"
**Solução:**
```bash
npm install
```

### Problema: Porta 5173 em uso
**Solução:**
```bash
# Matar processo
lsof -ti:5173 | xargs kill -9
# Reiniciar
npm run dev
```

### Problema: Não consigo acessar /admin
**Solução:** Verifique se está logado com `tamara14@gmail.com`

### Problema: Tema não aparece
**Solução:** Limpar cache do navegador (Ctrl+Shift+Del)

### Problema: Animações lentas
**Solução:** Desativar DevTools ou reduzir animações

---

## ✅ RESULTADO ESPERADO

Se todos os testes passarem, você verá:

```
✅ Login admin funcionando
✅ Acesso a /admin permitido
✅ 7 módulos completos e funcionais
✅ Tema visual premium aplicado
✅ Animações suaves
✅ Responsivo em todos os tamanhos
✅ Performance adequada
✅ Sem erros no console
✅ Build bem-sucedido

🎉 PAINEL ADMINISTRATIVO 100% FUNCIONAL!
```

---

**Tempo Estimado de Testes:** 30-45 minutos  
**Última Atualização:** 2025-10-24  
**Status:** ✅ Pronto para Testes
