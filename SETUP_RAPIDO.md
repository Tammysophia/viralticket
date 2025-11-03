# 🚀 SETUP RÁPIDO - Resolver "Erro ao Gerar Oferta"

## ✅ JÁ FIZEMOS:

1. ✅ Criado arquivo `.env` com chave mestra
2. ✅ Instalado dependências dos scripts
3. ❌ FALTA: Credenciais do Firebase para injetar prompts

---

## 🔥 PASSO A PASSO (5 minutos)

### 1️⃣ Obter Credenciais do Firebase

**Acesse:** https://console.firebase.google.com/

1. Selecione seu projeto: **studio-6502227051-763bf**
2. Clique no ⚙️ (engrenagem) → **Configurações do projeto**
3. Vá em **Contas de serviço**
4. Clique em **Gerar nova chave privada**
5. Baixe o arquivo JSON

### 2️⃣ Adicionar Credencial ao .env

Abra o arquivo JSON que baixou e copie TODO o conteúdo.

Edite o arquivo `.env` e adicione no FINAL:

```bash
# Service Account para injetar prompts
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"studio-6502227051-763bf",...COLE_AQUI_O_JSON_TODO...}

# Mesma chave mestra (para o script)
AGENT_MASTER_KEY=ccdcb0de4c801f9a53b9d3223aacf1f40d823fe062a36259209f150123f7c7c4
```

**⚠️ IMPORTANTE:** Cole o JSON em UMA ÚNICA LINHA (sem quebras)

### 3️⃣ Injetar Prompts no Firestore

```bash
npm run inject-agents
```

**✅ Você deve ver:**
```
✅ Sophia Fênix injetada com sucesso!
✅ Sophia Universal injetada com sucesso!
🚀 Prompts injetados com sucesso.
```

### 4️⃣ Verificar no Firestore

**Acesse:** https://console.firebase.google.com/project/studio-6502227051-763bf/firestore

Você deve ver:
```
📂 agent_templates/
  ├── sophia-fenix/
  │   ├── name: "Sophia Fênix"
  │   ├── prompt_enc: "abc123...:def456..." (TEXTO GRANDE criptografado)
  │   └── active: true
  └── sophia-universal/
      └── (mesma estrutura)
```

### 5️⃣ Rebuild e Testar

```bash
npm run build
npm run dev
```

Agora teste gerar uma oferta!

---

## 📋 SOLUÇÃO ALTERNATIVA (Se não conseguir Service Account)

Se você não conseguir gerar o Service Account AGORA, posso criar uma solução temporária que:
1. ✅ Usa prompts completos hardcoded (3000+ chars)
2. ✅ Mostra warning no console para admin
3. ✅ Gera ofertas completas mesmo sem Firestore
4. ⚠️ Mas você ainda precisa configurar depois para usar o Firestore

**Quer que eu crie essa solução temporária?** Responda:
- "SIM" → Vou criar fallback COM prompts completos
- "NÃO" → Continue o setup acima

---

## 🆘 AINDA COM PROBLEMA?

**Se der erro ao executar `npm run inject-agents`, me envie:**
1. A mensagem de erro completa
2. Confirme se editou o `.env` com o JSON da Service Account

**Se o Firestore não criar os documentos:**
1. Verifique as permissões do Firestore
2. Vá em **Regras** → Deve permitir write para admins
