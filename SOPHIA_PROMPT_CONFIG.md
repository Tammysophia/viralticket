# 🔥 Configuração do Prompt da Sophia Fênix no Firestore

## 📋 Como Configurar

### 1️⃣ Acessar Firestore Console
- Acesse: https://console.firebase.google.com/
- Selecione seu projeto ViralTicket
- Vá em **Firestore Database**

### 2️⃣ Criar Collection `agent_templates`
Se ainda não existir, crie a collection:
- Clique em **Start collection**
- Nome: `agent_templates`

### 3️⃣ Criar Documento `sophia`
- Dentro de `agent_templates`, clique em **Add document**
- **Document ID**: `sophia`
- Adicione o campo:
  - **Campo**: `prompt` (tipo: string)
  - **Valor**: Cole o prompt completo abaixo

---

## 📝 PROMPT COMPLETO DA SOPHIA FÊNIX

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

---

## 🔄 Configurar Sofia Universal (Opcional)

Repita o processo para criar outro documento:
- **Document ID**: `sofia`
- **Campo**: `prompt` (tipo: string)
- **Valor**: Prompt customizado da Sofia

---

## ✅ Como Verificar se Está Funcionando

### No Console do Navegador:
Quando você gerar uma oferta, verá logs assim:

```
🔍 VT: Buscando prompt do agente "sophia" no Firestore...
✅ VT: Prompt encontrado para "sophia" { hasPrompt: true }
🔑 VT: API Key obtida com sucesso
📋 VT: System prompt preparado (tamanho: 1234 caracteres)
💬 VT: Mensagens estruturadas: { systemLength: 1234, userLength: 56 }
📡 VT: Enviando requisição para OpenAI API...
📥 VT: Resposta recebida. Status: 200
📄 VT: Conteúdo recebido da IA (primeiros 300 chars): {...
📝 VT: Tentando parsear JSON da resposta da IA...
✅ VT: JSON parseado com sucesso!
✅ VT: Oferta gerada com sucesso!
```

### Se o Prompt NÃO for Encontrado:
Você verá:
```
⚠️ VT: Documento "agent_templates/sophia" não encontrado no Firestore
⚠️ VT: Usando prompt fallback (hardcoded)
```

Isso significa que o sistema está usando o prompt fixo no código (fallback), mas ainda funcionará normalmente.

---

## 🛡️ Tratamento de Erros Implementado

### 1. Prompt não encontrado → Usa fallback hardcoded ✅
### 2. JSON com markdown → Remove automaticamente ✅
### 3. Erro ao parsear JSON → Mensagem amigável ✅
### 4. API Key não configurada → Mensagem clara ✅
### 5. Erro da OpenAI → Log detalhado + mensagem user-friendly ✅

---

## 📊 Parâmetros da OpenAI Configurados

- **Modelo**: `gpt-4o` (GPT-4 Optimized)
- **Temperature**: `0.0` (respostas determinísticas)
- **Max Tokens**: `2500` (respostas completas)

---

## 🎯 Fluxo Completo Implementado

1. ✅ Usuário escolhe agente (Sophia/Sofia) e digita comentário
2. ✅ Sistema busca prompt do Firestore (`agent_templates/{agentId}`)
3. ✅ Se não encontrar → usa prompt fallback
4. ✅ Chama OpenAI com estrutura: `system` (prompt) + `user` (comentário)
5. ✅ Recebe resposta e remove markdown ```json``` se necessário
6. ✅ Parseia JSON com validação
7. ✅ Se erro → exibe mensagem amigável
8. ✅ Se sucesso → salva oferta no Firestore via `createOfferFromAI()`
9. ✅ Incrementa contador de uso diário
10. ✅ Exibe oferta na UI

---

## 🐛 Debug no Console

Todos os logs começam com **`VT:`** para facilitar filtragem:

```javascript
// No console do navegador:
console.log('%c VT', 'color: #8B5CF6; font-weight: bold')
```

Isso ajuda a identificar rapidamente logs do ViralTicket vs outros logs.

---

## 🎉 Pronto!

Agora o sistema de geração de ofertas está:
- ✅ Buscando prompts do Firestore
- ✅ Com fallback seguro
- ✅ Parse robusto de JSON
- ✅ Logs detalhados para debug
- ✅ Tratamento de erros amigável
- ✅ Salvando ofertas no Firestore
- ✅ Respeitando limites diários

**Nada foi quebrado!** Tudo que já funcionava continua funcionando. 🚀
