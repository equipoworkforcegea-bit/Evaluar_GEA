export interface EmailTemplateParams {
  candidateName: string;
  processTitle: string;
  durationMinutes: number;
  inviteUrl: string;
  companyName?: string;
}

export function generateInvitationEmailHtml({
  candidateName,
  processTitle,
  durationMinutes,
  inviteUrl,
  companyName = 'GEA Perú'
}: EmailTemplateParams): string {
  const primaryNavy = '#1F2A5E';
  const mediumBlue = '#2F5BA8';
  const coralAccent = '#E4572E';
  const lightBg = '#E9EDF6';
  const cardBorder = '#DDE2EF';

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitación a Evaluación - ${companyName}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: ${lightBg};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #161C3A;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: ${lightBg};
      padding: 30px 15px;
      box-sizing: border-box;
    }
    .container {
      max-width: 580px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border-radius: 16px;
      border: 1px solid ${cardBorder};
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(31, 42, 94, 0.06);
    }
    .header-bar {
      background: linear-gradient(135deg, ${primaryNavy} 0%, ${mediumBlue} 100%);
      padding: 24px 30px;
      text-align: left;
    }
    .logo-container {
      display: inline-flex;
      align-items: center;
      gap: 10px;
    }
    .brand-title {
      font-size: 22px;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .brand-accent {
      color: #7DA4FF;
    }
    .brand-dot {
      color: ${coralAccent};
    }
    .content {
      padding: 32px 30px;
      line-height: 1.6;
    }
    h1 {
      font-size: 20px;
      font-weight: 700;
      color: ${primaryNavy};
      margin-top: 0;
      margin-bottom: 16px;
    }
    p {
      font-size: 14px;
      color: #4B5563;
      margin: 0 0 16px 0;
    }
    .info-card {
      background-color: #F8FAFC;
      border: 1px solid ${cardBorder};
      border-radius: 12px;
      padding: 16px 20px;
      margin: 20px 0;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 13px;
    }
    .info-row:last-child {
      margin-bottom: 0;
    }
    .info-label {
      color: #6B7494;
      font-weight: 500;
    }
    .info-value {
      color: ${primaryNavy};
      font-weight: 700;
    }
    .cta-container {
      text-align: center;
      margin: 30px 0 20px 0;
    }
    .cta-button {
      display: inline-block;
      background-color: ${primaryNavy};
      color: #FFFFFF !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 14px;
      letter-spacing: 0.5px;
      box-shadow: 0 4px 14px rgba(31, 42, 94, 0.25);
    }
    .security-notice {
      background-color: #EFF6FF;
      border-left: 4px solid ${mediumBlue};
      padding: 12px 16px;
      border-radius: 6px;
      font-size: 12px;
      color: #1E40AF;
      margin-top: 24px;
    }
    .footer {
      background-color: #F8FAFC;
      border-top: 1px solid ${cardBorder};
      padding: 20px 30px;
      text-align: center;
      font-size: 11px;
      color: #94A3B8;
    }
    .footer a {
      color: ${mediumBlue};
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header-bar">
        <div class="logo-container">
          <span class="brand-title">Evaluar<span class="brand-accent">GEA</span><span class="brand-dot">•</span></span>
        </div>
      </div>
      
      <div class="content">
        <h1>¡Hola, ${candidateName}!</h1>
        <p>Has sido invitado oficialmente a rendir tu evaluación psicotécnica y laboral para el proceso de selección de <strong>${companyName}</strong>.</p>
        
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">Proceso:</span>
            <span class="info-value">${processTitle}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Duración estimada:</span>
            <span class="info-value">${durationMinutes} minutos</span>
          </div>
          <div class="info-row">
            <span class="info-label">Vigencia del enlace:</span>
            <span class="info-value">7 días naturales</span>
          </div>
        </div>
        
        <div class="cta-container">
          <a href="${inviteUrl}" class="cta-button" target="_blank" rel="noopener">
            Acceder a mi evaluación &rarr;
          </a>
        </div>
        
        <div class="security-notice">
          <strong>Seguridad y Privacidad:</strong> Este enlace es personal e intransferible de un solo uso. No contiene contraseñas en texto claro. Al ingresar, se te solicitará confirmar tu identidad bajo la Ley N° 29733 de Protección de Datos Personales.
        </div>
      </div>
      
      <div class="footer">
        &copy; 2026 GEA Internacional SAC • Todos los derechos reservados.<br>
        Portal Oficial de Evaluación • Sistema de Selección por Competencias
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}
