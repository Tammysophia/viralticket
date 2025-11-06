// Cole este código no Console do Navegador (F12)
console.clear();
console.log('========================================');
console.log('🔍 DEBUG RÁPIDO - ViralTicket');
console.log('========================================\n');

// 1. Verificar localStorage
const saved = localStorage.getItem('viralticket_api_keys');
console.log('📦 1. CHAVES NO LOCALSTORAGE:');
if (saved) {
  const keys = JSON.parse(saved);
  console.log(`✅ ${keys.length} chaves encontradas\n`);
  
  keys.forEach((key, i) => {
    console.log(`Chave ${i + 1}:`);
    console.log(`  Nome: ${key.name}`);
    console.log(`  Tipo: ${key.type}`);
    console.log(`  Status: ${key.status}`);
    if (key.key) {
      console.log(`  Comprimento: ${key.key.length} caracteres`);
      console.log(`  Primeiros 15: ${key.key.substring(0, 15)}`);
      console.log(`  Últimos 4: ...${key.key.substring(key.key.length - 4)}`);
      console.log(`  Contém '•'?: ${key.key.includes('•')}`);
      console.log(`  Contém '*'?: ${key.key.includes('*')}`);
      
      // Validar formato específico
      if (key.type === 'openai') {
        console.log(`  ✓ Começa com 'sk-'?: ${key.key.startsWith('sk-')}`);
        console.log(`  ✓ Comprimento adequado?: ${key.key.length > 30}`);
      }
      if (key.type === 'youtube') {
        console.log(`  ✓ Começa com 'AIza'?: ${key.key.startsWith('AIza')}`);
        console.log(`  ✓ Comprimento adequado?: ${key.key.length > 30}`);
      }
    } else {
      console.log(`  ❌ CHAVE VAZIA!`);
    }
    console.log('');
  });
} else {
  console.log('❌ NENHUMA chave no localStorage!\n');
}

// 2. Verificar usuário
console.log('👤 2. USUÁRIO:');
const userData = localStorage.getItem('viralticket_user');
if (userData) {
  const user = JSON.parse(userData);
  console.log(`  Email: ${user.email}`);
  console.log(`  É Admin?: ${user.isAdmin}`);
  console.log(`  Plano: ${user.plan}`);
} else {
  console.log('  ❌ Usuário não encontrado');
}

console.log('\n========================================');
console.log('✅ DEBUG COMPLETO!');
console.log('📋 COPIE TODA ESSA SAÍDA E ME ENVIE');
console.log('========================================');
