# 🔥 Prompt Sophia Universal - COM JSON NO FINAL

## ✅ **SOLUÇÃO:**

Adicione isso **NO FINAL DO SEU PROMPT** no Firestore:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 🎯 JSON PARA SISTEMA (OBRIGATÓRIO)

IMPORTANTE: Ao final de TODA a análise acima, retorne também este JSON para integração com o sistema:

```json
{
  "title": "[Título da oferta campeã selecionada - com emoji]",
  "subtitle": "[Subtítulo/promessa principal da oferta campeã]",
  "bullets": [
    "✅ [Benefício principal 1 da oferta campeã]",
    "✅ [Benefício principal 2 da oferta campeã]",
    "✅ [Benefício principal 3 da oferta campeã]",
    "✅ [Benefício principal 4 da oferta campeã]"
  ],
  "cta": "[Call to action da oferta campeã]",
  "bonus": "[Bônus principal da oferta campeã]"
}
```

Este JSON deve conter APENAS os dados da OFERTA CAMPEÃ selecionada na seção 4️⃣.
```

---

## 📋 **COMO FICA:**

Seu prompt completo (48.647 caracteres) + no final adiciona:

```
[... todo seu prompt da Sophia Universal ...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 🎯 JSON PARA SISTEMA (OBRIGATÓRIO)

Ao final de toda a análise, retorne este JSON com os dados da OFERTA CAMPEÃ:

```json
{
  "title": "[Título da oferta campeã]",
  "subtitle": "[Promessa da oferta campeã]",
  "bullets": [
    "✅ [Benefício 1]",
    "✅ [Benefício 2]",
    "✅ [Benefício 3]",
    "✅ [Benefício 4]"
  ],
  "cta": "[CTA da oferta campeã]",
  "bonus": "[Bônus da oferta campeã]"
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

## 🔧 **ONDE ADICIONAR:**

1. Firebase Console → Firestore → `agent_templates` → `sophia`
2. **NO FINAL** do campo `prompt`, adicione o texto acima
3. Salve
4. Teste gerando uma oferta

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

**Adicione isso no final do seu prompt e vai funcionar perfeitamente!** 🎯