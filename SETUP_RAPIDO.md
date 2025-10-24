# ⚡ Setup Rápido - APIs Reais ViralTicket

## 🚀 Em 5 Minutos Você Terá APIs Reais Funcionando!

---

## PASSO 1: Obter Chaves de API (10 min)

### 🎬 YouTube Data API v3 (5 min)

1. Acesse: https://console.cloud.google.com/
2. Faça login com sua conta Google
3. Crie um novo projeto (ou use existente):
   - Clique em "Select a project" → "NEW PROJECT"
   - Nome: "ViralTicket"
   - Clique em "CREATE"
4. Com o projeto selecionado, vá em "APIs & Services" → "Library"
5. Pesquise por "YouTube Data API v3"
6. Clique em "ENABLE"
7. Vá em "Credentials" → "CREATE CREDENTIALS" → "API Key"
8. Copie a chave gerada (formato: `AIzaSy...`)

✅ **Pronto! Você tem 10.000 requisições/dia GRÁTIS**

---

### 🤖 OpenAI API (5 min)

1. Acesse: https://platform.openai.com/
2. Faça login (ou crie conta)
3. Vá em "API keys" no menu lateral
4. Clique em "Create new secret key"
5. Dê um nome: "ViralTicket"
6. Copie a chave (formato: `sk-...`)
   **⚠️ IMPORTANTE: Copie agora, não poderá ver depois!**
7. Adicione crédito inicial (mínimo $5)

✅ **Pronto! GPT-4o-mini custa ~$0.0005 por oferta**

---

## PASSO 2: Configurar no Projeto (2 min)

### Opção A: Arquivo .env (Recomendado para desenvolvimento)

1. Crie arquivo `.env` na raiz do projeto:

```bash
# Cole as chaves que você copiou
VITE_YOUTUBE_API_KEY=AIzaSyD...sua-chave-aqui
VITE_OPENAI_API_KEY=sk-...sua-chave-aqui
VITE_ENV=production
```

2. Salve o arquivo

3. Reinicie o servidor:
```bash
npm run dev
```

✅ **Pronto! Chaves configuradas via .env**

---

### Opção B: Painel Admin (Recomendado para produção)

1. Faça login: `tamara14@gmail.com`

2. Acesse: `http://localhost:5173/admin`

3. Vá em **"Chaves API"**

4. Clique em **"Nova Chave"**

5. Preencha:
   - Nome: "YouTube Data API #1"
   - Tipo: YouTube Data API
   - Chave: Cole sua chave do YouTube

6. Repita para OpenAI:
   - Nome: "OpenAI API #1"
   - Tipo: OpenAI API
   - Chave: Cole sua chave do OpenAI

✅ **Pronto! Chaves salvas e criptografadas**

---

## PASSO 3: Testar (3 min)

### 🎬 Teste 1: Extrair Comentários Reais

1. Vá para **Dashboard** → **YouTube Extractor**

2. Cole uma URL de vídeo popular:
   ```
   https://www.youtube.com/watch?v=dQw4w9WgXcQ
   ```

3. Clique em **"Extrair Comentários REAIS"**

4. ✅ **Resultado esperado:**
   - Comentários reais aparecem
   - Avatares dos autores
   - Likes reais
   - "✅ 50 comentários REAIS extraídos!"

---

### 🤖 Teste 2: Gerar Oferta com IA

1. Vá para **Dashboard** → **IA Chat**

2. Cole um comentário (ou use um extraído):
   ```
   Preciso emagrecer 10kg urgente para o verão!
   ```

3. Clique em **"Gerar Oferta REAL com IA"**

4. ✅ **Resultado esperado:**
   - Oferta criada por GPT-4o-mini
   - "✅ Oferta REAL gerada e salva no Kanban!"
   - ID do Firestore exibido

---

### 📊 Teste 3: Ver no Kanban

1. Vá para **Dashboard** → **Kanban**

2. ✅ **Resultado esperado:**
   - Ofertas salvas aparecem
   - Pode arrastar entre colunas
   - Botões de deletar e duplicar funcionam

---

## 🎉 PRONTO! SISTEMA 100% REAL

Se todos os testes passaram, você tem:

- ✅ YouTube API funcionando (comentários reais)
- ✅ OpenAI API funcionando (ofertas com IA)
- ✅ Firebase Firestore funcionando (dados salvos)
- ✅ CRUD completo (criar, ler, atualizar, deletar)
- ✅ Sistema pronto para usar!

---

## 🐛 PROBLEMAS COMUNS

### ❌ "Chave da API não configurada"

**Solução:** Verifique se:
- Arquivo `.env` foi criado corretamente
- Chaves foram salvas no painel admin
- Servidor foi reiniciado após criar `.env`

---

### ❌ "Erro ao buscar comentários"

**Solução:** Verifique se:
- Chave do YouTube está correta
- API está ativada no Google Cloud Console
- URL do vídeo está correta
- Vídeo tem comentários habilitados

---

### ❌ "Erro ao gerar oferta com IA"

**Solução:** Verifique se:
- Chave do OpenAI está correta
- Você tem créditos na conta OpenAI
- Não excedeu o rate limit (aguarde 1 min)

---

## 📊 QUOTA E LIMITES

### YouTube Data API v3
```
Gratuito:     10.000 unidades/dia
1 extração:   ~1 unidade
Total/dia:    ~10.000 extrações grátis
```

### OpenAI API (GPT-4o-mini)
```
Por oferta:   ~$0.0005 (meio centavo)
1.000 ofertas: ~$0.50 (50 centavos)
10.000 ofertas: ~$5.00
```

### Firebase Firestore
```
Leituras:     50.000/dia grátis
Escritas:     20.000/dia grátis
Armazenamento: 1 GB grátis
```

**Praticamente GRÁTIS para começar!** 🎉

---

## 🎯 PRÓXIMOS PASSOS

Agora que tudo está funcionando:

1. ✅ **Teste com vídeos reais**
   - Escolha vídeos do seu nicho
   - Extraia comentários
   - Analise os resultados

2. ✅ **Gere ofertas virais**
   - Use comentários reais
   - Teste diferentes prompts
   - Refine as ofertas geradas

3. ✅ **Organize no Kanban**
   - Mova ofertas entre colunas
   - Delete as não usadas
   - Duplique as melhores

4. ✅ **Monitore no Admin**
   - Veja estatísticas
   - Gerencie chaves
   - Confira logs

---

## 📞 SUPORTE

Tudo funcionando? **Parabéns! 🎉**

Problemas? Verifique:
- ✅ Chaves configuradas corretamente
- ✅ APIs ativadas nos consoles
- ✅ Créditos disponíveis
- ✅ Servidor reiniciado

---

**ViralTicket - APIs Reais v1.0**  
**Configuração concluída em: ~15 minutos**  
**Status: 🟢 OPERACIONAL**
