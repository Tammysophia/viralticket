const { Resend } = require('resend');
const functions = require('firebase-functions');

// Inicializar Resend com API key do Firebase Config
const resend = new Resend(functions.config().resend.api_key);

/**
 * Envia email de criação de senha
 * @param {string} email - Email do destinatário
 * @param {string} token - Token de ativação
 * @param {string} userName - Nome do usuário (opcional)
 * @returns {Promise<Object>} Resultado do envio
 */
async function sendPasswordCreationEmail(email, token, userName = '') {
  const creationLink = `https://viralticket.vercel.app/criar-senha?token=${token}`;
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'ViralTicket <nao-responda@viralticket.com>', // Ajuste para seu domínio
      to: [email],
      subject: 'Crie sua senha de acesso - ViralTicket',
      html: generatePasswordCreationHTML(creationLink, userName),
    });

    if (error) {
      console.error('Erro ao enviar email:', error);
      throw error;
    }

    console.log('Email enviado com sucesso:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Falha no envio de email:', error);
    throw error;
  }
}

/**
 * Gera HTML do email de criação de senha
 */
function generatePasswordCreationHTML(link, userName) {
  const greeting = userName ? `Olá, ${userName}!` : 'Olá!';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background-color: #f9f9f9;
          border-radius: 8px;
          padding: 30px;
          border: 1px solid #e0e0e0;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #4F46E5;
        }
        .content {
          background-color: white;
          padding: 25px;
          border-radius: 6px;
          margin-bottom: 20px;
        }
        .button {
          display: inline-block;
          padding: 14px 28px;
          background-color: #4F46E5;
          color: white !important;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 20px 0;
        }
        .button:hover {
          background-color: #4338CA;
        }
        .footer {
          text-align: center;
          font-size: 12px;
          color: #666;
          margin-top: 20px;
        }
        .warning {
          background-color: #FEF3C7;
          border-left: 4px solid #F59E0B;
          padding: 12px;
          margin: 15px 0;
          border-radius: 4px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🎟️ ViralTicket</div>
        </div>
        
        <div class="content">
          <h2>${greeting}</h2>
          <p>Bem-vindo ao <strong>ViralTicket</strong>! Sua conta foi criada com sucesso.</p>
          
          <p>Para começar a usar a plataforma, você precisa criar sua senha de acesso. Clique no botão abaixo:</p>
          
          <div style="text-align: center;">
            <a href="${link}" class="button">Criar Minha Senha</a>
          </div>
          
          <p>Ou copie e cole este link no seu navegador:</p>
          <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 4px; font-size: 12px;">
            ${link}
          </p>
          
          <div class="warning">
            <strong>⚠️ Importante:</strong> Este link expira em <strong>24 horas</strong>. Se você não criar sua senha neste período, precisará solicitar um novo link.
          </div>
        </div>
        
        <div class="footer">
          <p>Se você não solicitou este email, pode ignorá-lo com segurança.</p>
          <p>&copy; ${new Date().getFullYear()} ViralTicket. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Envia email de boas-vindas após ativação
 */
async function sendWelcomeEmail(email, userName) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'ViralTicket <nao-responda@viralticket.com>',
      to: [email],
      subject: 'Bem-vindo ao ViralTicket! 🎉',
      html: generateWelcomeHTML(userName),
    });

    if (error) {
      console.error('Erro ao enviar email de boas-vindas:', error);
      throw error;
    }

    console.log('Email de boas-vindas enviado:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Falha no envio de email de boas-vindas:', error);
    throw error;
  }
}

function generateWelcomeHTML(userName) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background-color: #f9f9f9;
          border-radius: 8px;
          padding: 30px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .content {
          background-color: white;
          padding: 25px;
          border-radius: 6px;
        }
        .button {
          display: inline-block;
          padding: 14px 28px;
          background-color: #4F46E5;
          color: white !important;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Bem-vindo, ${userName}!</h1>
        </div>
        <div class="content">
          <p>Sua conta no <strong>ViralTicket</strong> está ativa e pronta para uso!</p>
          
          <p>Agora você pode acessar todas as funcionalidades da plataforma.</p>
          
          <div style="text-align: center;">
            <a href="https://viralticket.vercel.app" class="button">Acessar Dashboard</a>
          </div>
          
          <p>Se tiver alguma dúvida, nossa equipe está à disposição para ajudar.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Envia email de senha alterada
 */
async function sendPasswordChangedEmail(email, userName) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'ViralTicket <nao-responda@viralticket.com>',
      to: [email],
      subject: 'Sua senha foi alterada - ViralTicket',
      html: generatePasswordChangedHTML(userName),
    });

    if (error) {
      console.error('Erro ao enviar email de senha alterada:', error);
      throw error;
    }

    console.log('Email de senha alterada enviado:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Falha no envio de email de senha alterada:', error);
    throw error;
  }
}

function generatePasswordChangedHTML(userName) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background-color: #f9f9f9;
          border-radius: 8px;
          padding: 30px;
        }
        .content {
          background-color: white;
          padding: 25px;
          border-radius: 6px;
        }
        .alert {
          background-color: #DBEAFE;
          border-left: 4px solid #3B82F6;
          padding: 12px;
          margin: 15px 0;
          border-radius: 4px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="content">
          <h2>Olá, ${userName}!</h2>
          <p>Sua senha do <strong>ViralTicket</strong> foi alterada com sucesso.</p>
          
          <div class="alert">
            <strong>🔒 Segurança:</strong> Se você não realizou esta alteração, entre em contato conosco imediatamente.
          </div>
          
          <p>Data e hora: ${new Date().toLocaleString('pt-BR')}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

module.exports = {
  sendPasswordCreationEmail,
  sendWelcomeEmail,
  sendPasswordChangedEmail,
};
