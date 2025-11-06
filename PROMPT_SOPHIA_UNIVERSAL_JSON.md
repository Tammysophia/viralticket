# 🔥 Configurar QUALQUER IA para Funcionar no Sistema

## 📋 **VOCÊ TEM 2 AGENTES IA:**

O sistema suporta múltiplos agentes IA. Configure cada um no Firestore:

- **`sophia`** → Sophia Universal (seu prompt de 48k caracteres)
- **`sofia`** → Sofia (qualquer outro prompt que você quiser)
- **`outro-agente`** → Qualquer outro nome que quiser criar

---

## ✅ **REGRA ÚNICA PARA TODAS AS IAs:**

**TODO prompt de IA PRECISA retornar JSON no final!**

Adicione isso **NO FINAL** de QUALQUER prompt:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 🎯 JSON PARA SISTEMA (OBRIGATÓRIO)

IMPORTANTE: Ao final de TODA a análise/resposta, retorne este JSON:

```json
{
  "title": "[Título da oferta principal - com emoji]",
  "subtitle": "[Promessa/subtítulo da oferta]",
  "bullets": [
    "✅ [Benefício 1]",
    "✅ [Benefício 2]",
    "✅ [Benefício 3]",
    "✅ [Benefício 4]"
  ],
  "cta": "[Call to action - ex: QUERO AGORA!]",
  "bonus": "[Bônus incluído]"
}
```
```

---

## 🎯 **EXEMPLO 1: SOPHIA UNIVERSAL (Prompt Gigante)**

Seu prompt completo de 48.647 caracteres + adicione no final:

```
[... TODO SEU PROMPT DA SOPHIA UNIVERSAL (1-7 seções) ...]

### 🎨 ESCOLHA SEUS FORMATOS DE ENTREGA
[... instruções sobre WordPress/Quiz/IA Builder ...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 🎯 JSON PARA SISTEMA (OBRIGATÓRIO)

Ao final de TODA a análise das 7 seções, retorne este JSON com os dados da OFERTA CAMPEÃ (seção 4️⃣):

```json
{
  "title": "[Título da oferta campeã selecionada]",
  "subtitle": "[Promessa principal da oferta campeã]",
  "bullets": [
    "✅ [Benefício desbloqueado 1]",
    "✅ [Benefício desbloqueado 2]",
    "✅ [Benefício desbloqueado 3]",
    "✅ [Benefício desbloqueado 4]"
  ],
  "cta": "[CTA da oferta campeã - ex: QUERO ME TRANSFORMAR AGORA!]",
  "bonus": "[Bônus exclusivo da oferta campeã]"
}
```
```

---

## 🎯 **EXEMPLO 2: SOFIA (Prompt Simples)**

Se você tem outro agente IA (exemplo: "sofia"), faça o mesmo:

```
Você é Sofia, especialista em criar ofertas irresistíveis.

Analise os comentários do YouTube e:
1. Identifique as dores principais
2. Encontre os desejos ocultos
3. Crie uma oferta low-ticket (R$7-97)

[... resto do seu prompt ...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 🎯 JSON PARA SISTEMA (OBRIGATÓRIO)

Ao final, retorne este JSON:

```json
{
  "title": "[Título da oferta]",
  "subtitle": "[Promessa]",
  "bullets": [
    "✅ [Benefício 1]",
    "✅ [Benefício 2]",
    "✅ [Benefício 3]",
    "✅ [Benefício 4]"
  ],
  "cta": "[CTA]",
  "bonus": "[Bônus]"
}
```
```

---

## 🎯 **O QUE ISSO FAZ:**

1. ✅ IA faz TODA a análise completa (48k caracteres)
2. ✅ No FINAL retorna o JSON simples
3. ✅ O sistema extrai o JSON automaticamente
4. ✅ A oferta aparece no painel
5. ✅ Você pode ver a análise completa no console (F12)

---

## 🔧 **ONDE ADICIONAR NO FIREBASE:**

### **Para Sophia Universal:**
1. Firebase Console → Firestore
2. Coleção: `agent_templates`
3. Documento: `sophia`
4. Campo: `prompt`
5. **NO FINAL** do campo `prompt`, cole a seção JSON acima
6. Salve

### **Para Sofia (ou outro agente):**
1. Firebase Console → Firestore
2. Coleção: `agent_templates`
3. Documento: `sofia` (ou o nome do agente)
4. Campo: `prompt`
5. **NO FINAL** do campo `prompt`, cole a seção JSON acima
6. Salve

### **Estrutura no Firestore:**
```
agent_templates/
├── sophia/
│   ├── name: "Sophia Universal"
│   ├── description: "IA completa para ofertas virais"
│   └── prompt: "[SEU PROMPT GIGANTE] + [SEÇÃO JSON NO FINAL]"
│
└── sofia/
    ├── name: "Sofia"
    ├── description: "IA alternativa"
    └── prompt: "[SEU PROMPT] + [SEÇÃO JSON NO FINAL]"
```

---

## ✅ **RESULTADO ESPERADO:**

A IA vai retornar algo assim:

```
### 1️⃣ DIAGNÓSTICO...
[toda análise completa]

### 2️⃣ 10 OFERTAS...
[10 ofertas detalhadas]

### 3️⃣ 3 OFERTAS MESTRES...
[3 selecionadas]

### 4️⃣ OFERTA CAMPEÃ...
[estrutura completa]

━━━━━━━━━━━━━━━━━━━━━━

### 🎯 JSON PARA SISTEMA

```json
{
  "title": "🔥 Ritual de Libertação Emocional em 7 Dias",
  "subtitle": "Transforme sua dor em liberdade emocional...",
  "bullets": [
    "✅ Ritual completo passo a passo...",
    "✅ Meditações guiadas diárias...",
    "✅ Grupo de suporte exclusivo...",
    "✅ Garantia de 7 dias ou dinheiro de volta"
  ],
  "cta": "🚀 QUERO ME LIBERTAR AGORA!",
  "bonus": "🎁 BÔNUS: Guia Anti-Recaída + 30 Afirmações de Poder"
}
```
```

E o sistema vai:
1. ✅ Mostrar o JSON no painel
2. ✅ Salvar no Kanban
3. ✅ Logar análise completa no console

---

## 🧪 **TESTAR:**

1. Vá em Firestore e adicione o JSON no final dos seus prompts
2. No sistema, extraia comentários do YouTube
3. Clique em "Gerar Oferta com IA"
4. Abra o console (F12) e veja os logs:
   - `📝 VT: Tentando parsear JSON...`
   - `✅ VT: JSON extraído com sucesso!`
   - `✅ VT: Oferta gerada com sucesso!`

---

## ❓ **O QUE ACONTECE SE NÃO ADICIONAR O JSON?**

Se você NÃO adicionar a seção JSON no final:
- ✅ O sistema tentará extrair JSON automaticamente da resposta
- ✅ Se não achar, criará uma oferta genérica com link para ver análise completa no console
- ⚠️ Mas é SEMPRE melhor adicionar o JSON para garantir precisão!

---

## 🔥 **RESUMO SIMPLES:**

1. ✅ Abra Firestore → `agent_templates` → `sophia` (ou `sofia`)
2. ✅ Vá até o FINAL do campo `prompt`
3. ✅ Cole a seção JSON (do exemplo acima)
4. ✅ Salve
5. ✅ Teste gerando oferta
6. ✅ Funciona! 🎉

**Faça isso para TODOS os agentes IA que você criar!** 🎯