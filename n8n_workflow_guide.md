# Guia do Workflow n8n - ViralTicket

Para que o sistema funcione corretamente, seu workflow no n8n deve seguir esta estrutura:

### 1. Webhook (POST)
- **URL**: Deve ser a mesma configurada em `VITE_N8N_WEBHOOK_URL`.
- **Payload esperado**:
```json
{
  "userId": "ID_DO_USUARIO",
  "tema": "TEMA_DA_OFERTA",
  "agente": "sophia | sofia",
  "idioma": "pt-BR"
}
```

### 2. YouTube Search & Scraper
- Use o `tema` para buscar vídeos relevantes.
- Extraia comentários para análise de dores e desejos.

### 3. OpenAI (Geração da Oferta)
- Use os prompts solicitados:
  - **SOPHIA FÊNIX**: Copy agressiva, emocional, texto longo.
  - **SOFIA UNIVERSAL**: Copy educativa, clara, estruturada.

### 4. Resposta do Webhook
- O n8n deve retornar um JSON com o campo `oferta`:
```json
{
  "oferta": "CONTEUDO_DA_COPY_GERADA"
}
```
