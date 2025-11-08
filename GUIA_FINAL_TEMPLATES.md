# 🎯 GUIA FINAL: Templates das Agentes IA

## ✅ STATUS: PRONTO PARA UPLOAD

Agora você tem **2 agentes IA completas** prontas para fazer upload no Firestore!

---

## 📋 OS 2 TEMPLATES

### 1️⃣ **SOPHIA FÊNIX** 🔥
- **Arquivo:** `SOPHIA_TEMPLATE.txt`
- **Especialidade:** Dores emocionais (dependência afetiva, apego, abandono, relacionamento)
- **Preço:** R$7-49 (low-ticket)
- **Público:** Mulheres 30-50 anos
- **Formato:** 8 seções detalhadas + JSON final

### 2️⃣ **SOFIA UNIVERSAL** ⭐
- **Arquivo:** `SOFIA_TEMPLATE.txt`
- **Especialidade:** TODOS os nichos (saúde, finanças, produtividade, etc)
- **Preço:** R$7-97 (low-ticket)
- **Público:** Universal (adapta linguagem)
- **Formato:** 7 seções detalhadas + JSON final
- **Diferencial:** Mecanismo único + nome "chiclete mental"

---

## 🚀 COMO FAZER UPLOAD PARA O FIRESTORE

### **OPÇÃO 1: Script Automático (Recomendado)**

```bash
# Instalar dependências (se ainda não tiver)
npm install firebase

# Executar script de upload
node UPLOAD_AMBAS_TEMPLATES.js
```

O script vai:
1. ✅ Conectar no Firebase
2. ✅ Ler os 2 templates (SOPHIA_TEMPLATE.txt e SOFIA_TEMPLATE.txt)
3. ✅ Criar 2 documentos em `agent_templates`:
   - `sophia` (Sophia Fênix)
   - `sofia` (Sofia Universal)
4. ✅ Confirmar sucesso

---

### **OPÇÃO 2: Upload Manual no Firebase Console**

Se o script não funcionar, faça manualmente:

#### Passo 1: Abrir Firebase Console
```
https://console.firebase.google.com/project/studio-6502227051-763bf/firestore
```

#### Passo 2: Criar Coleção
- Clicar em "Iniciar coleção"
- Nome: `agent_templates`

#### Passo 3: Criar Documento da Sophia
- ID do documento: `sophia`
- Adicionar campos:
  - **name** (string): `Sophia Fênix`
  - **type** (string): `oferta_emocional`
  - **prompt** (string): [COPIAR TODO o conteúdo de SOPHIA_TEMPLATE.txt]
  - **systemPrompt** (string): [COPIAR TODO o conteúdo de SOPHIA_TEMPLATE.txt]
  - **template** (string): [COPIAR TODO o conteúdo de SOPHIA_TEMPLATE.txt]
  - **active** (boolean): `true`
  - **created** (string): `2025-11-08T...`
  - **description** (string): `Transforma dores emocionais em ofertas low-ticket`

#### Passo 4: Criar Documento da Sofia
- ID do documento: `sofia`
- Adicionar campos:
  - **name** (string): `Sofia Universal`
  - **type** (string): `oferta_universal`
  - **prompt** (string): [COPIAR TODO o conteúdo de SOFIA_TEMPLATE.txt]
  - **systemPrompt** (string): [COPIAR TODO o conteúdo de SOFIA_TEMPLATE.txt]
  - **template** (string): [COPIAR TODO o conteúdo de SOFIA_TEMPLATE.txt]
  - **active** (boolean): `true`
  - **created** (string): `2025-11-08T...`
  - **description** (string): `Transforma qualquer ideia em oferta viral`

---

## 🔐 CONFIGURAR REGRAS DE SEGURANÇA

Vá em: **Firestore Database → Regras**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ✅ PERMITIR LEITURA dos templates (todos podem ler)
    match /agent_templates/{agentId} {
      allow read: if true;
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

## 🧪 TESTAR NO VIRALTICKET

### 1. Abrir ViralTicket
```
https://viralticket.vercel.app/
```

### 2. Fazer Login
- Email: `tamara14@gmail.com`
- Senha: [sua senha]

### 3. Ir para AI Chat

### 4. Escolher Agente
- **Sophia Fênix** → Para dores emocionais
- **Sofia Universal** → Para qualquer outro nicho

### 5. Colar Comentários do YouTube

### 6. Gerar Oferta

### 7. Verificar Logs no Console (F12)

**✅ Se funcionar, você verá:**
```
🔍 VT: Buscando template da agente "sophia" no Firestore...
🔍 VT: Firebase db status: CONECTADO
📡 VT: Buscando documento: agent_templates/sophia
🔍 VT: Documento existe? true
🔍 VT: Campos do documento: [ 'prompt', 'name', 'type', ... ]
✅ VT: Template da agente sophia carregado do Firestore (48647 caracteres)
📋 VT: Prompt preparado (tamanho: 48647 caracteres)
📡 VT: Enviando requisição para OpenAI API...
📥 VT: Resposta da OpenAI (primeiros 500 chars): ### 1️⃣ DIAGNÓSTICO PROFUNDO...
📊 VT: Resposta completa tem 9704 caracteres
🔥 VT: Agente utilizada: sophia
```

**❌ Se NÃO funcionar:**

Possíveis erros e soluções:

1. **"Firebase db status: NÃO CONECTADO"**
   → Configurar variáveis de ambiente na Vercel

2. **"Documento NÃO EXISTE"**
   → Template não foi criado no Firestore (fazer upload)

3. **"permission-denied"**
   → Ajustar regras de segurança do Firestore

4. **"Documento existe mas sem campo prompt"**
   → Campo foi criado com nome errado (deve ser `prompt`)

---

## 📊 ESTRUTURA FINAL NO FIRESTORE

```
firestore/
└── agent_templates/
    ├── sophia/
    │   ├── name: "Sophia Fênix"
    │   ├── type: "oferta_emocional"
    │   ├── prompt: "[48.000+ caracteres]"
    │   ├── systemPrompt: "[48.000+ caracteres]"
    │   ├── template: "[48.000+ caracteres]"
    │   ├── active: true
    │   ├── description: "..."
    │   ├── tags: [...]
    │   └── ...
    │
    └── sofia/
        ├── name: "Sofia Universal"
        ├── type: "oferta_universal"
        ├── prompt: "[50.000+ caracteres]"
        ├── systemPrompt: "[50.000+ caracteres]"
        ├── template: "[50.000+ caracteres]"
        ├── active: true
        ├── description: "..."
        ├── tags: [...]
        └── ...
```

---

## 🎯 DIFERENÇAS ENTRE AS AGENTES

### **Sophia Fênix** 🔥
- ✅ Especializada em **dores emocionais**
- ✅ Tom empoderador e acolhedor
- ✅ 8 seções super detalhadas
- ✅ Foco em dependência afetiva, apego, abandono
- ✅ Público: Mulheres 30-50 anos
- ✅ Preço: R$7-49

**Exemplo de oferta:**
- "Ritual de Despedida Invisível"
- "Protocolo Anti-Recaída Emocional"
- "Método 7 Dias de Libertação"

### **Sofia Universal** ⭐
- ✅ Funciona para **QUALQUER nicho**
- ✅ Cria "mecanismo único"
- ✅ Nomes "chiclete mental"
- ✅ 7 seções estratégicas
- ✅ Adapta linguagem ao público
- ✅ Preço: R$7-97

**Exemplo de oferta:**
- "Código 21D" (emagrecimento)
- "Protocolo Lucro Invisível" (renda extra)
- "Método Atração Silenciosa" (relacionamento)
- "Planner Anti-Sabotagem" (produtividade)

---

## ✅ CHECKLIST FINAL

- [ ] Arquivos criados:
  - [ ] SOPHIA_TEMPLATE.txt ✅
  - [ ] SOFIA_TEMPLATE.txt ✅
  - [ ] UPLOAD_AMBAS_TEMPLATES.js ✅
  - [ ] GUIA_FINAL_TEMPLATES.md ✅

- [ ] Firebase:
  - [ ] Conectado no projeto correto
  - [ ] Coleção `agent_templates` existe
  - [ ] Documento `sophia` criado
  - [ ] Documento `sofia` criado
  - [ ] Regras de segurança configuradas

- [ ] ViralTicket:
  - [ ] Código atualizado (openaiService.js)
  - [ ] Logs detalhados implementados
  - [ ] Deploy feito na Vercel
  - [ ] Testado com as 2 agentes

---

## 🚀 PRÓXIMOS PASSOS

### 1. Fazer Upload dos Templates
```bash
node UPLOAD_AMBAS_TEMPLATES.js
```

### 2. Verificar no Firebase Console
Abrir e conferir se os 2 documentos existem:
```
https://console.firebase.google.com/project/studio-6502227051-763bf/firestore/data/~2Fagent_templates
```

### 3. Testar no ViralTicket
- Abrir ViralTicket
- Testar com Sophia Fênix (dor emocional)
- Testar com Sofia Universal (qualquer nicho)
- Verificar logs (F12)

### 4. Confirmar Sucesso
Se os logs mostrarem:
```
✅ Template da agente sophia carregado do Firestore (48647 caracteres)
```

**ESTÁ FUNCIONANDO! 🎉**

---

## 🎉 RESULTADO ESPERADO

Quando tudo estiver funcionando:

1. ✅ Usuário escolhe agente (Sophia ou Sofia)
2. ✅ Cola comentários do YouTube
3. ✅ Clica "Gerar Oferta"
4. ✅ Sistema busca template do Firestore
5. ✅ OpenAI recebe prompt COMPLETO (48k+ caracteres)
6. ✅ IA gera análise DETALHADA (não genérica!)
7. ✅ Oferta salva no Kanban com resposta completa
8. ✅ Usuário vê oferta profissional e completa

---

**Tempo estimado:** 15-20 minutos  
**Dificuldade:** Média  
**Obrigatório:** SIM (para ofertas completas)

🎯 **Agora sim, o ViralTicket está 100% pronto!**
