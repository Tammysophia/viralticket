# 🤖 Configuração dos Agentes IA no Firebase

## 📋 Resumo

O sistema agora busca os **prompts dos agentes IA** diretamente da coleção `agents` no Firebase, permitindo atualização dinâmica dos prompts sem precisar alterar código.

## 🎯 Como Funciona

### 1. **Extração de Comentários do YouTube**
Quando você extrai comentários do YouTube:
- Os comentários são buscados da API do YouTube
- Automaticamente, o sistema gera **2 ofertas**:
  - Uma com **Sophia Fênix** (especialista em ofertas de alto impacto)
  - Uma com **Sofia Universal** (IA versátil para todos os nichos)
- Cada agente usa seu próprio **prompt personalizado do Firebase**
- As ofertas são salvas automaticamente no **Kanban**

### 2. **Busca de Prompts no Firebase**
O sistema funciona assim:
```javascript
// 1. Busca o agente no Firebase
const agentData = await getAgent('sophia'); // ou 'sofia'

// 2. Se encontrar, usa o prompt do Firebase
if (agentData && agentData.prompt) {
  systemPrompt = agentData.prompt.replace('{comments}', comments);
}

// 3. Se não encontrar, usa o prompt padrão
else {
  systemPrompt = defaultPrompts[agentId];
}
```

## 🚀 Inicialização dos Agentes

### Opção 1: Via Console do Navegador (Recomendado)

1. Abra o console do navegador (F12)
2. Execute o comando:
```javascript
await initializeAgents()
```

Isso criará os dois agentes no Firebase:
- **sophia** - Sophia Fênix
- **sofia** - Sofia Universal

### Opção 2: Manualmente no Firebase Console

Acesse o Firebase Console e crie documentos na coleção `agents`:

#### Documento: `sophia`
```json
{
  "id": "sophia",
  "name": "Sophia Fênix",
  "emoji": "🔥",
  "description": "Especialista em ofertas de alto impacto",
  "color": "from-orange-500 to-red-600",
  "active": true,
  "prompt": "Você é Sophia Fênix, especialista em criar ofertas de alto impacto que convertem. \nAnalise os seguintes comentários e crie uma oferta irresistível que atenda às dores e desejos do público.\n\nComentários:\n{comments}\n\nCrie uma oferta com:\n1. Título impactante (emoji + frase poderosa)\n2. Subtítulo persuasivo\n3. 4 bullets de benefícios (começando com ✅)\n4. Call-to-action convincente\n5. Bônus irresistível\n\nFormato JSON:\n{\n  \"title\": \"\",\n  \"subtitle\": \"\",\n  \"bullets\": [\"\", \"\", \"\", \"\"],\n  \"cta\": \"\",\n  \"bonus\": \"\"\n}"
}
```

#### Documento: `sofia`
```json
{
  "id": "sofia",
  "name": "Sofia Universal",
  "emoji": "🌟",
  "description": "IA versátil para todos os nichos",
  "color": "from-purple-500 to-pink-600",
  "active": true,
  "prompt": "Você é Sofia Universal, IA versátil especializada em todos os nichos.\nAnalise os comentários abaixo e crie uma oferta personalizada e persuasiva.\n\nComentários:\n{comments}\n\nCrie uma oferta completa com elementos persuasivos em formato JSON:\n{\n  \"title\": \"\",\n  \"subtitle\": \"\",\n  \"bullets\": [\"\", \"\", \"\", \"\"],\n  \"cta\": \"\",\n  \"bonus\": \"\"\n}"
}
```

## 🔧 Atualizar Prompts

### Via Console do Navegador
```javascript
// Atualizar prompt da Sophia
await updateAgentPrompt('sophia', 'SEU NOVO PROMPT AQUI com {comments}')

// Atualizar prompt da Sofia
await updateAgentPrompt('sofia', 'SEU NOVO PROMPT AQUI com {comments}')
```

### Via Firebase Console
1. Acesse Firebase Console
2. Navegue até Firestore Database
3. Acesse a coleção `agents`
4. Edite o campo `prompt` do agente desejado
5. Salve as alterações

**IMPORTANTE:** O prompt deve conter `{comments}` onde você quer que os comentários sejam inseridos.

## 📊 Estrutura da Coleção `agents`

```
agents/
├── sophia/
│   ├── id: "sophia"
│   ├── name: "Sophia Fênix"
│   ├── emoji: "🔥"
│   ├── description: "Especialista em ofertas de alto impacto"
│   ├── color: "from-orange-500 to-red-600"
│   ├── active: true
│   ├── prompt: "..." (prompt completo com {comments})
│   └── lastUpdated: Timestamp
│
└── sofia/
    ├── id: "sofia"
    ├── name: "Sofia Universal"
    ├── emoji: "🌟"
    ├── description: "IA versátil para todos os nichos"
    ├── color: "from-purple-500 to-pink-600"
    ├── active: true
    ├── prompt: "..." (prompt completo com {comments})
    └── lastUpdated: Timestamp
```

## ✅ Fluxo Completo

```
1. Usuário cola URLs do YouTube
   ↓
2. Sistema extrai comentários da API do YouTube
   ↓
3. Sistema prepara texto dos comentários
   ↓
4. Para cada agente (sophia e sofia):
   ↓
   4.1. Busca prompt do Firebase
   ↓
   4.2. Substitui {comments} pelo texto dos comentários
   ↓
   4.3. Envia para OpenAI GPT-4
   ↓
   4.4. Recebe oferta gerada
   ↓
   4.5. Salva oferta no Kanban (Firestore)
   ↓
5. Usuário vê 2 ofertas no Kanban automaticamente!
```

## 🎨 Customização de Prompts

Você pode criar prompts personalizados no Firebase para:
- ✅ Focar em nichos específicos
- ✅ Usar linguagem diferente
- ✅ Adicionar instruções específicas
- ✅ Mudar o formato de saída
- ✅ Incluir regras de copywriting específicas

**Exemplo de prompt customizado:**
```
Você é {nome do agente}, especialista em {seu nicho}.
Analise os comentários abaixo e identifique as principais dores.

Comentários:
{comments}

Crie uma oferta focada em:
- Dor específica identificada
- Solução clara
- Prova social
- Urgência

Formato JSON: {...}
```

## 🔍 Debug e Logs

O sistema mostra logs no console:
- `✅ Usando prompt do Firebase para [agente]` - Prompt encontrado no Firebase
- `⚠️ Prompt não encontrado no Firebase, usando padrão para [agente]` - Usando fallback
- `🤖 Gerando oferta com [agente]...` - Iniciando geração
- `✅ Oferta [agente] salva: [id]` - Oferta salva com sucesso
- `❌ Erro ao gerar oferta com [agente]` - Erro na geração

## 📝 Notas Importantes

1. **Placeholder obrigatório:** O prompt DEVE conter `{comments}` onde os comentários serão inseridos
2. **Formato JSON:** O prompt deve pedir a resposta em formato JSON válido
3. **Fallback:** Se não encontrar o agente no Firebase, usa o prompt padrão
4. **Ambos os agentes:** Sempre gera ofertas com ambos os agentes (sophia e sofia)
5. **Automático:** Tudo acontece automaticamente ao extrair comentários

## 🚨 Troubleshooting

### Prompt não está sendo usado
- Verifique se o documento existe no Firebase (`agents/sophia` ou `agents/sofia`)
- Confirme que o campo `prompt` está preenchido
- Verifique o console do navegador para ver qual prompt está sendo usado

### Oferta não está sendo gerada
- Verifique a chave da OpenAI no painel administrativo
- Confira os logs do console para erros
- Verifique se o prompt está retornando JSON válido

### Oferta não aparece no Kanban
- Verifique as permissões do Firestore
- Confira se a coleção `offers` existe
- Verifique os logs de erro no console
