import { useState } from 'react';
import { Copy, Download, ChevronDown, ChevronUp } from 'lucide-react';
import Button from './Button';
import Card from './Card';
import { useToast } from './Toast';

const OfferViewer = ({ offerData, onCopy }) => {
  const [expandedSections, setExpandedSections] = useState({});
  const { success } = useToast();

  // Detectar tipo de oferta (simples ou completa)
  const isCompleteOffer = offerData.diagnostico || offerData.micro_ofertas || offerData.ofertas_assassinas;

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    success(`${label} copiado!`);
  };

  const downloadAsJSON = () => {
    const dataStr = JSON.stringify(offerData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `oferta-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    success('JSON baixado!');
  };

  // Renderizar oferta simples (formato antigo)
  if (!isCompleteOffer) {
    return (
      <Card gradient>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Oferta Gerada</h3>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={downloadAsJSON} icon={Download}>
              JSON
            </Button>
            <Button variant="secondary" onClick={onCopy} icon={Copy}>
              Copiar
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
              {offerData.title}
            </h2>
            <p className="text-lg text-gray-300 mt-2">{offerData.subtitle}</p>
          </div>

          <div className="space-y-2">
            {offerData.bullets?.map((bullet, index) => (
              <p key={index} className="text-gray-300">{bullet}</p>
            ))}
          </div>

          <div className="glass border border-purple-500/30 rounded-lg p-4 text-center">
            <p className="text-xl font-bold gradient-primary bg-clip-text text-transparent">
              {offerData.cta}
            </p>
          </div>

          <p className="text-center text-yellow-400">{offerData.bonus}</p>
        </div>
      </Card>
    );
  }

  // Renderizar oferta completa (novo formato)
  return (
    <div className="space-y-4">
      {/* Header com ações */}
      <Card>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">🔥 Oferta Completa Gerada</h3>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={downloadAsJSON} icon={Download}>
              Baixar JSON
            </Button>
            <Button variant="secondary" onClick={() => copyToClipboard(JSON.stringify(offerData, null, 2), 'Oferta completa')} icon={Copy}>
              Copiar Tudo
            </Button>
          </div>
        </div>
      </Card>

      {/* Diagnóstico */}
      {offerData.diagnostico && (
        <Card>
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('diagnostico')}
          >
            <h3 className="text-lg font-bold">📊 Diagnóstico do Público</h3>
            {expandedSections.diagnostico ? <ChevronUp /> : <ChevronDown />}
          </div>
          
          {expandedSections.diagnostico && (
            <div className="mt-4 space-y-4">
              {offerData.diagnostico.dores_principais && (
                <div>
                  <h4 className="font-semibold text-red-400 mb-2">Dores Principais:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {offerData.diagnostico.dores_principais.map((dor, i) => (
                      <li key={i} className="text-gray-300">{dor}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {offerData.diagnostico.desejos_ocultos && (
                <div>
                  <h4 className="font-semibold text-green-400 mb-2">Desejos Ocultos:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {offerData.diagnostico.desejos_ocultos.map((desejo, i) => (
                      <li key={i} className="text-gray-300">{desejo}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {offerData.diagnostico.avatar && (
                <div className="glass border border-purple-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-400 mb-2">Avatar:</h4>
                  <p className="text-gray-300"><strong>Nome:</strong> {offerData.diagnostico.avatar.nome}</p>
                  <p className="text-gray-300"><strong>Idade:</strong> {offerData.diagnostico.avatar.idade}</p>
                  <p className="text-gray-300"><strong>Dor Primária:</strong> {offerData.diagnostico.avatar.dor_primaria}</p>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Micro Ofertas */}
      {offerData.micro_ofertas && offerData.micro_ofertas.length > 0 && (
        <Card>
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('micro_ofertas')}
          >
            <h3 className="text-lg font-bold">💡 {offerData.micro_ofertas.length} Micro-Ofertas</h3>
            {expandedSections.micro_ofertas ? <ChevronUp /> : <ChevronDown />}
          </div>
          
          {expandedSections.micro_ofertas && (
            <div className="mt-4 space-y-3">
              {offerData.micro_ofertas.map((oferta, i) => (
                <div key={i} className="glass border border-white/10 rounded-lg p-4">
                  <h4 className="font-bold text-lg">{oferta.titulo}</h4>
                  <p className="text-gray-400 text-sm">{oferta.subtitulo}</p>
                  <p className="text-green-400 font-semibold mt-2">{oferta.preco_sugerido}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Ofertas Assassinas */}
      {offerData.ofertas_assassinas && offerData.ofertas_assassinas.length > 0 && (
        <Card gradient>
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('ofertas_assassinas')}
          >
            <h3 className="text-lg font-bold">🎯 {offerData.ofertas_assassinas.length} Ofertas Assassinas</h3>
            {expandedSections.ofertas_assassinas ? <ChevronUp /> : <ChevronDown />}
          </div>
          
          {expandedSections.ofertas_assassinas && (
            <div className="mt-4 space-y-4">
              {offerData.ofertas_assassinas.map((oferta, i) => (
                <div key={i} className="glass border border-purple-500/30 rounded-lg p-4">
                  <h4 className="font-bold text-xl gradient-primary bg-clip-text text-transparent">
                    {oferta.titulo}
                  </h4>
                  <p className="text-gray-300 mt-2">{oferta.subtitulo}</p>
                  
                  {oferta.bullets && (
                    <div className="mt-3 space-y-1">
                      {oferta.bullets.map((bullet, j) => (
                        <p key={j} className="text-gray-300">{bullet}</p>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-green-400 font-bold">{oferta.preco}</span>
                    <Button 
                      size="sm" 
                      onClick={() => copyToClipboard(JSON.stringify(oferta, null, 2), 'Oferta')}
                    >
                      Copiar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Oferta Campeã */}
      {offerData.oferta_campeã && (
        <Card gradient>
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('oferta_campea')}
          >
            <h3 className="text-lg font-bold">🏆 Oferta Campeã</h3>
            {expandedSections.oferta_campea ? <ChevronUp /> : <ChevronDown />}
          </div>
          
          {expandedSections.oferta_campea && (
            <div className="mt-4 space-y-4">
              <div>
                <h2 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
                  {offerData.oferta_campeã.titulo}
                </h2>
                <p className="text-xl text-gray-300 mt-2">{offerData.oferta_campeã.subtitulo}</p>
              </div>

              {offerData.oferta_campeã.bullets_beneficios && (
                <div className="space-y-2">
                  {offerData.oferta_campeã.bullets_beneficios.map((bullet, i) => (
                    <p key={i} className="text-gray-300">{bullet}</p>
                  ))}
                </div>
              )}

              <div className="glass border border-purple-500/30 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
                  {offerData.oferta_campeã.cta_principal}
                </p>
              </div>

              {offerData.oferta_campeã.bonus && (
                <div>
                  <h4 className="font-semibold text-yellow-400 mb-2">Bônus:</h4>
                  {Array.isArray(offerData.oferta_campeã.bonus) ? (
                    offerData.oferta_campeã.bonus.map((bonus, i) => (
                      <p key={i} className="text-yellow-400">{bonus}</p>
                    ))
                  ) : (
                    <p className="text-yellow-400">{offerData.oferta_campeã.bonus}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Ebook */}
      {offerData.ebook && (
        <Card>
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('ebook')}
          >
            <h3 className="text-lg font-bold">📚 Ebook ({offerData.ebook.numero_paginas} páginas)</h3>
            {expandedSections.ebook ? <ChevronUp /> : <ChevronDown />}
          </div>
          
          {expandedSections.ebook && (
            <div className="mt-4">
              <h4 className="font-bold text-xl">{offerData.ebook.titulo}</h4>
              <p className="text-gray-400">{offerData.ebook.subtitulo}</p>
              
              {offerData.ebook.sumario && (
                <div className="mt-4 space-y-2">
                  <h5 className="font-semibold">Sumário:</h5>
                  {offerData.ebook.sumario.map((cap, i) => (
                    <div key={i} className="glass border border-white/10 rounded p-3">
                      <p className="font-semibold">Capítulo {cap.capitulo}: {cap.titulo}</p>
                      {cap.topicos && (
                        <ul className="text-sm text-gray-400 mt-1 ml-4">
                          {cap.topicos.map((topico, j) => (
                            <li key={j}>• {topico}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Copy Redes Sociais */}
      {offerData.copy_redes_sociais && (
        <Card>
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('copy_social')}
          >
            <h3 className="text-lg font-bold">📱 Copy para Redes Sociais</h3>
            {expandedSections.copy_social ? <ChevronUp /> : <ChevronDown />}
          </div>
          
          {expandedSections.copy_social && (
            <div className="mt-4 space-y-4">
              {offerData.copy_redes_sociais.reels && (
                <div>
                  <h4 className="font-semibold mb-2">Reels:</h4>
                  {offerData.copy_redes_sociais.reels.map((reel, i) => (
                    <div key={i} className="glass border border-white/10 rounded-lg p-3 mb-2">
                      <p className="font-semibold text-sm">Reel {reel.numero}</p>
                      <p className="text-gray-300 text-sm mt-1">{reel.gancho}</p>
                      <Button 
                        size="sm" 
                        className="mt-2"
                        onClick={() => copyToClipboard(reel.corpo, `Reel ${reel.numero}`)}
                      >
                        Copiar Reel
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Botão para ver JSON completo */}
      <Card>
        <Button 
          variant="secondary" 
          className="w-full"
          onClick={() => {
            console.log('Oferta completa:', offerData);
            success('JSON exibido no console (F12)');
          }}
        >
          Ver JSON Completo no Console
        </Button>
      </Card>
    </div>
  );
};

export default OfferViewer;
