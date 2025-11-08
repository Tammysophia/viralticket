# 🔥 GUIA: Criar Template da Sophia no Firestore

## ⚠️ PROBLEMA ATUAL

O sistema está gerando ofertas **GENÉRICAS** porque o template da Sophia **NÃO EXISTE** ou **NÃO ESTÁ ACESSÍVEL** no Firestore.

---

## 🎯 SOLUÇÃO: Criar o Template no Firebase Console

### Passo 1: Abrir Firebase Console

```
1. Ir para: https://console.firebase.google.com/
2. Fazer login
3. Clicar no projeto: studio-6502227051-763bf
```

### Passo 2: Ir para Firestore Database

```
1. Menu lateral → Firestore Database
2. Se não existe, clicar em "Criar banco de dados"
3. Selecionar "Iniciar em modo de teste" (ou produção)
```

### Passo 3: Criar a Coleção

```
1. Clicar em "+ Iniciar coleção"
2. ID da coleção: agent_templates
3. Clicar em "Avançar"
```

### Passo 4: Criar o Documento da Sophia

```
1. ID do documento: sophia
2. Clicar em "+ Adicionar campo"
3. Configurar:
   
   Campo: prompt
   Tipo: string
   Valor: [COLAR AQUI O TEMPLATE COMPLETO DA SOPHIA]
   
4. Clicar em "Salvar"
```

### Passo 5: Template da Sophia (Copiar e Colar)

**ATENÇÃO:** O template deve ter pelo menos **40.000 caracteres** (48647 na versão funcionando)

**Onde está o template?**

Opção A: No Firestore da versão funcionando do Vercel
- Acesse: https://console.firebase.google.com/
- Firestore Database → agent_templates → sophia
- Copie o campo `prompt`

Opção B: No arquivo de backup (se você tem)
- Arquivo: `SOPHIA_PROMPT_CONFIG.md` ou similar
- Copie TODO o conteúdo

Opção C: Template básico (temporário para teste)
```
Você é Sophia Fênix, especialista em ofertas de alto impacto emocional.

INSTRUÇÕES COMPLETAS:

1. DIAGNÓSTICO PROFUNDO
Analise os comentários e identifique:
- Dores emocionais principais
- Padrões de comportamento
- Medos e objeções
- Desejos não verbalizados

2. MICRO-OFERTAS (10 opções)
Crie 10 micro-ofertas focadas em:
- Resolução da dor principal
- Transformação emocional
- Urgência e escassez
- Prova social

3. OFERTAS CAMPEÃS (3 melhores)
Selecione as 3 ofertas mais impactantes

4. ESTRUTURA DO PRODUTO
- Nome
- Promessa
- Mecanismo único
- Garantia
- Bônus

5. FORMATO DA RESPOSTA
Retorne a análise COMPLETA em markdown formatado.

AO FINAL, retorne um JSON no formato:
{
  "title": "Título da oferta",
  "subtitle": "Subtítulo persuasivo",
  "bullets": ["Benefício 1", "Benefício 2", "Benefício 3", "Benefício 4"],
  "cta": "Chamada para ação",
  "bonus": "Bônus irresistível"
}
```

---

## 📋 Passo 6: Verificar Regras de Segurança

Vá em: **Firestore Database → Regras**

Cole estas regras:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ✅ PERMITIR LEITURA dos templates (SEM autenticação)
    match /agent_templates/{agentId} {
      allow read: if true;  // Qualquer um pode ler
      allow write: if request.auth != null && request.auth.token.email == 'tamara14@gmail.com';
    }
    
    // Outras regras...
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /offers/{offerId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Clicar em **"Publicar"**

---

## ✅ Passo 7: Testar no Navegador

1. Abrir o ViralTicket
2. Abrir Console (F12)
3. Gerar uma oferta
4. Verificar logs:

**✅ Se funcionar:**
```
🔍 VT: Buscando template da agente "sophia" no Firestore...
🔍 VT: Firebase db status: CONECTADO
📡 VT: Buscando documento: agent_templates/sophia
🔍 VT: Documento existe? true
🔍 VT: Campos do documento: [ 'prompt' ]
✅ VT: Template da agente sophia carregado do Firestore (48647 caracteres)
```

**❌ Se NÃO funcionar:**
```
🔍 VT: Firebase db status: NÃO CONECTADO
❌ VT: Firestore não configurado!
```
→ Verifique variáveis de ambiente na Vercel

OU

```
🔍 VT: Documento existe? false
❌ VT: Documento agent_templates/sophia NÃO EXISTE no Firestore!
```
→ Crie o documento no Firebase Console (Passos acima)

OU

```
❌ VT: ERRO CRÍTICO: permission-denied
```
→ Ajuste as regras de segurança (Passo 6)

---

## 🔍 Troubleshooting

### Problema 1: "Firebase db status: NÃO CONECTADO"

**Causa:** Variáveis de ambiente não configuradas na Vercel

**Solução:**
1. Vercel Dashboard → viralticket → Settings → Environment Variables
2. Adicionar:
   - VITE_FIREBASE_API_KEY
   - VITE_FIREBASE_AUTH_DOMAIN
   - VITE_FIREBASE_PROJECT_ID
   - VITE_FIREBASE_STORAGE_BUCKET
   - VITE_FIREBASE_MESSAGING_SENDER_ID
   - VITE_FIREBASE_APP_ID
3. Redeploy

### Problema 2: "Documento NÃO EXISTE"

**Causa:** Template não foi criado no Firestore

**Solução:** Seguir Passos 3, 4 e 5 acima

### Problema 3: "permission-denied"

**Causa:** Regras de segurança do Firestore bloqueando leitura

**Solução:** Ajustar regras (Passo 6)

### Problema 4: "Documento existe mas não tem campo prompt"

**Causa:** Campo com nome errado

**Solução:**
- Verificar no Firebase Console qual o nome do campo
- Deve ser `prompt`, `systemPrompt` ou `template`
- Se for outro nome, renomear para `prompt`

---

## 📊 Checklist

- [ ] Firebase Console aberto
- [ ] Firestore Database criado
- [ ] Coleção `agent_templates` criada
- [ ] Documento `sophia` criado
- [ ] Campo `prompt` adicionado com template completo (40k+ chars)
- [ ] Regras de segurança configuradas (allow read: if true)
- [ ] Regras publicadas
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] Vercel redeploy feito
- [ ] Teste no navegador (F12 → Console)
- [ ] Logs confirmam: "Template carregado (48647 caracteres)"

---

## 🎯 Resultado Esperado

Quando tudo estiver correto, você verá:

```
🚀 VT: Iniciando geração de oferta com agente "sophia"...
🔥 VT: Buscando template da agente "sophia" (SEM FALLBACK)...
🔍 VT: Firebase db status: CONECTADO
📡 VT: Buscando documento: agent_templates/sophia
🔍 VT: Documento existe? true
🔍 VT: Campos do documento: [ 'prompt' ]
✅ VT: Template da agente sophia carregado do Firestore (48647 caracteres)
✅ VT: agentPrompt tipo=string, vazio=false, length=48647
📋 VT: Prompt preparado (tamanho: 48647 caracteres)
📡 VT: Enviando requisição para OpenAI API...
📥 VT: Resposta da OpenAI (primeiros 500 chars): ### 1️⃣ DIAGNÓSTICO PROFUNDO...
📊 VT: Resposta completa tem 9704 caracteres
```

E a oferta será **COMPLETA** com diagnóstico, micro-ofertas, análise detalhada!

---

**Tempo estimado:** 10-15 minutos  
**Dificuldade:** Média  
**Obrigatório:** SIM (para ofertas completas)
