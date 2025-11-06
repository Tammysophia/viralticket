// ========================================
// 🔍 VERIFICAÇÃO RÁPIDA DE CHAVES API
// ========================================
// Cole este código no console do navegador (F12)

console.clear();
console.log('🔍 ===== VERIFICANDO SUAS CHAVES API =====\n');

// Função de descriptografia
const ENCRYPTION_KEY = 'VIRALTICKET_SECRET_KEY_2024';

function decryptKey(encryptedText) {
  if (!encryptedText || !encryptedText.startsWith('enc_')) {
    return encryptedText; // Não está criptografada
  }
  
  try {
    const encrypted = encryptedText.substring(4);
    
    // Reverter rotação
    const unrotated = encrypted.split('').map((char, i) => {
      const code = char.charCodeAt(0);
      const rotation = (i % ENCRYPTION_KEY.length);
      return String.fromCharCode(code - rotation);
    }).join('');
    
    // Decodificar Base64
    const decoded = atob(unrotated);
    
    // Remover salt
    const parts = decoded.split(':');
    return parts[1] || decoded;
  } catch (e) {
    console.error('❌ Erro ao descriptografar:', e.message);
    return null;
  }
}

// Buscar chaves do localStorage
const saved = localStorage.getItem('viralticket_api_keys');

if (!saved) {
  console.log('❌ NENHUMA CHAVE ENCONTRADA!');
  console.log('\n📝 Você precisa:');
  console.log('1. Fazer login como Admin');
  console.log('2. Ir para Admin → API Keys');
  console.log('3. Adicionar suas chaves');
} else {
  const keys = JSON.parse(saved);
  console.log(`✅ Total de chaves salvas: ${keys.length}\n`);
  
  keys.forEach((key, index) => {
    console.log(`${'='.repeat(60)}`);
    console.log(`🔑 CHAVE #${index + 1}: ${key.name}`);
    console.log(`${'='.repeat(60)}`);
    console.log(`📌 Tipo: ${key.type}`);
    console.log(`📌 Status: ${key.status}`);
    console.log(`📌 Criptografada: ${key.encrypted ? 'Sim' : 'Não'}`);
    
    // Descriptografar
    const decrypted = decryptKey(key.key);
    
    if (decrypted) {
      console.log(`\n📏 Comprimento da chave: ${decrypted.length} caracteres`);
      console.log(`🔤 Começa com: "${decrypted.substring(0, 10)}..."`);
      console.log(`🔤 Termina com: "...${decrypted.substring(decrypted.length - 4)}"`);
      
      // Validação específica
      if (key.type === 'youtube') {
        console.log('\n🎯 VALIDAÇÃO YOUTUBE:');
        if (decrypted.startsWith('AIza')) {
          console.log('  ✅ Começa com "AIza" (correto)');
        } else {
          console.log('  ❌ NÃO começa com "AIza" (INCORRETO!)');
          console.log(`  ⚠️  Atual: "${decrypted.substring(0, 10)}..."`);
        }
        
        if (decrypted.length === 39) {
          console.log('  ✅ Tem 39 caracteres (correto)');
        } else {
          console.log(`  ❌ Tem ${decrypted.length} caracteres (INCORRETO! Deveria ter 39)`);
        }
        
        if (decrypted.includes('http')) {
          console.log('  ❌ CONTÉM URL! Você salvou uma URL ao invés da chave!');
        }
        
        // Verifica se é mockada
        if (decrypted.includes('•') || decrypted.includes('*') || decrypted === 'AIza************************') {
          console.log('  ❌ CHAVE MOCKADA! Esta não é uma chave real!');
        }
        
      } else if (key.type === 'openai') {
        console.log('\n🎯 VALIDAÇÃO OPENAI:');
        if (decrypted.startsWith('sk-')) {
          console.log('  ✅ Começa com "sk-" (correto)');
        } else {
          console.log('  ❌ NÃO começa com "sk-" (INCORRETO!)');
        }
        
        if (decrypted.length >= 40) {
          console.log(`  ✅ Tem ${decrypted.length} caracteres (correto)`);
        } else {
          console.log(`  ❌ Tem ${decrypted.length} caracteres (muito curta!)`);
        }
      }
      
      // Resultado final
      const isValid = 
        (key.type === 'youtube' && decrypted.startsWith('AIza') && decrypted.length === 39 && !decrypted.includes('http')) ||
        (key.type === 'openai' && decrypted.startsWith('sk-') && decrypted.length >= 40);
      
      if (isValid) {
        console.log('\n✅ ESTA CHAVE PARECE VÁLIDA! ✅');
      } else {
        console.log('\n❌ ESTA CHAVE ESTÁ INVÁLIDA! ❌');
        console.log('⚠️  Você precisa DELETAR e adicionar uma chave correta!');
      }
    } else {
      console.log('❌ Erro ao descriptografar esta chave!');
    }
    
    console.log('\n');
  });
  
  console.log(`${'='.repeat(60)}`);
  console.log('📊 RESUMO:');
  console.log(`${'='.repeat(60)}`);
  
  const youtubeKeys = keys.filter(k => k.type === 'youtube');
  const openaiKeys = keys.filter(k => k.type === 'openai');
  
  console.log(`🎥 Chaves YouTube: ${youtubeKeys.length}`);
  console.log(`🤖 Chaves OpenAI: ${openaiKeys.length}`);
  
  // Verificar se há chaves inválidas
  const hasInvalidKeys = keys.some(k => {
    const dec = decryptKey(k.key);
    return dec && (
      dec.includes('http') ||
      dec.includes('•') ||
      dec.includes('*') ||
      dec.length < 10
    );
  });
  
  if (hasInvalidKeys) {
    console.log('\n⚠️  ATENÇÃO: Chaves inválidas detectadas!');
    console.log('📝 Ações necessárias:');
    console.log('   1. Vá para Admin → API Keys');
    console.log('   2. Delete as chaves inválidas');
    console.log('   3. Adicione chaves reais das suas contas');
  }
}

console.log('\n\n💡 COMO OBTER CHAVES REAIS:');
console.log('━'.repeat(60));
console.log('🎥 YouTube: https://console.cloud.google.com/apis/credentials');
console.log('   → Criar projeto → Ativar YouTube Data API v3 → Criar API Key');
console.log('');
console.log('🤖 OpenAI: https://platform.openai.com/api-keys');
console.log('   → Create new secret key → Copiar chave (começa com sk-)');
console.log('━'.repeat(60));

console.log('\n\n🧹 PARA LIMPAR TUDO E COMEÇAR DO ZERO:');
console.log('localStorage.removeItem("viralticket_api_keys");');
console.log('window.location.reload();');
