import { useState } from 'react';
import { Sparkles, Copy, Loader2, Lock, Shield } from 'lucide-react';
import Button from './Button';
import Card from './Card';
import { useToast } from './Toast';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { useAgents } from '../hooks/useAgents';
import { runAgent, validateUserInput } from '../services/agentsService';
import { createOfferFromAI } from '../services/offersService';

const AIChat = ({ initialText = '' }) => {
  const [selectedAgentId, setSelectedAgentId] = useState('sophia-fenix');
  const [inputText, setInputText] = useState(initialText);
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [runId, setRunId] = useState(null);
  const { user, updateUser } = useAuth();
  const { success, error: showError } = useToast();
  const { t } = useLanguage();
  const { agents, loading: loadingAgents } = useAgents();

  const handleGenerate = async () => {
    // Validações básicas
    if (!inputText.trim()) {
      showError('Digite um comentário ou texto');
      return;
    }

    // VT: secure-agent - Validar input
    try {
      validateUserInput(inputText);
    } catch (validationError) {
      showError(validationError.message);
      return;
    }

    // Verificar limites
    if (user.dailyUsage.offers >= user.limits.offers && user.limits.offers !== 'unlimited') {
      showError('Limite diário de ofertas atingido');
      return;
    }

    setLoading(true);
    setOutput(null);
    setRunId(null);

    const selectedAgent = agents.find(a => a.id === selectedAgentId);
    const agentName = selectedAgent?.name || 'Sophia';

    try {
      console.log('VT: Executando agente:', selectedAgentId);
      
      let result;
      let isLegacyMode = false;
      
      // VT: secure-agent - Tentar Cloud Function primeiro (seguro)
      try {
        result = await runAgent(selectedAgentId, inputText);
        console.log('VT: Resultado recebido via Cloud Function:', result.runId);
        setOutput(result.result);
        setRunId(result.runId);
      } catch (cloudFunctionError) {
        console.warn('VT: Cloud Functions não disponíveis, usando modo legado:', cloudFunctionError.message);
        
        // Fallback: Usar sistema antigo (OpenAI direto)
        isLegacyMode = true;
        const { generateOffer } = await import('../services/openaiService');
        
        // Mapear IDs novos para antigos
        const legacyAgentMap = {
          'sophia-fenix': 'sophia',
          'sophia-universal': 'sofia'
        };
        const legacyAgentId = legacyAgentMap[selectedAgentId] || 'sophia';
        
        const offerData = await generateOffer(inputText, legacyAgentId);
        
        // Converter formato antigo para novo
        result = {
          runId: `legacy_${Date.now()}`,
          result: offerData,
          metadata: {
            agentName: selectedAgent?.name || 'Sophia',
            executionTime: 0,
            tokensUsed: 0
          }
        };
        
        console.log('VT: Resultado recebido via modo legado');
        setOutput(result.result);
        setRunId(result.runId);
      }
      
      // Atualizar usage
      updateUser({
        dailyUsage: {
          ...user.dailyUsage,
          offers: user.dailyUsage.offers + 1,
        },
      });
      
      success(`✨ ${agentName} gerou sua oferta com sucesso!${isLegacyMode ? ' (modo compatibilidade)' : ''}`);

      // VT: Salvar oferta automaticamente no Kanban
      try {
        const offerData = {
          userId: user.uid,
          title: result.result.title || 'Nova Oferta IA',
          agent: selectedAgentId,
          copy: {
            page: formatOfferCopy(result.result),
            adPrimary: result.result.subtitle || (result.result.bullets ? result.result.bullets.join(' ') : ''),
            adHeadline: result.result.title,
            adDescription: result.result.subtitle || result.result.description || ''
          },
          youtubeLinks: []
        };
        
        const offerId = await createOfferFromAI(offerData);
        console.log('VT: Oferta salva no Kanban:', offerId);
        success('📝 Oferta salva no Kanban automaticamente!');
        
      } catch (saveError) {
        console.error('VT: Erro ao salvar oferta no Kanban:', saveError);
        // Não bloqueia o fluxo principal
      }
      
    } catch (err) {
      console.error('VT: Erro ao gerar oferta:', err);
      
      if (user.isAdmin) {
        showError(`⚠️ Erro: ${err.message}`);
      } else {
        showError('🎯 Erro ao gerar oferta. Tente novamente!');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Helper para formatar copy da oferta
  const formatOfferCopy = (result) => {
    let copy = `${result.title || ''}\n\n${result.subtitle || ''}\n\n`;
    
    if (result.description) {
      copy += `${result.description}\n\n`;
    }
    
    if (result.blocks && result.blocks.length > 0) {
      result.blocks.forEach(block => {
        if (block.content) {
          copy += `${block.content}\n\n`;
        }
        if (block.data?.items) {
          copy += block.data.items.join('\n') + '\n\n';
        }
      });
    }
    
    return copy.trim();
  };

  const handleCopy = () => {
    if (!output) return;
    
    const text = formatOfferCopy(output);
    navigator.clipboard.writeText(text);
    success('✅ Oferta copiada!');
  };

  return (
    <div className="space-y-6">
      {/* Agent Selection */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            Selecione a IA
            <Shield className="w-5 h-5 text-purple-400" />
          </h3>
          {/* VT: Badge de segurança */}
          <span className="text-xs px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full flex items-center gap-1">
            <Lock className="w-3 h-3" />
            IA Exclusiva
          </span>
        </div>
        
        {loadingAgents ? (
          <div className="text-center py-8 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            Carregando agentes...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgentId(agent.id)}
                className={`p-4 rounded-xl border-2 transition-all relative ${
                  selectedAgentId === agent.id
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-white/10 glass-hover'
                }`}
              >
                {/* Badge IA Exclusiva */}
                <div className="absolute top-2 right-2">
                  <Lock className="w-4 h-4 text-purple-400" />
                </div>
                
                <div className="text-4xl mb-2">{agent.emoji || '🤖'}</div>
                <h4 className="font-bold mb-1">{agent.name}</h4>
                <p className="text-sm text-gray-400">{agent.description}</p>
                
                {/* Indicador de versão */}
                {agent.version && (
                  <span className="text-xs text-gray-500 mt-2 block">
                    v{agent.version}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* Input */}
      <Card>
        <h3 className="text-xl font-bold mb-4">Comentário ou Texto</h3>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Cole os comentários do vídeo ou descreva a dor/desejo do público...&#10;&#10;💡 Dica: Você pode colar até 50.000 caracteres (aprox. 200 comentários)"
          className="w-full glass border border-white/10 rounded-lg px-4 py-3 min-h-[150px] focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-y"
          disabled={loading}
        />
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>{inputText.length.toLocaleString()} / 50.000 caracteres</span>
          {inputText.length > 45000 && (
            <span className="text-yellow-500">⚠️ Perto do limite</span>
          )}
          {inputText.length > 50000 && (
            <span className="text-red-500">❌ Limite excedido</span>
          )}
        </div>
        <Button
          onClick={handleGenerate}
          loading={loading}
          disabled={loadingAgents}
          className="w-full mt-4"
          icon={Sparkles}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {agents.find(a => a.id === selectedAgentId)?.name || 'Sophia'} está gerando sua oferta...
            </>
          ) : (
            t('generate')
          )}
        </Button>
      </Card>

      {/* Output */}
      {output && (
        <Card gradient>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold">✨ Oferta Gerada</h3>
              {runId && (
                <p className="text-xs text-gray-400 mt-1">ID: {runId.slice(0, 8)}...</p>
              )}
            </div>
            <Button variant="secondary" onClick={handleCopy} icon={Copy}>
              {t('copy')}
            </Button>
          </div>

          {/* Notice de segurança */}
          <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <p className="text-xs text-purple-300 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Resultado gerado por IA proprietária - template protegido com criptografia
            </p>
          </div>

          <div className="space-y-4">
            {/* Title */}
            {output.title && (
              <div>
                <h2 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
                  {output.title}
                </h2>
              </div>
            )}

            {/* Subtitle */}
            {output.subtitle && (
              <p className="text-lg text-gray-300">{output.subtitle}</p>
            )}

            {/* Description */}
            {output.description && (
              <p className="text-gray-400">{output.description}</p>
            )}

            {/* Blocks */}
            {output.blocks && output.blocks.length > 0 && (
              <div className="space-y-3">
                {output.blocks.map((block, index) => (
                  <div key={index} className="glass border border-white/10 rounded-lg p-4">
                    <span className="text-xs font-medium text-purple-400 uppercase block mb-2">
                      {block.type}
                    </span>
                    <p className="text-gray-300 whitespace-pre-wrap">{block.content}</p>
                    
                    {/* Items (benefícios, bônus, etc) */}
                    {block.data?.items && (
                      <div className="mt-2 space-y-1">
                        {block.data.items.map((item, i) => (
                          <p key={i} className="text-gray-300">{item}</p>
                        ))}
                      </div>
                    )}
                    
                    {/* CTA especial */}
                    {block.type === 'cta' && block.data?.text && (
                      <div className="mt-3 p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg text-center">
                        <p className="font-bold text-lg gradient-primary bg-clip-text text-transparent">
                          {block.data.text}
                        </p>
                        {block.data.urgency && (
                          <p className="text-sm text-yellow-400 mt-1">{block.data.urgency}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Legacy format support (bullets, cta, bonus) */}
            {output.bullets && output.bullets.length > 0 && (
              <div className="space-y-2">
                {output.bullets.map((bullet, index) => (
                  <p key={index} className="text-gray-300">{bullet}</p>
                ))}
              </div>
            )}

            {output.cta && (
              <div className="glass border border-purple-500/30 rounded-lg p-4 text-center">
                <p className="text-xl font-bold gradient-primary bg-clip-text text-transparent">
                  {output.cta}
                </p>
              </div>
            )}

            {output.bonus && (
              <p className="text-center text-yellow-400">{output.bonus}</p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default AIChat;
