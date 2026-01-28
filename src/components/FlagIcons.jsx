// Componentes SVG de bandeiras de alta qualidade
// Design moderno e profissional

export const BrazilFlag = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <path fill="#009B3A" d="M36 27a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V9a4 4 0 0 1 4-4h28a4 4 0 0 1 4 4v18z"/>
    <path fill="#FEDF00" d="M32.728 18L18 29.124 3.272 18 18 6.875z"/>
    <circle fill="#002776" cx="18" cy="18" r="6.5"/>
    <path fill="#FFF" d="M12 18.5a6.5 6.5 0 0 1 12 0c-1.5 0-3-.5-6-.5s-4.5.5-6 .5z"/>
    <path fill="#FFF" d="M18 13.5c-.5 0-1 .5-1 1s.5 1 1 1 1-.5 1-1-.5-1-1-1zm-3 1c-.5 0-1 .5-1 1s.5 1 1 1 1-.5 1-1-.5-1-1-1zm6 0c-.5 0-1 .5-1 1s.5 1 1 1 1-.5 1-1-.5-1-1-1zm-6 4c-.5 0-1 .5-1 1s.5 1 1 1 1-.5 1-1-.5-1-1-1zm3 2c-.5 0-1 .5-1 1s.5 1 1 1 1-.5 1-1-.5-1-1-1zm3-2c-.5 0-1 .5-1 1s.5 1 1 1 1-.5 1-1-.5-1-1-1z"/>
  </svg>
);

export const USAFlag = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <path fill="#B22234" d="M0 9a4 4 0 0 1 4-4h28a4 4 0 0 1 4 4v2H0V9zm0 4h36v4H0v-4zm0 6h36v4H0v-4zm0 6h36v2a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4v-2z"/>
    <path fill="#EEE" d="M0 11h36v2H0v-2zm0 6h36v2H0v-2zm0 6h36v2H0v-2z"/>
    <path fill="#3C3B6E" d="M0 9a4 4 0 0 1 4-4h10v14H0V9z"/>
    <path fill="#FFF" d="M3 7.5l.5.5.5-.5-.5-.5-.5.5zm3 0l.5.5.5-.5-.5-.5-.5.5zm3 0l.5.5.5-.5-.5-.5-.5.5zm3 0l.5.5.5-.5-.5-.5-.5.5zm-7.5 2l.5.5.5-.5-.5-.5-.5.5zm3 0l.5.5.5-.5-.5-.5-.5.5zm3 0l.5.5.5-.5-.5-.5-.5.5zm-6 2l.5.5.5-.5-.5-.5-.5.5zm3 0l.5.5.5-.5-.5-.5-.5.5zm3 0l.5.5.5-.5-.5-.5-.5.5zm3 0l.5.5.5-.5-.5-.5-.5.5zm-7.5 2l.5.5.5-.5-.5-.5-.5.5zm3 0l.5.5.5-.5-.5-.5-.5.5zm3 0l.5.5.5-.5-.5-.5-.5.5zm-6 2l.5.5.5-.5-.5-.5-.5.5zm3 0l.5.5.5-.5-.5-.5-.5.5zm3 0l.5.5.5-.5-.5-.5-.5.5zm3 0l.5.5.5-.5-.5-.5-.5.5z"/>
  </svg>
);

export const SpainFlag = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <path fill="#C60B1E" d="M36 27a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4v-4h36v4zM0 9a4 4 0 0 1 4-4h28a4 4 0 0 1 4 4v4H0V9z"/>
    <path fill="#FFC400" d="M0 13h36v10H0z"/>
    <g fill="#C60B1E">
      <rect x="10" y="15" width="1" height="6" rx=".5"/>
      <rect x="13" y="15" width="1" height="6" rx=".5"/>
    </g>
    <path fill="#C60B1E" d="M9 16h6v1H9v-1zm0 3h6v1H9v-1z"/>
    <ellipse fill="#FFC400" cx="12" cy="17.5" rx="2" ry="1.5"/>
  </svg>
);

export const getFlagIcon = (code) => {
  const flags = {
    'pt-BR': BrazilFlag,
    'en-US': USAFlag,
    'es-ES': SpainFlag,
  };
  return flags[code] || BrazilFlag;
};
