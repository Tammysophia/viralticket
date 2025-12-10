import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { generateOffer } from '../services/openaiService';
import { getAgentPromptFromFirestore } from '../services/firebaseService';
import { success, error } from '../utils/toast';
import { getLanguageForAI } from '../utils/i18n';
import { getAgentConfig } from '../services/agentsService';
import { getOfferConfig } from '../services/offersService';
import { useTranslation } from 'react-i18next';

// Componentes de UI
import AgentSelector from './AgentSelector';
import OfferInput from './OfferInput';
import OfferOutput from './OfferOutput';
import EbookGenerator from './EbookGenerator';
import OfferGenerator from './OfferGenerator';
import WordpressGenerator from './WordpressGenerator';
import CreativeGenerator from './CreativeGenerator';
import QuizGenerator from './QuizGenerator';

const AIChat = () => {
  const { currentUser } = useAuth();
  const { t } = useTranslation();

  const [selectedAgent, setSelectedAgent] = useState('sophia');
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [agentConfig, setAgentConfig] = useState({});
  const [offerConfig, setOfferConfig] = useState({});

  const outputRef = useRef(null);

  useEffect(() => {
    const fetchConfigs = async () => {
      const agentData = await getAgentConfig();
      const offerData = await getOfferConfig();
      setAgentConfig(agentData);
      setOfferConfig(offerData);
    };
    fetchConfigs();
  }, []);

  // Scroll para o final da resposta
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [output]);

  // VT: Gerar a Oferta Principal
  const handleGenerateOffer = async () => {
    if (!input) {
      error(t('Please enter your offer details.'));
      return;
    }

    setLoading(true);
    setOutput(null); // Limpar output anterior

    try {
      console.log(`🚀 VT: Gerando oferta principal com agente ${selectedAgent}...`);

      // 1. Buscar prompt principal no Firebase (agent_module)
      let specificPromptType = selectedOffer ? selectedOffer.id : 'default';
      
      // Se for a oferta principal, o prompt é o 'offer'
      if (specificPromptType !== 'offer') {
        specificPromptType = 'offer';
      }

      const offerData = await generateOffer(input, selectedAgent, getLanguageForAI(), specificPromptType, false);

      setOutput({
        title: t('Offer Generated'),
        fullResponse: offerData.fullResponse,
        jsonResponse: offerData.jsonResponse,
        ebookFormat: {},
        wordpressFormat: {},
        creativeFormat: {},
        quizFormat: {}
      });

      success(t('Offer generated successfully!'));
    } catch (err) {
      console.error('❌ VT: Erro ao gerar oferta principal:', err);
      error(t('Error generating offer. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // VT: Gerar formato específico do Ebook
  const handleGenerateEbookFormat = async (format) => {
    if (!output || !output.title) {
      error(t('Please generate the main offer first.'));
      return;
    }

    setLoading(true);

    try {
      console.log(`📘 VT: Gerando ebook em formato ${format}...`);

      const formatNames = {
        'canva': t('Canva (visual design simple)'),
        'gama': t('Gama (ebook structure)')
      };

      // ✅ NOVO: Mapear formato para nome do prompt específico no Firebase
      const promptMapping = {
        'canva': 'canva',
        'gama': 'gama'
      };
      
      const specificPromptType = promptMapping[format];
      
      // ✅ Contexto COMPLETO com a oferta já gerada
      const offerContext = `OFERTA COMPLETA JÁ GERADA:

${output.fullResponse}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Com base na oferta completa acima, gere APENAS o formato solicitado.`;

      // ✅ Chamar generateOffer com prompt específico do Firebase
      const ebookData = await generateOffer(offerContext, selectedAgent, getLanguageForAI(), specificPromptType, true);

      // ✅ NOVO: Armazenar ebook separadamente
      setOutput(prev => ({
        ...prev,
        ebookFormat: {
          ...prev.ebookFormat,
          [format]: ebookData.fullResponse.replace(/json\s*\{[\s\S]*?"title"[\s\S]*?\}/gi, '').trim() || t('Ebook generated successfully!')
        },
        fullResponse: prev.fullResponse + '\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n### 📘 EBOOK - ' + formatNames[format].toUpperCase() + '\n\n' + (ebookData.fullResponse || t('Ebook generated successfully!'))
      }));

      success(t('Ebook generated successfully!'));
    } catch (err) {
      console.error(`❌ VT: Error generating ebook format ${format}:`, err);
      error(t('Error generating ebook. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // VT: Gerar formato específico do Wordpress
  const handleGenerateWordpressFormat = async (format) => {
    if (!output || !output.title) {
      error(t('Please generate the main offer first.'));
      return;
    }

    setLoading(true);

    try {
      console.log(`🌐 VT: Gerando Wordpress em formato ${format}...`);

      const formatNames = {
        'manual': t('Manual (Elementor)'),
        'iabuilder': t('IA Builder (Lovable/Gama)')
      };

      // ✅ NOVO: Mapear formato para nome do prompt específico no Firebase
      const promptMapping = {
        'manual': 'wordpress_manual',
        'iabuilder': 'wordpress_iabuilder'
      };
      
      const specificPromptType = promptMapping[format];
      
      // ✅ Contexto COMPLETO com a oferta já gerada
      const offerContext = `OFERTA COMPLETA JÁ GERADA:

${output.fullResponse}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Com base na oferta completa acima, gere APENAS o formato solicitado.`;

      // ✅ Chamar generateOffer com prompt específico do Firebase
      const wordpressData = await generateOffer(offerContext, selectedAgent, getLanguageForAI(), specificPromptType, true);

      // ✅ NOVO: Armazenar wordpress separadamente
      setOutput(prev => ({
        ...prev,
        wordpressFormat: {
          ...prev.wordpressFormat,
          [format]: wordpressData.fullResponse.replace(/json\s*\{[\s\S]*?"title"[\s\S]*?\}/gi, '').trim() || t('Wordpress generated successfully!')
        },
        fullResponse: prev.fullResponse + '\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n### 🌐 WORDPRESS - ' + formatNames[format].toUpperCase() + '\n\n' + (wordpressData.fullResponse || t('Wordpress generated successfully!'))
      }));

      success(t('Wordpress generated successfully!'));
    } catch (err) {
      console.error(`❌ VT: Error generating Wordpress format ${format}:`, err);
      error(t('Error generating Wordpress. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // VT: Gerar formato específico do Creative
  const handleGenerateCreativeFormat = async (format) => {
    if (!output || !output.title) {
      error(t('Please generate the main offer first.'));
      return;
    }

    setLoading(true);

    try {
      console.log(`🎨 VT: Gerando Creative em formato ${format}...`);

      const formatNames = {
        'image': t('Image (Canva)'),
        'video': t('Video (TikTok/Reels)')
      };

      // ✅ NOVO: Mapear formato para nome do prompt específico no Firebase
      const promptMapping = {
        'image': 'creative_image',
        'video': 'creative_video'
      };
      
      const specificPromptType = promptMapping[format];
      
      // ✅ Contexto COMPLETO com a oferta já gerada
      const offerContext = `OFERTA COMPLETA JÁ GERADA:

${output.fullResponse}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Com base na oferta completa acima, gere APENAS o formato solicitado.`;

      // ✅ Chamar generateOffer com prompt específico do Firebase
      const creativeData = await generateOffer(offerContext, selectedAgent, getLanguageForAI(), specificPromptType, true);

      // ✅ NOVO: Armazenar creative separadamente
      setOutput(prev => ({
        ...prev,
        creativeFormat: {
          ...prev.creativeFormat,
          [format]: creativeData.fullResponse.replace(/json\s*\{[\s\S]*?"title"[\s\S]*?\}/gi, '').trim() || t('Creative generated successfully!')
        },
        fullResponse: prev.fullResponse + '\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n### 🎨 CREATIVE - ' + formatNames[format].toUpperCase() + '\n\n' + (creativeData.fullResponse || t('Creative generated successfully!'))
      }));

      success(t('Creative generated successfully!'));
    } catch (err) {
      console.error(`❌ VT: Error generating Creative format ${format}:`, err);
      error(t('Error generating Creative. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // VT: Gerar formato específico do Quiz
  const handleGenerateQuizFormat = async (format) => {
    if (!output || !output.title) {
      error(t('Please generate the main offer first.'));
      return;
    }

    setLoading(true);

    try {
      console.log(`❓ VT: Gerando Quiz em formato ${format}...`);

      const formatNames = {
        'quiz': t('Quiz (Lead Magnet)')
      };

      // ✅ NOVO: Mapear formato para nome do prompt específico no Firebase
      const promptMapping = {
        'quiz': 'quiz'
      };
      
      const specificPromptType = promptMapping[format];
      
      // ✅ Contexto COMPLETO com a oferta já gerada
      const offerContext = `OFERTA COMPLETA JÁ GERADA:

${output.fullResponse}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Com base na oferta completa acima, gere APENAS o formato solicitado.`;

      // ✅ Chamar generateOffer com prompt específico do Firebase
      const quizData = await generateOffer(offerContext, selectedAgent, getLanguageForAI(), specificPromptType, true);

      // ✅ NOVO: Armazenar quiz separadamente
      setOutput(prev => ({
        ...prev,
        quizFormat: {
          ...prev.quizFormat,
          [format]: quizData.fullResponse.replace(/json\s*\{[\s\S]*?"title"[\s\S]*?\}/gi, '').trim() || t('Quiz generated successfully!')
        },
        fullResponse: prev.fullResponse + '\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n### ❓ QUIZ - ' + formatNames[format].toUpperCase() + '\n\n' + (quizData.fullResponse || t('Quiz generated successfully!'))
      }));

      success(t('Quiz generated successfully!'));
    } catch (err) {
      console.error(`❌ VT: Error generating Quiz format ${format}:`, err);
      error(t('Error generating Quiz. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Agent Selection */}
      <AgentSelector
        selectedAgent={selectedAgent}
        setSelectedAgent={setSelectedAgent}
        agentConfig={agentConfig}
        loading={loading}
      />

      {/* Offer Input */}
      <OfferInput
        input={input}
        setInput={setInput}
        handleGenerateOffer={handleGenerateOffer}
        loading={loading}
      />

      {/* Offer Output */}
      {output && (
        <div ref={outputRef} className="space-y-6">
          <OfferOutput
            output={output}
            loading={loading}
          />

          {/* Ebook Generator */}
          <EbookGenerator
            handleGenerateEbookFormat={handleGenerateEbookFormat}
            loading={loading}
            ebookFormat={output.ebookFormat}
          />

          {/* Wordpress Generator */}
          <WordpressGenerator
            handleGenerateWordpressFormat={handleGenerateWordpressFormat}
            loading={loading}
            wordpressFormat={output.wordpressFormat}
          />

          {/* Creative Generator */}
          <CreativeGenerator
            handleGenerateCreativeFormat={handleGenerateCreativeFormat}
            loading={loading}
            creativeFormat={output.creativeFormat}
          />

          {/* Quiz Generator */}
          <QuizGenerator
            handleGenerateQuizFormat={handleGenerateQuizFormat}
            loading={loading}
            quizFormat={output.quizFormat}
          />
        </div>
      )}
    </div>
  );
};

export default AIChat;
