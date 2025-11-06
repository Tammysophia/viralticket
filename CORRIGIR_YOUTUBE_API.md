# 🔧 Correção Urgente: Chave YouTube API Inválida

## ❌ Problema Identificado

A chave do YouTube API está **incorretamente configurada** no sistema. 

**Evidência dos logs:**
```
🔑 VT: Comprimento da chave: 5
🔑 VT: Primeira parte: https
🔑 VT: Última parte: ttps
```

A chave descriptografada é **"https"** (5 caracteres) quando deveria ser **"AIzaSy..."** (39 caracteres)!

---

## ✅ Solução Rápida (3 minutos)

### Passo 1: Limpar Chaves Inválidas

Abra o console do navegador (F12) e execute:

```javascript
// Limpar todas as chaves
localStorage.removeItem('viralticket_api_keys');
window.location.reload();
```

### Passo 2: Obter Chave Real do YouTube

1. Acesse: https://console.cloud.google.com/apis/credentials
2. Crie um novo projeto (se não tiver)
3. Ative a **YouTube Data API v3**
4. Crie uma **Chave de API** (API Key)
5. Copie a chave (formato: `AIzaSy...` com 39 caracteres)

### Passo 3: Adicionar Chave Correta

1. Faça login no ViralTicket como **Admin**
2. Vá para: **Admin → API Keys**
3. Clique em **"Nova Chave"**
4. Preencha:
   - **Nome**: "YouTube Data API"
   - **Tipo**: "YouTube Data API"
   - **Chave API**: Cole sua chave real (começando com `AIza...`)
5. Clique em **"Adicionar"**

### Passo 4: Testar

1. Vá para **Dashboard**
2. Cole uma URL do YouTube no campo de extração
3. Clique em **"Extrair Comentários"**
4. Deve funcionar agora! ✅

---

## 🔍 Debug Detalhado (Opcional)

Se ainda houver problemas, abra o console (F12) e cole este script:

```javascript
// Script de debug completo
const saved = localStorage.getItem('viralticket_api_keys');
if (saved) {
  const keys = JSON.parse(saved);
  console.log('📊 Total de chaves:', keys.length);
  
  keys.forEach((key, i) => {
    console.log(`\n🔑 Chave #${i + 1}:`);
    console.log('  Nome:', key.name);
    console.log('  Tipo:', key.type);
    console.log('  Comprimento:', key.key?.length);
    console.log('  Preview:', key.key?.substring(0, 20));
  });
} else {
  console.log('❌ Nenhuma chave encontrada no localStorage');
}
```

---

## 📝 Formato Correto das Chaves

### YouTube Data API Key
- **Formato**: `AIzaSy...`
- **Comprimento**: 39 caracteres
- **Exemplo**: `AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxx`

### OpenAI API Key
- **Formato**: `sk-...`
- **Comprimento**: 51+ caracteres
- **Exemplo**: `sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## ⚠️ Erros Comuns

### ❌ Erro: "API key not valid"
**Causa**: Chave mockada ou inválida salva no sistema
**Solução**: Seguir os passos acima

### ❌ Erro: "Chave descriptografada = https"
**Causa**: URL foi salva ao invés da chave API
**Solução**: Deletar e adicionar chave correta

### ❌ Erro: "Nenhum comentário extraído"
**Causa**: Chave inválida ou vídeo sem comentários habilitados
**Solução**: Verificar chave e testar com vídeo popular

---

## 🎯 Verificação Rápida

Após configurar, execute no console (F12):

```javascript
// Teste rápido
fetch('https://www.googleapis.com/youtube/v3/videos?part=snippet&id=dQw4w9WgXcQ&key=SUA_CHAVE_AQUI')
  .then(r => r.json())
  .then(d => {
    if (d.items) {
      console.log('✅ Chave YouTube funcionando!');
    } else {
      console.log('❌ Erro:', d.error?.message);
    }
  });
```

Substitua `SUA_CHAVE_AQUI` pela sua chave real.

---

## 📚 Links Úteis

- **YouTube API Console**: https://console.cloud.google.com/apis/credentials
- **YouTube API Docs**: https://developers.google.com/youtube/v3
- **OpenAI API Keys**: https://platform.openai.com/api-keys

---

## 🆘 Suporte

Se o problema persistir após seguir todos os passos:

1. Tire print do console (F12) mostrando os erros
2. Verifique se a chave está correta no Google Cloud Console
3. Teste a chave manualmente com o comando de verificação acima

**Status**: ⚠️ AÇÃO URGENTE NECESSÁRIA
