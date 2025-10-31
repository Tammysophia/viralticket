# 🔥 GUIA SUPER SIMPLES - Configurar Prompt no Firebase

## ⚠️ IMPORTANTE: Isso é OPCIONAL!

**O sistema JÁ FUNCIONA sem fazer isso!** 🎉

Se você NÃO configurar o prompt no Firebase:
- ✅ O sistema vai usar um prompt padrão (fallback)
- ✅ As ofertas serão geradas normalmente
- ✅ Tudo vai funcionar!

**Por que configurar no Firebase então?**
- Para poder EDITAR o prompt sem mexer no código
- Para ter prompts diferentes para cada agente (Sophia, Sofia, etc)

---

## 📋 PASSO A PASSO (5 minutos)

### PASSO 1: Entrar no Firebase Console

1. Abra seu navegador
2. Acesse: https://console.firebase.google.com/
3. Faça login com sua conta Google
4. Clique no seu projeto **ViralTicket**

---

### PASSO 2: Ir para o Firestore Database

1. No menu lateral esquerdo, procure por **"Firestore Database"**
2. Clique nele
3. Você vai ver uma tela com suas coleções (users, offers, apiKeys, etc)

---

### PASSO 3: Criar a Collection "agent_templates"

**SE JÁ EXISTIR** uma collection chamada `agent_templates`:
- Pule para o PASSO 4

**SE NÃO EXISTIR:**

1. Clique no botão **"Start collection"** (ou "+ Start collection")
2. Digite o nome: `agent_templates`
3. Clique em **"Next"**
4. Na tela "Add first document":
   - Document ID: `sophia`
   - Clique em **"Add field"**
   - Field name: `prompt`
   - Type: `string`
   - Value: Cole o prompt (veja PASSO 4)
5. Clique em **"Save"**

---

### PASSO 4: Adicionar o Documento "sophia"

**SE A COLLECTION JÁ EXISTIR:**

1. Clique na collection `agent_templates`
2. Clique em **"Add document"**
3. Preencha:
   - **Document ID**: `sophia` (exatamente assim, minúsculo)
   - Clique em **"Add field"**
   - **Field**: `prompt`
   - **Type**: `string` (selecione "string" no dropdown)
   - **Value**: Cole o texto abaixo ⬇️

---

### 📝 PROMPT PARA COLAR:

**COPIE TUDO DAQUI:**

```
Você é **Sophia Fênix**, uma IA especialista em transformar comentários emocionais em ofertas digitais de alto impacto.

INSTRUÇÕES INTERNAS (NÃO MOSTRAR AO USUÁRIO):

1️⃣ Analise o texto do usuário (mensagem de role "user") e aplique o protocolo:
   - Diagnóstico profundo
   - Geração de micro-ofertas
   - Seleção das 3 melhores ofertas
   - Desenvolvimento da oferta campeã
   - Estrutura do ebook
   - Criação do quiz
   - Criativos e CTA

2️⃣ Responda **exclusivamente em JSON válido**.  
   ❌ NÃO use Markdown, ❌ NÃO escreva texto fora do JSON.  
   ✅ O JSON deve seguir exatamente o formato abaixo:

{
  "agent":"sophia",
  "diagnostic": {
    "field": "texto curto",
    "interpretation": "texto breve explicando a dor",
    "attachmentType": "tipo de apego",
    "urgencyLevel": "high|medium|low"
  },
  "microOffers":[
    {"name":"", "promise":"", "whyConvert":"", "urgency":"", "priceSuggestion":""}
  ],
  "top3":[
    {"name":"", "why":"", "urgency":"", "marketSize":"small|medium|large"}
  ],
  "championOffer":{
    "name":"",
    "headline":"",
    "subheadline":"",
    "benefits":[ "benefit1", "benefit2" ],
    "objections":[ "objection + copy para quebrar" ],
    "price": "R$47",
    "valueAnchoring": "R$311",
    "cta":"[COMEÇAR AGORA]",
    "deliverables":[ "ebook", "quiz", "template_page" ]
  },
  "ebookOutline":[ "Capítulo 1", "Capítulo 2", "..." ],
  "quizQuestions":[ "q1", "q2", "..." ],
  "creativeSuggestions": {
    "palette":["#8B5CF6","#EC4899","#10B981"],
    "mainMockup":"descrição visual",
    "shortCopies":[ "frase1", "frase2" ]
  }
}

3️⃣ Se algo der errado, devolva:
{ "error": "descrição breve do problema" }

4️⃣ Fale sempre no tom estratégico, emocional e empático característico da Sophia Fênix.
```

**ATÉ AQUI ⬆️**

---

### PASSO 5: Salvar

1. Depois de colar o prompt no campo `prompt`
2. Clique no botão **"Save"** (ou "Salvar")
3. Pronto! ✅

---

## 🎯 RESULTADO FINAL NO FIRESTORE:

Você deve ter essa estrutura:

```
📂 Firestore Database
  └─ 📁 agent_templates
      └─ 📄 sophia
          └─ prompt: "Você é **Sophia Fênix**..."
```

---

## ✅ COMO SABER SE FUNCIONOU?

### Opção 1: Olhar os Logs no Console

1. Abra seu ViralTicket no navegador
2. Abra o Console (F12)
3. Vá na aba "AI Chat"
4. Gere uma oferta
5. Procure no console por:

**SE CONFIGUROU:**
```
✅ VT: Prompt encontrado para "sophia" { hasPrompt: true }
```

**SE NÃO CONFIGUROU:**
```
⚠️ VT: Documento "agent_templates/sophia" não encontrado no Firestore
⚠️ VT: Usando prompt fallback (hardcoded)
```

### Opção 2: Testar Geração de Oferta

1. Login no ViralTicket
2. Ir em "AI Chat"
3. Selecionar "Sophia Fênix"
4. Digitar qualquer comentário
5. Clicar em "Gerar"
6. **Se funcionou**: Oferta é gerada normalmente! ✅

---

## ❓ DÚVIDAS FREQUENTES

### 1. "Não achei o Firestore Database"

- Verifique se você está no projeto correto (ViralTicket)
- Procure no menu lateral esquerdo
- Pode estar como "Firestore" ou "Cloud Firestore"

### 2. "Não consigo criar collection"

- Você precisa ser Owner ou Editor do projeto
- Se for Viewer, peça para alguém com permissão fazer

### 3. "O que acontece se eu não fizer isso?"

- **NADA!** O sistema funciona normalmente
- Ele usa o prompt padrão que está no código

### 4. "Posso editar o prompt depois?"

- **SIM!** É exatamente para isso que serve
- Basta ir no Firestore, clicar no documento `sophia` e editar o campo `prompt`

### 5. "E a Sofia Universal?"

- Se quiser, repita o processo:
- Document ID: `sofia`
- Campo `prompt` com o prompt da Sofia
- Mas isso é opcional também!

---

## 🆘 SE DER ERRO

### "Permissões insuficientes"

Suas regras do Firestore precisam permitir leitura de `agent_templates`:

```
allow read: if request.auth != null;
```

Mas isso provavelmente já está configurado!

---

## 🎉 PRONTO!

Agora você pode:

✅ Gerar ofertas normalmente (com ou sem configurar)
✅ Editar o prompt diretamente no Firebase (se configurou)
✅ Ver logs detalhados no console

---

## 📌 LEMBRE-SE:

### Configurar no Firebase = OPCIONAL! 🎯

O sistema **JÁ FUNCIONA** sem isso!

Só configure se você quiser:
- Editar prompts sem mexer no código
- Ter controle total sobre o comportamento da IA

---

**Alguma dúvida? Me pergunte! 😊**
