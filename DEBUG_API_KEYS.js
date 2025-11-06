// Script de Debug e Correção de API Keys
// Cole isso no console do navegador (F12)

console.log('🔍 ===== DEBUG DE API KEYS =====');

// 1. Verificar localStorage
const saved = localStorage.getItem('viralticket_api_keys');
console.log('\n📦 1. LocalStorage Raw:');
console.log(saved);

if (saved) {
  const keys = JSON.parse(saved);
  console.log('\n📊 2. Chaves Encontradas:', keys.length);
  
  keys.forEach((key, index) => {
    console.log(`\n🔑 Chave #${index + 1}:`);
    console.log('  - Nome:', key.name);
    console.log('  - Tipo:', key.type);
    console.log('  - Status:', key.status);
    console.log('  - Criptografada:', key.encrypted);
    console.log('  - Key comprimento:', key.key?.length);
    console.log('  - Key preview:', key.key?.substring(0, 20) + '...');
    
    // Tentar descriptografar
    if (key.key && key.key.startsWith('enc_')) {
      try {
        const ENCRYPTION_KEY = 'VIRALTICKET_SECRET_KEY_2024';
        const encrypted = key.key.substring(4);
        
        // Reverter rotação
        const unrotated = encrypted.split('').map((char, i) => {
          const code = char.charCodeAt(0);
          const rotation = (i % ENCRYPTION_KEY.length);
          return String.fromCharCode(code - rotation);
        }).join('');
        
        // Decodificar Base64
        const decoded = atob(unrotated);
        console.log('  - Decoded:', decoded);
        
        // Remover salt
        const [salt, text] = decoded.split(':');
        console.log('  - Salt:', salt);
        console.log('  - Text:', text);
        console.log('  - Text length:', text?.length);
        
        if (text && text.length > 10) {
          console.log('  ✅ Chave parece válida!');
        } else {
          console.log('  ❌ Chave INVÁLIDA! Muito curta:', text);
        }
      } catch (e) {
        console.log('  ❌ Erro ao descriptografar:', e.message);
      }
    }
  });
}

console.log('\n\n💡 ===== INSTRUÇÕES DE CORREÇÃO =====');
console.log('Se a chave está inválida:');
console.log('1. Vá para Admin → API Keys');
console.log('2. Delete a chave inválida');
console.log('3. Clique em "Nova Chave"');
console.log('4. Cole sua chave REAL do YouTube (começa com AIza...)');
console.log('5. Salve e teste novamente');
console.log('\n📝 Chave YouTube correta tem 39 caracteres e começa com "AIza"');
console.log('📝 Exemplo: AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxx');

// Opção para limpar tudo
console.log('\n\n🧹 Para limpar TODAS as chaves e começar do zero:');
console.log('localStorage.removeItem("viralticket_api_keys");');
console.log('window.location.reload();');
