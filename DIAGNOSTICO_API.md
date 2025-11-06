# 🔍 Script de Diagnóstico - Chaves API

## Como usar:

1. Abra o **Console do Navegador** (F12)
2. Cole o script abaixo e pressione Enter
3. **COPIE TODA A SAÍDA** e me envie

```javascript
console.clear();
console.log('========================================');
console.log('🔍 DIAGNÓSTICO DE CHAVES API - ViralTicket');
console.log('========================================\n');

// 1. Verificar localStorage
const saved = localStorage.getItem('viralticket_api_keys');
console.log('📦 1. LocalStorage:');
if (saved) {
  console.log('✅ Existe');
  try {
    const keys = JSON.parse(saved);
    console.log(`   Total de chaves: ${keys.length}`);
    
    keys.forEach((key, index) => {
      console.log(`\n   Chave ${index + 1}:`);
      console.log(`   - Nome: ${key.name}`);
      console.log(`   - Tipo: ${key.type}`);
      console.log(`   - Status: ${key.status}`);
      console.log(`   - Tem chave?: ${!!key.key}`);
      if (key.key) {
        console.log(`   - Comprimento: ${key.key.length} caracteres`);
        console.log(`   - Primeiros 10: ${key.key.substring(0, 10)}`);
        console.log(`   - Últimos 4: ${key.key.substring(key.key.length - 4)}`);
        console.log(`   - Contém '•': ${key.key.includes('•')}`);
        console.log(`   - Contém '*': ${key.key.includes('*')}`);
      }
      console.log(`   - Encrypted flag: ${key.encrypted}`);
    });
  } catch (e) {
    console.error('❌ Erro ao parsear:', e);
  }
} else {
  console.log('❌ Não existe');
}

// 2. Verificar usuário
console.log('\n👤 2. Usuário:');
const userData = localStorage.getItem('viralticket_user');
if (userData) {
  try {
    const user = JSON.parse(userData);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - É Admin?: ${user.isAdmin}`);
    console.log(`   - Plano: ${user.plan}`);
  } catch (e) {
    console.error('❌ Erro ao ler usuário:', e);
  }
} else {
  console.log('❌ Usuário não encontrado');
}

// 3. Testar formato de chaves
console.log('\n🔑 3. Validação de Formato:');
if (saved) {
  const keys = JSON.parse(saved);
  const openaiKey = keys.find(k => k.type === 'openai');
  const youtubeKey = keys.find(k => k.type === 'youtube');
  
  if (openaiKey?.key) {
    console.log('   OpenAI:');
    const key = openaiKey.key;
    console.log(`   ✓ Começa com 'sk-'?: ${key.startsWith('sk-')}`);
    console.log(`   ✓ Comprimento > 30?: ${key.length > 30}`);
    console.log(`   ✓ Sem caracteres mockados?: ${!key.includes('•') && !key.includes('*')}`);
  }
  
  if (youtubeKey?.key) {
    console.log('   YouTube:');
    const key = youtubeKey.key;
    console.log(`   ✓ Começa com 'AIza'?: ${key.startsWith('AIza')}`);
    console.log(`   ✓ Comprimento > 30?: ${key.length > 30}`);
    console.log(`   ✓ Sem caracteres mockados?: ${!key.includes('•') && !key.includes('*')}`);
  }
}

console.log('\n========================================');
console.log('✅ Diagnóstico completo!');
console.log('📋 Copie toda essa saída e envie para análise');
console.log('========================================');
```

---

## ✅ O QUE DEVE APARECER (Exemplo correto):

```
📦 1. LocalStorage:
✅ Existe
   Total de chaves: 2

   Chave 1:
   - Nome: YouTube Data API
   - Tipo: youtube
   - Status: active
   - Tem chave?: true
   - Comprimento: 39 caracteres
   - Primeiros 10: AIzaSyBxxx
   - Últimos 4: xxxx
   - Contém '•': false
   - Contém '*': false
   - Encrypted flag: false

   Chave 2:
   - Nome: OpenAI API
   - Tipo: openai
   - Status: active
   - Tem chave?: true
   - Comprimento: 51 caracteres
   - Primeiros 10: sk-proj-xx
   - Últimos 4: xxxx
   - Contém '•': false
   - Contém '*': false
   - Encrypted flag: false

🔑 3. Validação de Formato:
   OpenAI:
   ✓ Começa com 'sk-': true
   ✓ Comprimento > 30: true
   ✓ Sem caracteres mockados: true
   
   YouTube:
   ✓ Começa com 'AIza': true
   ✓ Comprimento > 30: true
   ✓ Sem caracteres mockados: true
```

---

## ❌ Se aparecer isso, está ERRADO:

```
   - Contém '•': true    ← PROBLEMA: Chave mockada!
   - Contém '*': true    ← PROBLEMA: Chave mockada!
   ✓ Comprimento > 30: false    ← PROBLEMA: Chave muito curta!
   ✓ Começa com 'sk-': false    ← PROBLEMA: Formato errado!
```

---

## 🔧 Como Corrigir (se estiver errado):

### Opção 1: Via Console (Rápido)

```javascript
// Substitua pelas suas chaves REAIS:
const apiKeys = [
  {
    id: '1',
    name: 'YouTube Data API',
    key: 'COLE_SUA_CHAVE_YOUTUBE_AQUI',  // AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxx
    type: 'youtube',
    status: 'active',
    quota: 0,
    lastUsed: new Date().toISOString(),
    encrypted: false,
  },
  {
    id: '2',
    name: 'OpenAI API',
    key: 'COLE_SUA_CHAVE_OPENAI_AQUI',  // sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxx
    type: 'openai',
    status: 'active',
    quota: 0,
    lastUsed: new Date().toISOString(),
    encrypted: false,
  },
];

localStorage.setItem('viralticket_api_keys', JSON.stringify(apiKeys));
console.log('✅ Chaves configuradas! Recarregue a página (F5)');
```

### Opção 2: Via Interface Admin

1. Vá para **Admin → API Keys**
2. Verá um **alerta amarelo** se as chaves estão mockadas
3. Clique em "Editar" em cada chave
4. Cole a chave REAL (sem espaços, completa)
5. Salve

---

## 🆘 Envie para Análise

Após rodar o script de diagnóstico, **copie TODA a saída do console** e me envie para eu ver exatamente o que está acontecendo!
