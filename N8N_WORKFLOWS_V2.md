# Workflows n8n v2.0 - ViralTicket

Este documento descreve os 4 workflows principais que devem ser criados no n8n para alimentar o ViralTicket.

---

## 1. Workflow: Geração de Oferta (Busca Automática/Manual)
**Webhook Path:** `generate-offer`

### Passos:
1. **Webhook:** Recebe `userId`, `tema` (ou `youtubeUrl`), `agente`, `idioma`.
2. **If/Else:** Se `youtubeUrl` estiver presente, pula para extração. Se não, usa **YouTube Search** para encontrar os 3 vídeos mais relevantes.
3. **YouTube Comments:** Extrai até 50 comentários de cada vídeo.
4. **OpenAI (Análise):** Analisa dores, desejos e objeções dos comentários.
5. **OpenAI (Geração):** Usa o prompt da **Sophia Fênix** ou **Sofia Universal** para gerar a copy completa.
6. **Supabase:** Salva a oferta na tabela `offers` com `status='pendente'`.
7. **Webhook Response:** Retorna a oferta gerada.

---

## 2. Workflow: Modelagem de Página de Vendas
**Webhook Path:** `model-sales-page`

### Passos:
1. **Webhook:** Recebe `userId`, `salesPageUrl`.
2. **HTTP Request:** Captura o HTML da página de vendas (ou usa um serviço de extração de texto).
3. **OpenAI:** Analisa a estrutura da página (Headline, Mecanismo Único, Oferta, Bônus).
4. **OpenAI (Modelagem):** Cria uma nova versão da oferta baseada na estrutura da página enviada, mas com um novo ângulo.
5. **Supabase:** Salva como `type='modelagem'`.

---

## 3. Workflow: Recuperação de Oferta "Morta"
**Webhook Path:** `recover-offer`

### Passos:
1. **Webhook:** Recebe `userId`, `oldOfferText`.
2. **OpenAI:** Identifica por que a oferta pode ter parado de vender (fadiga de headline, falta de mecanismo novo).
3. **OpenAI (Revitalização):** Gera 5 novas Headlines, 3 novos Mecanismos Únicos e sugere novos Bônus.
4. **Supabase:** Salva como `type='recuperacao'`.

---

## 4. Workflow: Tradução e Expansão Global
**Webhook Path:** `translate-offer`

### Passos:
1. **Webhook:** Recebe `userId`, `offerId`, `targetLanguages[]`.
2. **Supabase:** Busca a oferta original.
3. **OpenAI:** Traduz a oferta mantendo a persuasão (transcriação).
4. **OpenAI (Market Research):** Recomenda os 3 melhores países para vender aquele produto (ex: México, Espanha, Colômbia) baseado em tendências de mercado.
5. **Supabase:** Salva as versões traduzidas.

---

## 💡 Prompts Estratégicos (System Prompts)

### IA de Modelagem (Páginas de Vendas)
> "Você é um mestre em engenharia reversa de funis. Sua tarefa é analisar o texto de uma página de vendas e extrair o 'esqueleto' da oferta. Depois, crie uma nova oferta seguindo a mesma estrutura vencedora, mas com um Mecanismo Único diferente para evitar plágio e aumentar a conversão."

### IA de Recuperação
> "Você é um especialista em 'Offer Turnaround'. Analise esta oferta que parou de vender. Sua missão é dar um 'choque de desfibrilador' nela. Crie headlines de curiosidade extrema e mude o ângulo de abordagem de 'ganho' para 'medo da perda' ou 'atalho secreto'."
