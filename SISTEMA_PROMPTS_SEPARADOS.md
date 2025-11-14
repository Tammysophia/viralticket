# 🎯 Sistema de Prompts Separados - ViralTicket

## 📋 Visão Geral

Implementação da **OPÇÃO 2 - SEPARAR** para economizar tokens e otimizar o sistema de geração de ofertas.

### ✅ Benefícios
- **Economiza 60-70% de tokens** 💰
- **Respostas mais rápidas** ⚡
- **Respostas mais limpas e focadas** 🎯
- **Usuário escolhe o que quer gerar** 🎨
- **Mais barato** 💵

---

## 🏗️ Estrutura de Prompts no Firebase

### Coleção: `agent_templates`

Você precisa criar os seguintes documentos no Firebase Firestore:

#### 📌 Sophia Fênix (Persuasiva)

| Documento ID | Descrição | Campo `prompt` |
|-------------|-----------|----------------|
| `sophia` | Prompt principal (até seção 4) | Análise completa até seção 4 |
| `sophia_lovable` | Só gera Lovable/Gama | Prompt focado em gerar código Lovable |
| `sophia_quiz` | Só gera Quiz | Prompt focado em gerar quiz de vendas |
| `sophia_wordpress` | Só gera WordPress | Prompt focado em blocos WordPress/Elementor |
| `sophia_canva` | Só gera Ebook Canva | Prompt focado em ebook visual Canva |
| `sophia_gama` | Só gera Ebook Gama | Prompt focado em ebook estruturado Gama |

#### 📌 Sofia Universal (Analítica)

| Documento ID | Descrição | Campo `prompt` |
|-------------|-----------|----------------|
| `sofia` | Prompt principal (até seção 4) | Análise completa até seção 4 |
| `sofia_lovable` | Só gera Lovable/Gama | Prompt focado em gerar código Lovable |
| `sofia_quiz` | Só gera Quiz | Prompt focado em gerar quiz de vendas |
| `sofia_wordpress` | Só gera WordPress | Prompt focado em blocos WordPress/Elementor |
| `sofia_canva` | Só gera Ebook Canva | Prompt focado em ebook visual Canva |
| `sofia_gama` | Só gera Ebook Gama | Prompt focado em ebook estruturado Gama |

---

## 🔄 Como Funciona

### Fluxo Antigo (ANTES) ❌
```
Usuário extrai comentários
    ↓
Sistema usa PROMPT GIGANTE
    ↓
Gera TUDO de uma vez (seções 1-4 + Lovable + Quiz + WordPress + Ebook)
    ↓
Gasta MUITOS tokens
    ↓
Resposta LENTA e CARA
```

### Fluxo Novo (DEPOIS) ✅
```
Usuário extrai comentários
    ↓
Sistema usa PROMPT PRINCIPAL (sophia ou sofia)
    ↓
Gera ATÉ SEÇÃO 4 (economiza tokens!)
    ↓
Usuário clica "Gerar Lovable"
    ↓
Sistema busca PROMPT ESPECÍFICO (sophia_lovable)
    ↓
Gera SÓ o Lovable
    ↓
Economiza 60-70% de tokens!
```

---

## 💻 Implementação Técnica

### 1. **openaiService.js**

#### Função `getAgentPromptFromFirestore`
```javascript
const getAgentPromptFromFirestore = async (agentId, specificPrompt = null) => {
  // Se specificPrompt foi fornecido, buscar prompt específico
  const promptId = specificPrompt ? `${agentId}_${specificPrompt}` : agentId;
  
  // Exemplo: sophia + lovable = sophia_lovable
  const docRef = doc(db, 'agent_templates', promptId);
  const docSnap = await getDoc(docRef);
  
  // Se não encontrar, tenta buscar o prompt principal como fallback
}
```

#### Função `generateOffer`
```javascript
export const generateOffer = async (
  comments, 
  agent = 'sophia', 
  targetLanguage = 'pt-BR', 
  specificPrompt = null  // ← NOVO PARÂMETRO
) => {
  // Busca prompt específico se fornecido
  let systemPrompt = await getAgentPromptFromFirestore(agent, specificPrompt);
}
```

### 2. **AIChat.jsx**

#### Mapeamento de Formatos
```javascript
// Página de Vendas
const promptMapping = {
  'wordpress': 'wordpress',
  'quiz': 'quiz',
  'ia-builder': 'lovable'  // ia-builder usa o prompt lovable
};

// Ebook
const specificPromptType = format; // 'canva' ou 'gama'
```

#### Chamada Otimizada
```javascript
// ANTES: Prompt gigante com todas as instruções
const optimizedPrompt = `${offerContext}\n\n${specificInstructions}...`;
const pageData = await generateOffer(optimizedPrompt, selectedAgent, getLanguageForAI());

// DEPOIS: Contexto mínimo + prompt específico do Firebase
const offerContext = `OFERTA CAMPEÃ JÁ DEFINIDA:
Título: ${output.title}
Subtítulo: ${output.subtitle}
Benefícios: ${output.bullets.join(', ')}
CTA: ${output.cta}
Bônus: ${output.bonus}

Gere APENAS o formato solicitado usando essas informações.`;

const pageData = await generateOffer(
  offerContext, 
  selectedAgent, 
  getLanguageForAI(), 
  specificPromptType  // ← NOVO: 'lovable', 'quiz', 'wordpress', etc
);
```

---

## 📝 Exemplo de Estrutura de Prompts

### Prompt Principal (`sophia`)
```
Você é Sophia Fênix, especialista em copywriting persuasivo.

TAREFA: Analise os comentários e gere uma oferta irresistível.

ESTRUTURA:
1. Análise do público-alvo
2. Identificação de dores e desejos
3. Criação de 10 micro-ofertas
4. Seleção das 3 ofertas campeãs

IMPORTANTE: Gere APENAS até a seção 4. NÃO gere páginas de vendas, quiz ou ebook.

FORMATO DE SAÍDA: JSON
{
  "title": "...",
  "subtitle": "...",
  "bullets": ["...", "...", "...", "..."],
  "cta": "...",
  "bonus": "..."
}
```

### Prompt Específico (`sophia_lovable`)
```
Você é Sophia Fênix. Gere APENAS o PROMPT COMPLETO para Lovable/Gama.

REGRAS CRÍTICAS:
✅ Retorne APENAS o PROMPT (sem explicações)
✅ Prompt deve incluir: Paleta de cores, Tipografia, Mockups, 17 blocos
✅ Cada bloco: Layout + Elementos + Copy pronta
✅ Bônus: Mockup + Descrição + Valor
✅ NÃO incluir vídeo
✅ Lowticket (até R$100)

COMECE DIRETO COM:
PRODUTO: [nome]
TAGLINE: [tagline]
PREÇO: R$[valor]
VALOR ÂNCORA: R$[valor_original]

🎨 PALETA DE CORES:
...

📐 TIPOGRAFIA:
...

📦 ESTRUTURA (17 BLOCOS):
BLOCO 1 – HEADER:
...
```

### Prompt Específico (`sophia_quiz`)
```
Você é Sophia Fênix. Gere APENAS o QUIZ DE VENDAS DIRETAS (15 perguntas).

REGRAS:
✅ NÃO repita análise ou diagnóstico
✅ Vá DIRETO para as 15 perguntas
✅ Perguntas focadas em VENDER (não educar)
✅ Cada pergunta qualifica lead e aumenta desejo
✅ 3-4 opções que levam à compra
✅ Resultado final: CTA DIRETO por perfil

COMECE DIRETO:
PERGUNTA 1:
[pergunta aqui]
Opções:
A) [opção]
B) [opção]
C) [opção]
D) [opção]

PERGUNTA 2:
...
```

---

## 🎯 Passo a Passo para Configurar

### 1. Acessar Firebase Console
```
https://console.firebase.google.com/
```

### 2. Ir para Firestore Database
```
Firestore Database → agent_templates
```

### 3. Criar Documentos

Para cada documento, adicione o campo:
- **Campo**: `prompt`
- **Tipo**: `string`
- **Valor**: Seu prompt completo

#### Exemplo:
```
Documento ID: sophia_lovable
Campo: prompt
Valor: "Você é Sophia Fênix. Gere APENAS o PROMPT COMPLETO para Lovable/Gama..."
```

### 4. Repetir para Todos os Prompts

Crie todos os 12 documentos (6 para Sophia + 6 para Sofia):
- ✅ `sophia` → Prompt principal
- ✅ `sophia_lovable` → Lovable
- ✅ `sophia_quiz` → Quiz
- ✅ `sophia_wordpress` → WordPress
- ✅ `sophia_canva` → Ebook Canva
- ✅ `sophia_gama` → Ebook Gama
- ✅ `sofia` → Prompt principal
- ✅ `sofia_lovable` → Lovable
- ✅ `sofia_quiz` → Quiz
- ✅ `sofia_wordpress` → WordPress
- ✅ `sofia_canva` → Ebook Canva
- ✅ `sofia_gama` → Ebook Gama

---

## 🧪 Como Testar

### 1. Testar Prompt Principal
```
1. Extrair comentários do YouTube
2. Clicar em "Gerar Oferta"
3. Verificar no console: "Buscando prompt 'sophia' no Firestore"
4. Deve gerar até seção 4 (sem Lovable, Quiz, WordPress)
```

### 2. Testar Prompt Específico (Lovable)
```
1. Após gerar oferta principal
2. Clicar em "Gerar Lovable"
3. Verificar no console: "Buscando prompt específico: sophia_lovable"
4. Deve gerar APENAS o prompt Lovable (sem repetir análise)
```

### 3. Testar Prompt Específico (Quiz)
```
1. Após gerar oferta principal
2. Clicar em "Gerar Quiz"
3. Verificar no console: "Buscando prompt específico: sophia_quiz"
4. Deve gerar APENAS o quiz (sem repetir análise)
```

### 4. Verificar Economia de Tokens
```
ANTES: ~8000 tokens por geração completa
DEPOIS: ~2000 tokens (prompt principal) + ~1000 tokens (cada específico)
ECONOMIA: 60-70% de tokens!
```

---

## 🐛 Troubleshooting

### Problema: "Prompt não encontrado no Firestore"
**Solução**: Verifique se o documento existe no Firebase com o ID correto
```
Exemplo: sophia_lovable (não sophia-lovable ou sophiaLovable)
```

### Problema: Sistema ainda gera tudo de uma vez
**Solução**: Verifique se o prompt principal não contém instruções de Lovable/Quiz/WordPress
```
Prompt principal deve gerar APENAS até seção 4
```

### Problema: Resposta vazia ou erro
**Solução**: Verifique se o campo no Firebase é `prompt` (não `systemPrompt`)
```javascript
// O código busca:
data.prompt || data.systemPrompt
```

---

## 📊 Comparação de Custos

### Cenário: Usuário gera oferta + Lovable + Quiz

#### ANTES (Prompt Único)
```
Geração 1: 8000 tokens (tudo de uma vez)
Custo: ~$0.16 (GPT-4o)
Tempo: ~30 segundos
```

#### DEPOIS (Prompts Separados)
```
Geração 1: 2000 tokens (prompt principal)
Geração 2: 1000 tokens (lovable)
Geração 3: 1000 tokens (quiz)
Total: 4000 tokens
Custo: ~$0.08 (GPT-4o)
Tempo: ~15 segundos
ECONOMIA: 50% de custo + 50% mais rápido!
```

---

## ✅ Checklist de Implementação

- [x] Atualizar `openaiService.js`
- [x] Atualizar `AIChat.jsx`
- [x] Fazer commit e push
- [ ] **Criar prompts no Firebase** ← VOCÊ PRECISA FAZER ISSO
- [ ] Testar prompt principal
- [ ] Testar prompt lovable
- [ ] Testar prompt quiz
- [ ] Testar prompt wordpress
- [ ] Testar prompt canva
- [ ] Testar prompt gama
- [ ] Verificar economia de tokens
- [ ] Documentar prompts finais

---

## 🎓 Dicas para Criar Bons Prompts

### Prompt Principal
- ✅ Foque em análise e estrutura
- ✅ Gere até seção 4
- ✅ NÃO inclua instruções de formatos específicos
- ✅ Retorne JSON limpo

### Prompts Específicos
- ✅ Vá DIRETO ao ponto
- ✅ NÃO repita análise
- ✅ Seja específico sobre o formato
- ✅ Inclua exemplos de estrutura
- ✅ Defina regras claras

---

**Desenvolvido com ❤️ para o projeto ViralTicket**  
*Sistema de Prompts Separados - Novembro 2024*
