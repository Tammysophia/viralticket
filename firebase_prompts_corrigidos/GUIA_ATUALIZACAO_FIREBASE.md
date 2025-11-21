# 🔥 GUIA COMPLETO: Como Atualizar os Prompts no Firebase

## ✅ COMMITS REALIZADOS

**Commit 1 (Sophia):** `e9505fd`  
**Commit 2 (Sofia):** `56f110c`

**Link GitHub:** https://github.com/Tammysophia/viralticket/tree/main/firebase_prompts_corrigidos

---

## 📋 ARQUIVOS PRONTOS PARA ATUALIZAR

### Para Sophia Fênix:
1. `sophia_gama_CORRIGIDO.txt`
2. `sophia_entregavel_canva_CORRIGIDO.txt`
3. `sophia_criativos_CORRIGIDO.txt`

### Para Sofia Universal:
4. `sofia_gama_CORRIGIDO.txt`
5. `sofia_entregavel_canva_CORRIGIDO.txt`
6. `sofia_criativos_CORRIGIDO.txt`

---

## 🎯 PASSO A PASSO DETALHADO

### PASSO 1: Acessar Firebase Console

1. Abra o navegador
2. Acesse: https://console.firebase.google.com/
3. Faça login com sua conta
4. Selecione o projeto **ViralTicket**

---

### PASSO 2: Ir para Firestore Database

1. No menu lateral esquerdo, clique em **"Firestore Database"**
2. Você verá a lista de collections
3. Localize e clique na collection: **`agent_templates`**

---

### PASSO 3: Atualizar Prompts da SOPHIA

1. **Abra o documento `sophia`:**
   - Clique no documento com ID: `sophia`
   - Você verá todos os campos do documento

2. **Localize o campo `sophia_gama`:**
   - Role até encontrar o campo `sophia_gama`
   - Clique no ícone de **editar** (lápis) ao lado do campo

3. **Substitua o conteúdo:**
   - Abra o arquivo: `sophia_gama_CORRIGIDO.txt`
   - Selecione TODO o conteúdo (Ctrl+A)
   - Copie (Ctrl+C)
   - Volte ao Firebase
   - Cole no campo `sophia_gama` (Ctrl+V)
   - Clique em **"Update"** para salvar

4. **Repita para `sophia_entregavel_canva`:**
   - Localize o campo `sophia_entregavel_canva`
   - Clique em editar
   - Abra `sophia_entregavel_canva_CORRIGIDO.txt`
   - Copie todo o conteúdo
   - Cole no Firebase
   - Clique em **"Update"**

5. **Repita para `sophia_criativos`:**
   - Localize o campo `sophia_criativos`
   - Clique em editar
   - Abra `sophia_criativos_CORRIGIDO.txt`
   - Copie todo o conteúdo
   - Cole no Firebase
   - Clique em **"Update"**

---

### PASSO 4: Atualizar Prompts da SOFIA

1. **Volte para a lista de documentos:**
   - Clique na seta para voltar à collection `agent_templates`

2. **Abra o documento `sofia`:**
   - Clique no documento com ID: `sofia`

3. **Localize o campo `sofia_gama`:**
   - Role até encontrar o campo `sofia_gama`
   - Clique no ícone de **editar**

4. **Substitua o conteúdo:**
   - Abra o arquivo: `sofia_gama_CORRIGIDO.txt`
   - Copie todo o conteúdo
   - Cole no campo `sofia_gama`
   - Clique em **"Update"**

5. **Repita para `sofia_entregavel_canva`:**
   - Localize o campo `sofia_entregavel_canva`
   - Clique em editar
   - Abra `sofia_entregavel_canva_CORRIGIDO.txt`
   - Copie todo o conteúdo
   - Cole no Firebase
   - Clique em **"Update"**

6. **Repita para `sofia_criativos`:**
   - Localize o campo `sofia_criativos`
   - Clique em editar
   - Abra `sofia_criativos_CORRIGIDO.txt`
   - Copie todo o conteúdo
   - Cole no Firebase
   - Clique em **"Update"**

---

## ✅ VERIFICAÇÃO

Após atualizar todos os 6 campos, verifique:

- ✅ Documento `sophia` tem 3 campos atualizados
- ✅ Documento `sofia` tem 3 campos atualizados
- ✅ Total: 6 prompts corrigidos no Firebase

---

## 🧪 TESTAR AS MUDANÇAS

### Teste 1: Ebook Gama (Sophia)

1. Acesse o ViralTicket
2. Gere uma oferta nova
3. Clique em **"Ebook Gama"**
4. Aguarde a resposta da IA

**Resultado esperado:**
- ✅ Introdução com 4 parágrafos COMPLETOS escritos
- ✅ Sumário com títulos dos módulos CRIADOS
- ✅ Capítulo 1 com 5 parágrafos COMPLETOS escritos
- ✅ Todos os 20 capítulos com conteúdo PRONTO
- ✅ Bônus com descrições COMPLETAS
- ❌ NÃO deve vir: "Capítulo 1: Análise profunda..."
- ❌ NÃO deve vir: "Desculpe, não posso gerar..."

### Teste 2: Ebook Canva (Sophia)

1. Na mesma oferta, clique em **"Ebook Canva"**
2. Aguarde a resposta

**Resultado esperado:**
- ✅ Página 1 (Capa) com título e subtítulo ESCRITOS
- ✅ Página 2 (Boas-vindas) com texto de 100-150 palavras ESCRITO
- ✅ Todas as 30 páginas com copy COMPLETA
- ❌ NÃO deve vir: "Descrição: Entenda quem é..."

### Teste 3: Criativos (Sophia)

1. Na mesma oferta, clique em **"Criativos"**
2. Aguarde a resposta

**Resultado esperado:**
- ✅ 5 posts estáticos com copy COMPLETA
- ✅ 3 vídeos com roteiro COMPLETO cena por cena
- ✅ Headlines, descrições, CTAs ESCRITOS
- ❌ NÃO deve vir: "Como criar 10 micro-ofertas..."

### Teste 4: Repetir para Sofia

1. Gere uma nova oferta
2. Teste os 3 botões (Ebook Gama, Ebook Canva, Criativos)
3. Verifique se Sofia também retorna conteúdo pronto

---

## 🚨 SE ALGO DER ERRADO

### Problema: IA ainda retorna instruções

**Possíveis causas:**
1. Prompt não foi salvo corretamente no Firebase
2. Cache do navegador
3. Prompt colado incompleto

**Soluções:**
1. Verifique se clicou em **"Update"** após colar
2. Limpe o cache do navegador (Ctrl+Shift+Del)
3. Verifique se o prompt foi colado por completo (role até o final do campo)
4. Tente novamente com uma oferta nova

### Problema: Erro ao salvar no Firebase

**Possíveis causas:**
1. Prompt muito longo (limite do Firestore)
2. Conexão interrompida

**Soluções:**
1. Verifique sua conexão com a internet
2. Tente salvar novamente
3. Se persistir, entre em contato

---

## 📊 RESUMO DO QUE FOI CORRIGIDO

| Antes | Depois |
|-------|--------|
| `[Escreva 3-4 parágrafos...]` | `ESCREVA AGORA 4 parágrafos completos que:` |
| `[Descreva o visual...]` | `ESCREVA AGORA descrição do visual...` |
| `[Nome do Produto]` | `[ESCREVA nome do produto baseado na oferta]` |
| Sugestões passivas | Comandos imperativos |
| Placeholders vazios | Placeholders com instruções claras |

---

## 💡 DICAS IMPORTANTES

1. ⚠️ **Faça backup** dos prompts atuais antes de substituir (copie e cole em um arquivo .txt)
2. ⚠️ **Teste com oferta nova** após atualizar
3. ⚠️ **Não feche o Firebase** até confirmar que salvou tudo
4. ⚠️ **Copie o prompt COMPLETO** (do início ao "FIM DO...")
5. ⚠️ **Aguarde a mensagem de sucesso** após clicar em Update

---

## 📞 PRÓXIMOS PASSOS

Após atualizar e testar:

1. ✅ Verifique se as respostas estão vindo completas
2. ✅ Teste com diferentes nichos
3. ✅ Revogue o token do GitHub (segurança)
4. ✅ Continue com as outras melhorias:
   - Reset automático de planos à meia-noite
   - Renomear planos (Free → Prata, Ouro, Diamante)
   - Implementar tradutor completo

---

**Data:** 21/11/2025  
**Commits:** e9505fd (Sophia) + 56f110c (Sofia)  
**Autor:** Manus AI para Tamara Dutra  
**Projeto:** ViralTicket
