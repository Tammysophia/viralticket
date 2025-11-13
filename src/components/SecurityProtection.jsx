// VT: Proteção Anti-Hack - Desabilita DevTools, F12, clique direito e inspeção
import { useEffect } from 'react';

const SecurityProtection = () => {
  useEffect(() => {
    // Desabilitar clique direito
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // Desabilitar teclas de atalho para DevTools
    const handleKeyDown = (e) => {
      // F12
      if (e.keyCode === 123) {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+Shift+I (DevTools)
      if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+U (View Source)
      if (e.ctrlKey && e.keyCode === 85) {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+Shift+C (Inspect Element)
      if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+S (Save Page)
      if (e.ctrlKey && e.keyCode === 83) {
        e.preventDefault();
        return false;
      }
    };

    // Detectar abertura do DevTools
    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        // DevTools detectado - redirecionar ou alertar
        document.body.innerHTML = `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 20px;
          ">
            <div>
              <h1 style="font-size: 48px; margin-bottom: 20px;">⚠️ Acesso Negado</h1>
              <p style="font-size: 20px; margin-bottom: 30px;">
                Por questões de segurança, o acesso às ferramentas de desenvolvedor está bloqueado.
              </p>
              <button 
                onclick="window.location.reload()" 
                style="
                  padding: 15px 30px;
                  font-size: 18px;
                  background: white;
                  color: #667eea;
                  border: none;
                  border-radius: 8px;
                  cursor: pointer;
                  font-weight: bold;
                "
              >
                Recarregar Página
              </button>
            </div>
          </div>
        `;
      }
    };

    // Desabilitar seleção de texto (opcional - pode ser removido se atrapalhar UX)
    const disableTextSelection = () => {
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
      document.body.style.mozUserSelect = 'none';
      document.body.style.msUserSelect = 'none';
    };

    // Adicionar event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    
    // Verificar DevTools a cada 1 segundo
    const devToolsInterval = setInterval(detectDevTools, 1000);
    
    // Aplicar proteções
    disableTextSelection();

    // Console warning
    console.clear();
    console.log('%c🚨 ATENÇÃO!', 'color: red; font-size: 40px; font-weight: bold;');
    console.log('%cEsta é uma área restrita.', 'color: orange; font-size: 20px;');
    console.log('%cQualquer tentativa de acesso não autorizado será registrada.', 'color: yellow; font-size: 16px;');

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      clearInterval(devToolsInterval);
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      document.body.style.mozUserSelect = '';
      document.body.style.msUserSelect = '';
    };
  }, []);

  return null; // Componente invisível
};

export default SecurityProtection;
