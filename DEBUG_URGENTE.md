# 🚨 DEBUG URGENTE - Oferta Genérica

## ❌ PROBLEMA: Oferta continua genérica

Isso significa que o OpenAI NÃO está recebendo o prompt completo de 3500+ caracteres.

---

## 🔍 DIAGNÓSTICO IMEDIATO:

### PASSO 1: Abra o Console (F12)

### PASSO 2: Gere uma oferta

### PASSO 3: Me envie ESTES logs específicos:

```
[AGENTS] fetching template: sophia-fenix
[AGENTS][WARN] ??? ← ME ENVIE ESTA LINHA
[OPENAI] systemPrompt chars=??? ← ME ENVIE ESTE NÚMERO
[OPENAI] Response length: ??? ← ME ENVIE ESTE NÚMERO
[OPENAI] Response preview: ??? ← ME ENVIE OS PRIMEIROS 200 CHARS
```

---

## 📊 TABELA DE DIAGNÓSTICO:

| Log | Valor Esperado | O Que Significa |
|-----|----------------|-----------------|
| `systemPrompt chars=` | **3500-3600** | Prompt COMPLETO ✅ |
| `systemPrompt chars=` | **500-1000** | Prompt TRUNCADO ❌ |
| `systemPrompt chars=` | **< 100** | Prompt NÃO CARREGOU ❌ |
| `Response length=` | **3000-5000** | OpenAI respondeu completo ✅ |
| `Response length=` | **< 1000** | OpenAI respondeu resumido ❌ |

---

## 🎯 CENÁRIOS POSSÍVEIS:

### Cenário A: `systemPrompt chars=3500+` mas oferta genérica
**CAUSA:** OpenAI ignorando o prompt
**SOLUÇÃO:** Ajustar temperature ou model

### Cenário B: `systemPrompt chars=500-1000`
**CAUSA:** Prompt hardcoded não está sendo usado
**SOLUÇÃO:** Verificar código do agentService.js

### Cenário C: `systemPrompt chars=<100`
**CAUSA:** Erro ao carregar prompt
**SOLUÇÃO:** Hard refresh (Ctrl+Shift+R) e rebuild

---

## ⚡ TESTE RÁPIDO:

1. **F12** → Console
2. **Limpar console** (ícone 🚫 ou Ctrl+L)
3. **Gerar oferta** com Sophia Fênix
4. **Copiar TODOS os logs** que começam com `[AGENTS]` e `[OPENAI]`
5. **Colar aqui** ou me enviar

---

## 📸 SCREENSHOT:

Se possível, tire um print do console mostrando:
- ✅ `[OPENAI] systemPrompt chars=XXX`
- ✅ `[OPENAI] Response length: XXX`
- ✅ `[OPENAI] Response preview: {...}`

---

## 🆘 AÇÃO URGENTE:

**Cole aqui AGORA:**
```
[Copie e cole TODOS os logs do console que começam com [AGENTS] ou [OPENAI]]
```

**SEM os logs, não consigo diagnosticar!** 🙏
