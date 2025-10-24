// Validação de email
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Validação de senha
export const validatePassword = (password) => {
  return password.length >= 6;
};

// Validação de URL do YouTube
export const validateYouTubeUrl = (url) => {
  const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  return regex.test(url);
};

// Validação de chave YouTube API
export const validateYouTubeAPIKey = (key) => {
  return key.startsWith('AIza') && key.length >= 39;
};

// Validação de chave OpenAI
export const validateOpenAIKey = (key) => {
  return key.startsWith('sk-') && key.length >= 20;
};

// Mascarar chave de API
export const maskAPIKey = (key) => {
  if (!key) return '';
  if (key.length <= 8) return '••••••••';
  return key.substring(0, 8) + '•'.repeat(Math.min(key.length - 8, 20));
};

// Formatar data
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Calcular porcentagem de uso
export const calculateUsagePercentage = (used, limit) => {
  if (limit === 0 || limit === 'unlimited') return 0;
  return Math.min((used / limit) * 100, 100);
};
