# 🔥 Como Criar o Índice do Firestore

## ⚠️ Erro Detectado:

```
The query requires an index. You can create it here: https://console.firebase.google.com/v1/r/project/studio-6502227051-763bf/firestore/indexes?create_composite=...
```

## ✅ Solução Rápida:

### **OPÇÃO 1: Usar o Link do Erro (Mais Fácil)**

1. No console do navegador (F12), clique no **link azul** que aparece no erro
2. Ele vai te levar direto para criar o índice automaticamente
3. Clique em **"Criar Índice"** ou **"Create Index"**
4. Aguarde 2-5 minutos para o índice ser criado
5. Recarregue a página do app

### **OPÇÃO 2: Criar Manualmente**

1. Acesse: https://console.firebase.google.com
2. Selecione: **studio-6502227051-763bf**
3. Menu lateral → **Firestore Database** → Aba **"Índices"** (Indexes)
4. Clique em **"Criar Índice"** ou **"Create Index"**
5. Configure:
   - **Coleção:** `offers`
   - **Campos:**
     - `userId` - Ascending
     - `updatedAt` - Descending
   - **Escopo da consulta:** Collection
6. Clique em **"Criar"**
7. Aguarde 2-5 minutos

## 📋 Índices Necessários para o Sistema:

### Índice 1: offers (userId + updatedAt)
```
Coleção: offers
Campos:
  - userId (Ascending)
  - updatedAt (Descending)
```

## ⏱️ Tempo de Criação:

- Índices simples: ~2 minutos
- Índices complexos: ~5 minutos
- Coleções grandes: pode levar mais tempo

## ✅ Como Verificar se Está Pronto:

1. Vá em **Firestore Database** → **Índices**
2. Status do índice:
   - 🟡 **Building** (Criando) - Aguarde
   - 🟢 **Enabled** (Ativado) - Pronto para usar!

## 🔄 Após Criar o Índice:

1. Recarregue a página do app (F5)
2. Tente buscar ofertas novamente
3. O erro deve desaparecer

---

**Projeto:** studio-6502227051-763bf  
**Última atualização:** 2025-10-29
