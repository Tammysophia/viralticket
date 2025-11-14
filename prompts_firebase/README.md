# 🔥 PROMPTS SEPARADOS - SOPHIA FÊNIX & SOFIA UNIVERSAL

## 📋 Visão Geral

Este diretório contém os **14 prompts separados** (7 para cada IA), otimizados para economizar tokens e gerar respostas mais focadas.

## 🎯 Como Funciona

### ANTES (Problema):
❌ Um prompt GIGANTE no Firebase  
❌ Gera TUDO de uma vez (gasta muitos tokens)  
❌ Respostas longas e poluídas  
❌ Mais lento e mais caro  

### DEPOIS (Solução):
✅ **7 prompts separados por IA** no Firebase  
✅ Gera **SÓ o que o usuário pedir**  
✅ **Economiza 60-70% de tokens**  
✅ Respostas mais limpas e focadas  
✅ Mais rápido e mais barato  

---

## 📦 Estrutura dos Prompts

### 🔥 SOPHIA FÊNIX (7 prompts)

Focada em **dores emocionais** (dependência afetiva, apego, abandono).

1. **sophia.txt** - Prompt Principal (Seções 1-4)
2. **sophia_lovable.txt** - IA Builder (Lovable/Gama)
3. **sophia_quiz.txt** - Quiz de Vendas (15 perguntas)
4. **sophia_wordpress.txt** - WordPress/Elementor (17 blocos)
5. **sophia_entregavel_canva.txt** - Ebook Canva (30 páginas)
6. **sophia_gama.txt** - Ebook Gama (20 capítulos)
7. **sophia_criativos.txt** - Criativos (5 posts + 3 vídeos)

---

### 🌟 SOFIA UNIVERSAL (7 prompts)

Focada em **qualquer nicho** (universal, adaptável).

1. **sofia.txt** - Prompt Principal (Seções 1-4)
2. **sofia_lovable.txt** - IA Builder (Lovable/Gama)
3. **sofia_quiz.txt** - Quiz de Vendas (15 perguntas)
4. **sofia_wordpress.txt** - WordPress/Elementor (17 blocos)
5. **sofia_entregavel_canva.txt** - Ebook Canva (30 páginas)
6. **sofia_gama.txt** - Ebook Gama (20 capítulos)
7. **sofia_criativos.txt** - Criativos (5 posts + 3 vídeos)

---

## 🎯 Detalhamento dos Prompts

### 1. **Prompt Principal** (sophia.txt / sofia.txt)
**Quando usar:** Ao extrair comentários e gerar oferta inicial

**O que gera:**
- 1️⃣ Diagnóstico Profundo
- 2️⃣ Criação de 10 Ofertas
- 3️⃣ Seleção das 3 Ofertas Mestres
- 4️⃣ Estrutura da Oferta Campeã
- ✅ JSON final com: title, subtitle, bullets, cta, bonus

**Economiza:** ~70% de tokens (não gera ebook, página, quiz, etc)

---

### 2. **IA Builder** (sophia_lovable.txt / sofia_lovable.txt)
**Quando usar:** Quando usuário clicar "Gerar Lovable" ou "Gerar Gama"

**O que gera:**
- Prompt COMPLETO para copiar no Lovable/Gama
- Paleta de cores (psicologia das cores)
- Mockups detalhados (principal + bônus)
- 17 blocos com copy completa
- Instruções de design e layout

**Economiza:** ~60% de tokens (não repete análise)

---

### 3. **Quiz de Vendas** (sophia_quiz.txt / sofia_quiz.txt)
**Quando usar:** Quando usuário clicar "Gerar Quiz"

**O que gera:**
- **15 perguntas emocionais** de qualificação
- Perguntas focadas em **VENDA IMEDIATA**
- 3 perfis de resultado personalizados
- Copy de conversão para cada perfil
- CTA direto com oferta **LOW-TICKET**
- Sistema de pontuação

**Economiza:** ~65% de tokens

---

### 4. **WordPress/Elementor** (sophia_wordpress.txt / sofia_wordpress.txt)
**Quando usar:** Quando usuário clicar "Gerar WordPress"

**O que gera:**
- 17 blocos com copy completa
- Instruções Elementor para cada bloco
- Descrição de mockups dos bônus
- Ancoragem de valor
- CTAs em todos os blocos

**Economiza:** ~60% de tokens

---

### 5. **Ebook Canva** (sophia_entregavel_canva.txt / sofia_entregavel_canva.txt)
**Quando usar:** Quando usuário clicar "Gerar Ebook Canva"

**O que gera:**
- 30 páginas numeradas
- Copy completa de cada página
- 4 módulos estruturados
- Instruções visuais simples (sem pixels)
- Paleta de cores sugerida

**Economiza:** ~55% de tokens

---

### 6. **Ebook Gama** (sophia_gama.txt / sofia_gama.txt)
**Quando usar:** Quando usuário clicar "Gerar Ebook Gama"

**O que gera:**
- 4 módulos com 5 capítulos cada (20 capítulos)
- Cada capítulo: 4-5 parágrafos COMPLETOS
- Citações impactantes
- Introdução e fechamento
- 3 bônus detalhados

**Economiza:** ~55% de tokens

---

### 7. **Criativos** (sophia_criativos.txt / sofia_criativos.txt)
**Quando usar:** Quando usuário clicar "Gerar Criativos"

**O que gera:**
- 5 posts estáticos (descrição visual + copy)
- 3 vídeos completos (cena por cena + copy)
- Copy para carrossel, stories, reels
- Headlines e CTAs para anúncios
- Paleta de cores sugerida

**Economiza:** ~60% de tokens

---

## 💰 Economia de Tokens

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

## 🔧 Como Configurar no Firebase

### Passo 1: Criar os Documentos

Na coleção `agent_templates`, crie **14 documentos**:

```
agent_templates/
├── sophia                    ← Sophia Fênix - Principal
├── sophia_lovable           ← Sophia Fênix - IA Builder
├── sophia_quiz              ← Sophia Fênix - Quiz
├── sophia_wordpress         ← Sophia Fênix - WordPress
├── sophia_entregavel_canva  ← Sophia Fênix - Ebook Canva
├── sophia_gama              ← Sophia Fênix - Ebook Gama
├── sophia_criativos         ← Sophia Fênix - Criativos
│
├── sofia                     ← Sofia Universal - Principal
├── sofia_lovable            ← Sofia Universal - IA Builder
├── sofia_quiz               ← Sofia Universal - Quiz
├── sofia_wordpress          ← Sofia Universal - WordPress
├── sofia_entregavel_canva   ← Sofia Universal - Ebook Canva
├── sofia_gama               ← Sofia Universal - Ebook Gama
└── sofia_criativos          ← Sofia Universal - Criativos
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

3. **Teste Quiz:**
   - Após gerar oferta → Clicar "Gerar Quiz"
   - Verificar: **15 perguntas focadas em venda imediata**
   - CTA direto no resultado

---

## ✅ Checklist de Implementação

### Sophia Fênix:
- [ ] Criar documento `sophia` no Firebase
- [ ] Criar documento `sophia_lovable`
- [ ] Criar documento `sophia_quiz`
- [ ] Criar documento `sophia_wordpress`
- [ ] Criar documento `sophia_entregavel_canva`
- [ ] Criar documento `sophia_gama`
- [ ] Criar documento `sophia_criativos`

### Sofia Universal:
- [ ] Criar documento `sofia` no Firebase
- [ ] Criar documento `sofia_lovable`
- [ ] Criar documento `sofia_quiz`
- [ ] Criar documento `sofia_wordpress`
- [ ] Criar documento `sofia_entregavel_canva`
- [ ] Criar documento `sofia_gama`
- [ ] Criar documento `sofia_criativos`

### Testes:
- [ ] Testar prompt principal (sophia/sofia)
- [ ] Testar prompt Lovable
- [ ] Testar prompt Quiz (verificar 15 perguntas)
- [ ] Testar prompt WordPress
- [ ] Testar prompt Canva
- [ ] Testar prompt Gama
- [ ] Testar prompt Criativos
- [ ] Verificar logs no console
- [ ] Medir economia de tokens

---

## 🐛 Troubleshooting

### Problema: "Prompt não encontrado"
**Solução:** Verifique se o nome do documento no Firebase está EXATAMENTE como esperado (ex: `sophia_lovable`, não `sophia-lovable`)

### Problema: "Ainda gera tudo de uma vez"
**Solução:** Verifique se o código está chamando o prompt específico corretamente (veja `openaiService.js` e `AIChat.jsx`)

### Problema: "Quiz tem menos de 15 perguntas"
**Solução:** Verifique se colou o conteúdo COMPLETO do arquivo `sophia_quiz.txt` ou `sofia_quiz.txt`

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
5. **Quiz tem 15 perguntas de VENDA** - Focadas em qualificar e converter para low-ticket

---

## 🎯 Diferenças entre Sophia Fênix e Sofia Universal

| Característica | Sophia Fênix | Sofia Universal |
|---|---|---|
| **Foco** | Dores emocionais (apego, abandono) | Qualquer nicho |
| **Público** | Mulheres com dependência afetiva | Universal |
| **Tom** | Empoderador, emocional, íntimo | Adaptável ao nicho |
| **Exemplos** | Relacionamentos, autoamor | Finanças, saúde, negócios, etc |

---

## 📞 Suporte

Se tiver dúvidas ou problemas, verifique:
1. Logs do console (F12)
2. Estrutura do Firebase
3. Código em `openaiService.js` e `AIChat.jsx`

---

**Criado por:** Tamara Dutra  
**Data:** Nov 14, 2025  
**Versão:** 2.0  
**Total de Prompts:** 14 (7 Sophia Fênix + 7 Sofia Universal)  
