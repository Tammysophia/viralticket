// VT: Proteções de segurança contra inspeção de código
import { useEffect } from 'react';

const SecurityProtection = () => {
  useEffect(() => {
    // VT: Desabilitar clique direito
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // VT: Desabilitar teclas de atalho para DevTools
    const handleKeyDown = (e) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+Shift+I (DevTools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+Shift+C (Inspect Element)
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        return false;
      }
    };

    // VT: Detectar se DevTools está aberto
    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        // DevTools detectado - apenas log, não bloquear
        console.clear();
        console.log('%c⚠️ ATENÇÃO', 'color: red; font-size: 30px; font-weight: bold;');
        console.log('%c🔒 Este é um sistema protegido', 'color: orange; font-size: 16px;');
        console.log('%c⚡ ViralTicket - Todos os direitos reservados', 'color: purple; font-size: 14px;');
      }
    };

    // VT: Adicionar proteções de console
    const protectConsole = () => {
      // Sobrescrever console.log com mensagem personalizada
      const originalLog = console.log;
      console.log = function(...args) {
        originalLog.apply(console, ['🔒 ViralTicket Security', ...args]);
      };
    };

    // Adicionar event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    
    // Verificar DevTools periodicamente
    const devToolsCheck = setInterval(detectDevTools, 1000);
    
    // Proteger console
    protectConsole();

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      clearInterval(devToolsCheck);
    };
  }, []);

  // VT: Componente não renderiza nada na UI
  return null;
};

export default SecurityProtection;
