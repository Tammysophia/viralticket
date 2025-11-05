# 🔑 Como Configurar as Chaves de API

## ⚠️ PROBLEMA ATUAL

O sistema está usando **chaves mockadas** (falsas) que não funcionam com as APIs reais.
Você precisa configurar chaves reais para que o sistema funcione.

## 📋 Passos para Configurar

### 1️⃣ Obter Chave da OpenAI

1. Acesse: https://platform.openai.com/api-keys
2. Faça login ou crie uma conta
3. Clique em "Create new secret key"
4. Copie a chave (começa com `sk-`)
5. **IMPORTANTE:** Você só verá a chave uma vez, então guarde em local seguro!

### 2️⃣ Obter Chave do YouTube Data API

1. Acesse: https://console.cloud.google.com/
2. Crie um novo projeto ou selecione um existente
3. Vá em "APIs & Services" → "Credentials"
4. Clique em "Create Credentials" → "API Key"
5. Copie a chave (começa com `AIza`)
6. Ative a "YouTube Data API v3":
   - Vá em "Library"
   - Busque por "YouTube Data API v3"
   - Clique em "Enable"

### 3️⃣ Configurar no Sistema

1. **Faça login como Admin** no ViralTicket
2. Vá para **Admin → API Keys**
3. Para cada chave mockada:
   - Clique em "Editar"
   - Cole a chave REAL
   - Clique em "Salvar"

#### Exemplo de como devem ficar:

**YouTube:**
```
Nome: YouTube Data API
Chave: AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxx  ← Sua chave real aqui
Tipo: youtube
Status: active
```

**OpenAI:**
```
Nome: OpenAI API
Chave: sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxx  ← Sua chave real aqui
Tipo: openai
Status: active
```

### 4️⃣ Verificar se Funcionou

1. Vá para o **Dashboard**
2. Tente extrair comentários do YouTube
3. Tente gerar uma oferta com IA

Se aparecer:
- ✅ "Oferta gerada com sucesso!" = Funcionou!
- ❌ "A chave da API está mockada" = Precisa configurar chave real

## 🐛 Solução Rápida via Console do Navegador

Se preferir configurar diretamente pelo console:

1. Abra o console do navegador (F12)
2. Cole este código (substitua pelas suas chaves reais):

```javascript
const apiKeys = [
  {
    id: '1',
    name: 'YouTube Data API',
    key: 'AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxx', // ← SUA CHAVE AQUI
    type: 'youtube',
    status: 'active',
    quota: 0,
    lastUsed: new Date().toISOString(),
    encrypted: false,
  },
  {
    id: '2',
    name: 'OpenAI API',
    key: 'sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxx', // ← SUA CHAVE AQUI
    type: 'openai',
    status: 'active',
    quota: 0,
    lastUsed: new Date().toISOString(),
    encrypted: false,
  },
];

localStorage.setItem('viralticket_api_keys', JSON.stringify(apiKeys));
console.log('✅ Chaves configuradas! Recarregue a página.');
```

3. Recarregue a página (F5)

## 💰 Custos das APIs

### OpenAI (GPT-4)
- ~$0.03 por oferta gerada
- Plano Free: $5 de crédito inicial
- Recomendado: Adicionar $10-20 para começar

### YouTube Data API
- **GRÁTIS** até 10.000 unidades/dia
- Cada extração de comentários usa ~1-5 unidades
- Suficiente para uso normal

## ❓ Perguntas Frequentes

**P: Minhas chaves estão seguras?**
R: As chaves ficam apenas no localStorage do seu navegador. Recomendamos usar criptografia para produção.

**P: Posso usar chaves de teste?**
R: Sim, mas elas precisam ser chaves reais das APIs, não strings mockadas.

**P: E se eu não quiser gastar agora?**
R: Você pode usar apenas a YouTube API (grátis) para extrair comentários. Para gerar ofertas, precisará da OpenAI.

## 🆘 Suporte

Se ainda tiver problemas, verifique:
1. Se as chaves estão corretas (sem espaços extras)
2. Se as APIs estão ativadas nos respectivos painéis
3. Se há créditos/quota disponível
4. Console do navegador para mensagens de erro detalhadas
