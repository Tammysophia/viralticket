// 🧪 TESTAR CONFIGURAÇÃO DOS AGENTES IA NO FIRESTORE
// Cole este código no console (F12) e execute

(async function testarAgentesIA() {
  console.log('🧪 ========================================');
  console.log('🧪 TESTANDO CONFIGURAÇÃO DOS AGENTES IA');
  console.log('🧪 ========================================\n');

  try {
    // Importar Firestore
    const { db } = await import('./src/config/firebase.js');
    const { collection, getDocs, doc, getDoc } = await import('firebase/firestore');

    // Listar todos os agentes configurados
    console.log('📋 Buscando agentes na coleção agent_templates...\n');
    
    const agentsCollection = collection(db, 'agent_templates');
    const agentsSnapshot = await getDocs(agentsCollection);

    if (agentsSnapshot.empty) {
      console.error('❌ NENHUM AGENTE ENCONTRADO!');
      console.log('\n📝 SOLUÇÃO:');
      console.log('   1. Vá no Firebase Console → Firestore');
      console.log('   2. Crie a coleção: agent_templates');
      console.log('   3. Adicione documentos: sophia, sofia, etc.');
      return;
    }

    console.log(`✅ Encontrados ${agentsSnapshot.size} agente(s):\n`);

    // Analisar cada agente
    for (const agentDoc of agentsSnapshot.docs) {
      const agentId = agentDoc.id;
      const data = agentDoc.data();

      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`🤖 AGENTE: ${agentId}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      
      if (data.name) {
        console.log(`📛 Nome: ${data.name}`);
      }
      
      if (data.description) {
        console.log(`📝 Descrição: ${data.description}`);
      }

      if (data.prompt) {
        const promptLength = data.prompt.length;
        console.log(`📏 Tamanho do prompt: ${promptLength.toLocaleString()} caracteres`);
        
        // Verificar se tem JSON no final
        const temJsonNoFinal = data.prompt.includes('### 🎯 JSON PARA SISTEMA') || 
                               data.prompt.includes('"title":') && 
                               data.prompt.includes('"subtitle":') && 
                               data.prompt.includes('"bullets":');
        
        if (temJsonNoFinal) {
          console.log('✅ JSON configurado no prompt!');
        } else {
          console.warn('⚠️  JSON NÃO ENCONTRADO no final do prompt!');
          console.log('📝 SOLUÇÃO: Adicione a seção JSON no final do prompt');
          console.log('   Veja: PROMPT_SOPHIA_UNIVERSAL_JSON.md');
        }

        // Mostrar primeiros e últimos 200 caracteres
        console.log('\n📄 Primeiros 200 caracteres:');
        console.log(data.prompt.substring(0, 200) + '...');
        
        console.log('\n📄 Últimos 300 caracteres:');
        console.log('...' + data.prompt.substring(promptLength - 300));
        
      } else {
        console.error('❌ Campo "prompt" não encontrado!');
      }

      console.log(''); // Linha em branco
    }

    console.log('\n🎯 ========================================');
    console.log('🎯 TESTE CONCLUÍDO!');
    console.log('🎯 ========================================\n');

    console.log('📝 PRÓXIMOS PASSOS:');
    console.log('   1. Se algum agente está sem JSON, adicione no Firestore');
    console.log('   2. Teste gerando uma oferta no sistema');
    console.log('   3. Veja os logs para confirmar que funcionou');

  } catch (error) {
    console.error('❌ Erro ao testar agentes:', error);
    console.log('\n📝 POSSÍVEL CAUSA:');
    console.log('   - Firebase não inicializado');
    console.log('   - Sem permissão para ler Firestore');
    console.log('   - Coleção agent_templates não existe');
  }
})();
