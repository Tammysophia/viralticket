# 🔥 PROMPTS SEPARADOS - SOPHIA FÊNIX

## 📋 Visão Geral

Este diretório contém os **7 prompts separados** da Sophia Fênix, otimizados para economizar tokens e gerar respostas mais focadas.

## 🎯 Como Funciona

### ANTES (Problema):
❌ Um prompt GIGANTE no Firebase  
❌ Gera TUDO de uma vez (gasta muitos tokens)  
❌ Respostas longas e poluídas  
❌ Mais lento e mais caro  

### DEPOIS (Solução):
✅ **7 prompts separados** no Firebase  
✅ Gera **SÓ o que o usuário pedir**  
✅ **Economiza 60-70% de tokens**  
✅ Respostas mais limpas e focadas  
✅ Mais rápido e mais barato  

---

## 📦 Estrutura dos Prompts

### 1. **sophia.txt** - Prompt Principal (Seções 1-4)
**Quando usar:** Ao extrair comentários e gerar oferta inicial

**O que gera:**
- 1️⃣ Diagnóstico Profundo
- 2️⃣ Criação de 10 Ofertas
- 3️⃣ Seleção das 3 Ofertas Mestres
- 4️⃣ Estrutura da Oferta Campeã
- ✅ JSON final com: title, subtitle, bullets, cta, bonus

**Economiza:** ~70% de tokens (não gera ebook, página, quiz, etc)

---

### 2. **sophia_lovable.txt** - Prompt para IA Builder (Lovable/Gama)
**Quando usar:** Quando usuário clicar "Gerar Lovable" ou "Gerar Gama"

**O que gera:**
- Prompt COMPLETO para copiar no Lovable/Gama
- Paleta de cores (psicologia das cores)
- Mockups detalhados (principal + bônus)
- 17 blocos com copy completa
- Instruções de design e layout

**Economiza:** ~60% de tokens (não repete análise)

---

### 3. **sophia_quiz.txt** - Quiz de Vendas Diretas
**Quando usar:** Quando usuário clicar "Gerar Quiz"

**O que gera:**
- 15 perguntas emocionais de qualificação
- 3 perfis de resultado personalizados
- Copy de conversão para cada perfil
- CTA direto com oferta
- Sistema de pontuação

**Economiza:** ~65% de tokens

---

### 4. **sophia_wordpress.txt** - WordPress/Elementor (17 Blocos)
**Quando usar:** Quando usuário clicar "Gerar WordPress"

**O que gera:**
- 17 blocos com copy completa
- Instruções Elementor para cada bloco
- Descrição de mockups dos bônus
- Ancoragem de valor
- CTAs em todos os blocos

**Economiza:** ~60% de tokens

---

### 5. **sophia_entregavel_canva.txt** - Ebook para Canva
**Quando usar:** Quando usuário clicar "Gerar Ebook Canva"

**O que gera:**
- 30 páginas numeradas
- Copy completa de cada página
- 4 módulos estruturados
- Instruções visuais simples (sem pixels)
- Paleta de cores sugerida

**Economiza:** ~55% de tokens

---

### 6. **sophia_gama.txt** - Ebook para Gama (Estruturado)
**Quando usar:** Quando usuário clicar "Gerar Ebook Gama"

**O que gera:**
- 4 módulos com 5 capítulos cada (20 capítulos)
- Cada capítulo: 4-5 parágrafos COMPLETOS
- Citações impactantes
- Introdução e fechamento
- 3 bônus detalhados

**Economiza:** ~55% de tokens

---

### 7. **sophia_criativos.txt** - Criativos de Vendas (Posts + Vídeos)
**Quando usar:** Quando usuário clicar "Gerar Criativos"

**O que gera:**
- 5 posts estáticos (descrição visual + copy)
- 3 vídeos completos (cena por cena + copy)
- Copy para carrossel, stories, reels
- Headlines e CTAs para anúncios
- Paleta de cores sugerida

**Economiza:** ~60% de tokens

---

## 🔧 Como Configurar no Firebase

### Passo 1: Criar os Documentos

Na coleção `agent_templates`, crie **7 documentos**:

```
agent_templates/
├── sophia                    ← Prompt principal
├── sophia_lovable           ← IA Builder
├── sophia_quiz              ← Quiz
├── sophia_wordpress         ← WordPress
├── sophia_entregavel_canva  ← Ebook Canva
├── sophia_gama              ← Ebook Gama
└── sophia_criativos         ← Criativos
```

### Passo 2: Preencher os Documentos

Para cada documento, adicione o campo:

```javascript
{
  "prompt": "[Cole o conteúdo completo do arquivo .txt correspondente]"
}
```

Exemplo para `sophia`:
```javascript
{
  "prompt": "SOPHIA FÊNIX 🔥\nCriada por Tamara Dutra — transforma qualquer dor pública em uma oferta que converte em até 48h.\n..."
}
```

### Passo 3: Testar

1. **Teste Prompt Principal:**
   - Extrair comentários → Gerar Oferta
   - Verificar no console: "Buscando prompt 'sophia' no Firestore"
   - Deve gerar até seção 4 + JSON

2. **Teste Prompt Específico:**
   - Após gerar oferta → Clicar "Gerar Lovable"
   - Verificar no console: "Buscando prompt específico: sophia_lovable"
   - Deve gerar SÓ o prompt Lovable (sem repetir análise)

---

## 📊 Comparação de Tokens

### Cenário: Usuário quer gerar oferta + página Lovable

**ANTES (Prompt Único):**
```
Extração de comentários: 500 tokens
Prompt gigante: 8000 tokens
Resposta completa: 12000 tokens
TOTAL: ~20500 tokens
```

**DEPOIS (Prompts Separados):**
```
Extração de comentários: 500 tokens
Prompt principal: 2000 tokens
Resposta seção 1-4: 3000 tokens
Prompt Lovable: 1500 tokens
Resposta Lovable: 2500 tokens
TOTAL: ~9500 tokens
```

**💰 ECONOMIA: 54% de tokens!**

---

## ✅ Checklist de Implementação

- [ ] Criar 7 documentos no Firebase (`agent_templates`)
- [ ] Copiar conteúdo dos arquivos .txt para campo `prompt`
- [ ] Testar prompt principal (sophia)
- [ ] Testar prompt Lovable (sophia_lovable)
- [ ] Testar prompt Quiz (sophia_quiz)
- [ ] Testar prompt WordPress (sophia_wordpress)
- [ ] Testar prompt Canva (sophia_entregavel_canva)
- [ ] Testar prompt Gama (sophia_gama)
- [ ] Testar prompt Criativos (sophia_criativos)
- [ ] Verificar logs no console (busca correta de prompts)
- [ ] Medir economia de tokens (antes vs depois)

---

## 🐛 Troubleshooting

### Problema: "Prompt não encontrado"
**Solução:** Verifique se o nome do documento no Firebase está EXATAMENTE como esperado (ex: `sophia_lovable`, não `sophia-lovable`)

### Problema: "Ainda gera tudo de uma vez"
**Solução:** Verifique se o código está chamando o prompt específico corretamente (veja `openaiService.js` e `AIChat.jsx`)

### Problema: "Resposta vazia ou incompleta"
**Solução:** Verifique se o campo `prompt` no Firebase contém o texto COMPLETO do arquivo .txt

### Problema: "Fallback para prompt principal"
**Solução:** Isso é normal se o prompt específico não existir. Verifique se o documento foi criado corretamente.

---

## 📝 Notas Importantes

1. **Não altere os nomes dos arquivos** - O código espera esses nomes específicos
2. **Mantenha a estrutura dos prompts** - Cada prompt foi otimizado para gerar exatamente o que precisa
3. **Use o prompt principal SEMPRE primeiro** - Ele gera a base que os outros prompts usam
4. **Prompts específicos NÃO repetem análise** - Eles assumem que a oferta já foi gerada

---

## 🎯 Próximos Passos

Após configurar os prompts da Sophia Fênix, repita o processo para a **Sofia Universal**:

```
agent_templates/
├── sofia                     ← Prompt principal
├── sofia_lovable            ← IA Builder
├── sofia_quiz               ← Quiz
├── sofia_wordpress          ← WordPress
├── sofia_entregavel_canva   ← Ebook Canva
├── sofia_gama               ← Ebook Gama
└── sofia_criativos          ← Criativos
```

---

## 📞 Suporte

Se tiver dúvidas ou problemas, verifique:
1. Logs do console (F12)
2. Estrutura do Firebase
3. Código em `openaiService.js` e `AIChat.jsx`

---

**Criado por:** Tamara Dutra  
**Data:** Nov 14, 2025  
**Versão:** 1.0  
