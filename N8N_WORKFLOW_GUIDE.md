# Guia de Configuração do Workflow n8n para ViralTicket

Para que o sistema funcione, você deve criar um workflow no n8n com a seguinte estrutura:

## 1. Webhook (Início)
- **Método:** POST
- **Path:** `generate-offer`
- **Payload esperado:**
  ```json
  {
    "userId": "uuid",
    "tema": "tema da oferta",
    "agente": "sophia | sofia",
    "idioma": "pt-BR"
  }
  ```

## 2. YouTube Search (Node)
- **Operação:** List
- **Query:** `{{ $json.tema }}`
- **Max Results:** 3
- **Order:** Relevance

## 3. YouTube Comments (Node)
- **Operação:** List
- **Video ID:** `{{ $json.id.videoId }}`
- **Max Results:** 50
- **Fields:** snippet.topLevelComment.snippet.textDisplay

## 4. Code Node (Análise de Dados)
- Agrupar todos os comentários extraídos em um único bloco de texto para enviar à OpenAI.

## 5. OpenAI Node (Geração da Oferta)
- **Model:** gpt-4o
- **Prompt do Sistema:** (Use os prompts definidos no arquivo `N8N_PROMPTS.md` baseando-se no campo `agente`)
- **Prompt do Usuário:** 
  ```text
  Tema: {{ $node["Webhook"].json["tema"] }}
  Comentários do Público: {{ $node["Code"].json["allComments"] }}
  ```

## 6. Supabase Node (Opcional - Registro)
- Registrar a oferta gerada na tabela `offers` para backup.

## 7. Respond to Webhook
- **Body:**
  ```json
  {
    "fullResponse": "{{ $node["OpenAI"].json["content"] }}"
  }
  ```

⚠️ **Importante:** As chaves de API do YouTube e OpenAI devem ser configuradas diretamente nas credenciais do n8n.
