// VT: secure-agent - Componente para executar agentes de IA
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Lock, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { runAgent, validateUserInput, formatAgentResult } from '../services/agentsService';
import Button from './Button';
import Input from './Input';
import Card from './Card';

/**
 * Componente para executar agentes de IA de forma segura
 * NUNCA mostra prompts internos - apenas aceita input e exibe resultado
 */
export default function AgentRunner({ agentId, agentName, onComplete, offerId = null }) {
  const [userInput, setUserInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleRun = async () => {
    try {
      // Validar input
      validateUserInput(userInput);
      
      setIsRunning(true);
      setError(null);
      
      // Executar agente (Cloud Function faz todo o trabalho pesado)
      const response = await runAgent(agentId, userInput, { offerId });
      
      // Formatar resultado
      const formatted = formatAgentResult(response.result);
      
      setResult({
        ...formatted,
        runId: response.runId,
        metadata: response.metadata
      });
      
      toast.success(`${agentName} gerou sua oferta com sucesso!`);
      
      // Callback se fornecido
      if (onComplete) {
        onComplete(formatted, response.runId);
      }
      
    } catch (err) {
      console.error('Erro ao executar agente:', err);
      setError(err.message);
      toast.error('Erro ao gerar oferta: ' + err.message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-purple-500/10 rounded-lg">
            <Sparkles className="w-6 h-6 text-purple-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{agentName}</h3>
            <p className="text-sm text-gray-500">
              Inteligência Artificial Proprietária
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Lock className="w-4 h-4" />
            <span>🔒 Template Protegido</span>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800">
            <strong>Privacidade Garantida:</strong> Os templates de IA são criptografados e 
            processados de forma segura. Você só verá o resultado final - nunca os prompts internos.
          </p>
        </div>

        {/* Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cole os comentários ou descreva sua oferta
            </label>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Exemplo: Comentários de um vídeo viral sobre emagrecimento...&#10;&#10;- 'Quero perder peso rápido'&#10;- 'Qual dieta funciona?'&#10;- 'Preciso de ajuda urgente'&#10;&#10;Mínimo 10 caracteres, máximo 10.000"
              className="w-full min-h-[200px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y"
              disabled={isRunning || result}
            />
            <p className="text-xs text-gray-500 mt-1">
              {userInput.length} / 10.000 caracteres
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleRun}
              disabled={!userInput.trim() || isRunning || result}
              variant="primary"
              className="flex-1"
            >
              {isRunning ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Gerando oferta...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gerar Oferta
                </>
              )}
            </Button>

            {result && (
              <Button
                onClick={() => {
                  setResult(null);
                  setUserInput('');
                  setError(null);
                }}
                variant="outline"
              >
                Nova Oferta
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="border-red-200 bg-red-50">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-900 mb-1">Erro</h4>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold text-green-900">Oferta Gerada com Sucesso!</h3>
              </div>

              <div className="space-y-4">
                {/* Title */}
                {result.title && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Título</label>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{result.title}</p>
                  </div>
                )}

                {/* Subtitle */}
                {result.subtitle && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Subtítulo</label>
                    <p className="text-lg text-gray-700 mt-1">{result.subtitle}</p>
                  </div>
                )}

                {/* Description */}
                {result.description && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Descrição</label>
                    <p className="text-sm text-gray-600 mt-1">{result.description}</p>
                  </div>
                )}

                {/* Blocks */}
                {result.blocks && result.blocks.length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">
                      Blocos da Página
                    </label>
                    <div className="space-y-2">
                      {result.blocks.map((block, idx) => (
                        <div key={idx} className="bg-white p-3 rounded border border-gray-200">
                          <span className="text-xs font-medium text-purple-600 uppercase">
                            {block.type}
                          </span>
                          <p className="text-sm text-gray-700 mt-1">{block.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Gerado por <strong>{result.metadata?.agentName}</strong> em{' '}
                    {(result.metadata?.executionTime / 1000).toFixed(1)}s
                    {result.metadata?.tokensUsed && ` · ${result.metadata.tokensUsed} tokens`}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Run ID: {result.runId}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
