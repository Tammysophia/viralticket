# 🔥 Como Configurar o Prompt da Sophia no Firestore

## ❌ **PROBLEMA ATUAL:**

Seu prompt no Firestore está retornando **ANÁLISE COMPLETA EM MARKDOWN**, não JSON simples:

```
### 1️⃣ DIAGNÓSTICO PROFUNDO
💔 Diagnóstico...
10 micro-ofertas...
(48.647 caracteres!)
```

O sistema precisa de **JSON SIMPLES**:
```json
{
  "title": "...",
  "subtitle": "...",
  "bullets": ["...", "...", "...", "..."],
  "cta": "...",
  "bonus": "..."
}
```

---

## ✅ **SOLUÇÃO: Atualizar Prompt no Firestore**

### **Passo 1: Acesse o Firestore**

1. Firebase Console: https://console.firebase.google.com/
2. Selecione seu projeto
3. Firestore Database
4. Coleção: `agent_templates`
5. Documento: `sophia`

### **Passo 2: Substitua o campo `prompt` por este:**

```
Você é Sophia Fênix, a maior especialista em criar ofertas irresistíveis de alto impacto.

MISSÃO: Analisar os comentários fornecidos e criar UMA oferta ultra-personalizada.

INSTRUÇÕES CRÍTICAS:
1. Identifique o NICHO específico dos comentários (relacionamentos, emagrecimento, negócios, etc)
2. Encontre as 3 DORES mais mencionadas
3. Identifique os DESEJOS ocultos do público
4. Use EXATAMENTE a linguagem que ELES usaram
5. Seja ESPECÍFICO do nicho (NUNCA genérico!)
6. Crie URGÊNCIA real baseada nas dores
7. Benefícios devem ser MENSURÁVEIS e TANGÍVEIS

ESTRUTURA DA OFERTA:
- Title: Emoji + Promessa específica + Resultado mensurável em prazo
- Subtitle: Como [público] consegue [resultado] sem [objeção principal]
- Bullets: 4 benefícios específicos resolvendo dores reais
- CTA: Verbo de ação + urgência + benefício principal
- Bonus: Bônus complementar específico do nicho

EXEMPLOS DE QUALIDADE:

Nicho: Emagrecimento
{
  "title": "🔥 Elimine até 7kg em 21 dias SEM Passar Fome ou Ir pra Academia",
  "subtitle": "O método que 3.847 mulheres usaram para perder barriga sem dietas restritivas ou exercícios pesados",
  "bullets": [
    "✅ Cardápio flexível - coma o que gosta e ainda emagreça (mesmo que já tenha tentado 10 dietas antes)",
    "✅ Receitas práticas prontas em 15min (perfeito para quem não tem tempo)",
    "✅ Grupo VIP com nutricionista respondendo suas dúvidas todos os dias",
    "✅ Garantia de 7 dias - não funcionou? Devolvo 100% do seu dinheiro"
  ],
  "cta": "🚀 QUERO ELIMINAR A BARRIGA SEM PASSAR FOME!",
  "bonus": "🎁 BÔNUS: Guia de Compras no Supermercado + 30 Receitas Fit que Emagrecem"
}

Nicho: Marketing Digital
{
  "title": "💰 Atraia 10-20 Clientes Qualificados Por Dia SEM Gastar R$1 com Anúncios",
  "subtitle": "O sistema exato que 1.200+ pequenos negócios usam para aparecer no Google e vender orgânico todo dia",
  "bullets": [
    "✅ Passo a passo para ranquear no Google em 30 dias (mesmo começando do zero total)",
    "✅ 100 templates prontos de posts que convertem seguidores em clientes pagantes",
    "✅ Funil automatizado que vende 24h (mesmo enquanto você dorme)",
    "✅ Suporte direto comigo por 60 dias para tirar TODAS as suas dúvidas"
  ],
  "cta": "🎯 QUERO ATRAIR CLIENTES QUALIFICADOS AGORA!",
  "bonus": "🎁 BÔNUS EXCLUSIVO: 50 Headlines Matadoras + Script de Vendas para WhatsApp"
}

FORMATO DE SAÍDA (OBRIGATÓRIO):
Retorne APENAS um objeto JSON válido, sem markdown, sem explicações, sem análises.
Estrutura EXATA:
{
  "title": "string",
  "subtitle": "string", 
  "bullets": ["string", "string", "string", "string"],
  "cta": "string",
  "bonus": "string"
}

REGRAS RÍGIDAS:
❌ NUNCA retorne markdown (###, **, etc)
❌ NUNCA faça análise antes do JSON
❌ NUNCA seja genérico
❌ NUNCA use clichês como "transforme sua vida"
✅ SEMPRE use números específicos
✅ SEMPRE mencione o nicho identificado
✅ SEMPRE use palavras dos comentários
✅ SEMPRE retorne APENAS o JSON
```

### **Passo 3: Salve e Teste**

1. Clique em "Salvar"
2. Recarregue a página do ViralTicket (F5)
3. Tente gerar uma oferta
4. Verifique o console - deve ver:
   ```
   ✅ VT: JSON parseado com sucesso!
   ```

---

## 🔧 **ALTERNATIVAMENTE: Script Rápido**

Cole no Console Firebase:

```javascript
// Execute no Console do Firebase (Rules → Console)
const admin = require('firebase-admin');
const db = admin.firestore();

const promptSophia = `
SEU PROMPT AQUI (copie do exemplo acima)
`;

db.collection('agent_templates').doc('sophia').set({
  prompt: promptSophia.trim(),
  name: 'Sophia Fênix',
  description: 'Especialista em ofertas de alto impacto',
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
  updatedAt: admin.firestore.FieldValue.serverTimestamp()
});

console.log('✅ Prompt atualizado!');
```

---

## 📊 **DIFERENÇA:**

### **❌ SEU PROMPT ATUAL (48.647 caracteres):**
```
Retorna:
### 1️⃣ DIAGNÓSTICO PROFUNDO
💔 Diagnóstico...
10 micro-ofertas...
3 ofertas selecionadas...
Estrutura completa...
```

### **✅ PROMPT CORRETO (mais curto e direto):**
```
Retorna APENAS:
{
  "title": "🔥 Título específico...",
  "subtitle": "Como X consegue Y sem Z",
  "bullets": ["✅ 1", "✅ 2", "✅ 3", "✅ 4"],
  "cta": "🚀 AÇÃO URGENTE!",
  "bonus": "🎁 Bônus específico"
}
```

---

## 🎯 **IMPORTANTE:**

O prompt DEVE incluir:
- ✅ "Retorne APENAS JSON"
- ✅ "Sem markdown, sem explicações"
- ✅ Estrutura exata do JSON
- ✅ Exemplos de qualidade
- ✅ Regras rígidas no final

---

## 🚀 **TESTE RÁPIDO:**

Depois de atualizar o prompt:

1. Gere uma oferta
2. Veja no console:
   - ✅ `JSON parseado com sucesso!` = Funcionou!
   - ❌ `Erro ao parsear JSON` = Prompt ainda errado

---

## 💡 **DICA:**

Mantenha o prompt **FOCADO** em retornar JSON simples.

Se quiser análise completa, crie OUTRO agente (exemplo: `sophia-analise`) com o prompt complexo.

Use `sophia` para geração rápida de ofertas (JSON simples).

---

**Atualize o prompt e teste novamente!** 🔥
