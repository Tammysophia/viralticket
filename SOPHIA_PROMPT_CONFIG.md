# 🔥 Configuração do Prompt da Sophia Fênix no Firestore

## 📋 **Como Funciona:**

O sistema agora busca o prompt do agente no **Firestore** antes de gerar ofertas:

1. ✅ Tenta buscar de `agent_templates/{agentId}` no Firestore
2. ✅ Se encontrar, usa o prompt salvo lá
3. ✅ Se não encontrar, usa fallback hardcoded no código
4. ✅ Estrutura correta: `system` (prompt) + `user` (comentários)

---

## 🗂️ **Estrutura no Firestore:**

### **Coleção:** `agent_templates`
### **Documento:** `sophia` (ou `sofia`)

```javascript
{
  prompt: "SEU PROMPT COMPLETO AQUI...",
  name: "Sophia Fênix",
  description: "Especialista em ofertas de alto impacto",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**OU:**

```javascript
{
  systemPrompt: "SEU PROMPT COMPLETO AQUI...",
  // ... resto dos campos
}
```

---

## 📝 **Exemplo de Prompt da Sophia:**

```
Você é Sophia Fênix, a maior especialista em criar ofertas irresistíveis que convertem.

ANÁLISE PROFUNDA:
1. Identifique o NICHO específico dos comentários
2. Encontre as DORES mais mencionadas
3. Descubra os DESEJOS ocultos
4. Mapeie as OBJEÇÕES que impedem a compra

CRIAÇÃO DA OFERTA:
1. Use LINGUAGEM do público (palavras que ELES usaram)
2. Promessa específica e mensurável
3. Benefícios tangíveis (não vagos)
4. Gatilhos mentais: urgência, escassez, prova social
5. CTA forte e direto

FORMATO DE RESPOSTA (APENAS JSON, sem markdown):
{
  "title": "Emoji + Promessa específica do nicho + Resultado mensurável",
  "subtitle": "Como [público] consegue [resultado] sem [objeção principal]",
  "bullets": [
    "✅ Benefício específico resolvendo dor 1",
    "✅ Diferencial único que resolve objeção 2",
    "✅ Resultado tangível e mensurável 3",
    "✅ Garantia ou segurança 4"
  ],
  "cta": "🚀 Ação urgente + verbo de ação + benefício",
  "bonus": "🎁 Bônus complementar e valioso (não genérico)"
}

REGRAS RÍGIDAS:
- NUNCA seja genérico
- SEMPRE mencione o nicho específico
- USE palavras dos comentários
- NÚMEROS e PRAZOS específicos
- SEM clichês como "transforme sua vida"
- CTA deve criar urgência real
```

---

## 🔧 **Como Configurar:**

### **Opção 1: Via Console Firebase**

1. Acesse: https://console.firebase.google.com/
2. Selecione seu projeto ViralTicket
3. Vá em **Firestore Database**
4. Crie coleção: `agent_templates`
5. Crie documento: `sophia`
6. Adicione campo: `prompt` (tipo: string)
7. Cole seu prompt completo
8. Salve

### **Opção 2: Via Código (Admin)**

```javascript
import { db } from './config/firebase';
import { doc, setDoc } from 'firebase/firestore';

const configurarPromptSophia = async () => {
  const prompt = `
    SEU PROMPT COMPLETO AQUI...
  `;
  
  await setDoc(doc(db, 'agent_templates', 'sophia'), {
    prompt: prompt.trim(),
    name: 'Sophia Fênix',
    description: 'Especialista em ofertas de alto impacto',
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  console.log('✅ Prompt configurado!');
};
```

---

## 📊 **Logs de Debug:**

Ao gerar uma oferta, você verá no console:

### **Se encontrou no Firestore:**
```
🔍 VT: Buscando prompt do agente "sophia" no Firestore...
✅ VT: Prompt encontrado para "sophia"
📋 VT: System prompt preparado (tamanho: 1250 caracteres)
💬 VT: Mensagens estruturadas (system + user)
📡 VT: Enviando requisição para OpenAI API...
```

### **Se NÃO encontrou (usando fallback):**
```
🔍 VT: Buscando prompt do agente "sophia" no Firestore...
⚠️ VT: Prompt não encontrado no Firestore para "sophia"
⚠️ VT: Usando prompt fallback (hardcoded)
📋 VT: System prompt preparado (tamanho: 156 caracteres)
```

---

## ✅ **Verificar se Está Funcionando:**

### **Teste 1: Com Prompt no Firestore**
1. Configure o prompt no Firestore
2. Gere uma oferta
3. Verifique logs: deve aparecer "✅ VT: Prompt encontrado"
4. Oferta deve estar personalizada conforme seu prompt

### **Teste 2: Sem Prompt (Fallback)**
1. Remova ou renomeie o documento `sophia` no Firestore
2. Gere uma oferta
3. Verifique logs: deve aparecer "⚠️ VT: Usando prompt fallback"
4. Oferta será gerada com prompt simplificado

---

## 🔄 **Formato da Resposta:**

O sistema aceita 2 formatos de JSON da IA:

### **Formato Simples (Recomendado):**
```json
{
  "title": "🔥 Título",
  "subtitle": "Subtítulo",
  "bullets": ["✅ 1", "✅ 2", "✅ 3", "✅ 4"],
  "cta": "🚀 CTA",
  "bonus": "🎁 Bônus"
}
```

### **Formato Completo (Convertido Automaticamente):**
```json
{
  "offer": {
    "headline": "Título",
    "subheadline": "Subtítulo",
    "benefits": ["1", "2", "3", "4"],
    "cta": "CTA",
    "bonus": "Bônus"
  }
}
```

Se a IA retornar o formato completo, o sistema converte automaticamente para o formato simples.

---

## 🧹 **Parse Automático:**

O sistema remove automaticamente:
- ` ```json ` no início
- ` ``` ` no final
- Espaços extras
- Quebras de linha desnecessárias

**Exemplo:**
```
```json
{
  "title": "Teste"
}
```
```

É convertido automaticamente para:
```json
{
  "title": "Teste"
}
```

---

## ⚙️ **Parâmetros OpenAI:**

```javascript
{
  model: 'gpt-4o',         // Modelo mais recente
  temperature: 0.0,        // Determinístico (sempre similar)
  max_tokens: 2500,        // Respostas completas
  messages: [
    {
      role: 'system',      // Seu prompt do Firestore
      content: systemPrompt
    },
    {
      role: 'user',        // Comentários do YouTube
      content: comments
    }
  ]
}
```

---

## 💡 **Dicas para o Prompt:**

### **✅ BOM:**
```
"Identifique o nicho específico"
"Use palavras que ELES usaram"
"Benefícios mensuráveis"
"Promessa com prazo"
```

### **❌ EVITE:**
```
"Seja criativo"
"Pense fora da caixa"
"Use sua imaginação"
(Muito vago!)
```

---

## 🚀 **Próximos Passos:**

1. ✅ Configure seu prompt no Firestore
2. ✅ Teste gerando uma oferta
3. ✅ Verifique logs no console
4. ✅ Ajuste o prompt conforme resultados
5. ✅ Repita até encontrar o prompt perfeito

---

## 🆘 **Troubleshooting:**

### **Erro: "Prompt não encontrado"**
- Verifique se o documento existe em `agent_templates/sophia`
- Verifique se o campo se chama `prompt` ou `systemPrompt`
- Verifique as regras do Firestore (permissão de leitura)

### **Erro: "Erro ao parsear JSON"**
- Seu prompt pode estar gerando texto ao invés de JSON
- Adicione no prompt: "Retorne APENAS JSON, sem explicações"
- Verifique os primeiros 300 chars no log para ver o que a IA retornou

### **Oferta genérica**
- Seu prompt precisa ser mais específico
- Adicione instruções de análise profunda
- Peça para usar linguagem do público
- Exemplos no prompt ajudam muito!

---

**Agora seu prompt está no Firestore e pode ser editado sem mexer no código!** 🎉
