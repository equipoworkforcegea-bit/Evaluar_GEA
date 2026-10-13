export interface SendEmailInvitationParams {
  to: string;
  candidateName?: string;
  dni?: string;
  processTitle?: string;
  accessCode?: string;
  password?: string;
  durationMinutes?: number;
  customLoginUrl?: string;
}

export function generateInvitationHtml(params: {
  cleanName: string;
  cleanPosition: string;
  dniClean: string;
  codeClean: string;
  passClean?: string;
  durationMinutes: number;
  loginUrl: string;
}): string {
  const { cleanName, cleanPosition, dniClean, codeClean, passClean, durationMinutes, loginUrl } = params;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Convocatoria de Evaluación Laboral - GEA Internacional</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2d3748;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f4f4f7; padding: 25px 0;">
    <tr>
      <td align="center">
        <!-- Contenedor Principal -->
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          
          <!-- Banner Superior Corporativo -->
          <tr>
            <td style="background: linear-gradient(135deg, #180A3A 0%, #351268 50%, #6355DE 100%); padding: 35px 30px; text-align: center;">
              <table width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom: 12px;">
                    <div style="background-color: #ffffff; padding: 8px 18px; border-radius: 12px; display: inline-block; box-shadow: 0 4px 10px rgba(0,0,0,0.15);">
                      <img src="https://evaluar-gea.vercel.app/gea-internacional.png" alt="GEA Internacional" height="32" style="height: 32px; display: block; border: 0;" />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <span style="color: #c4b5fd; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">
                      evaluar gea • Selección & Talento
                    </span>
                    <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 8px 0 0 0; line-height: 1.2;">
                      Convocatoria de Evaluación
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Contenido del Mensaje -->
          <tr>
            <td style="padding: 35px 30px;">
              <p style="font-size: 16px; line-height: 1.6; color: #1a202c; margin-top: 0;">
                Estimado/a <strong>${cleanName}</strong>,
              </p>
              
              <p style="font-size: 14px; line-height: 1.6; color: #4a5568;">
                Te saludamos cordialmente del área de <strong>Selección y Gestión del Talento Humano de GEA Perú</strong>.
              </p>

              <p style="font-size: 14px; line-height: 1.6; color: #4a5568;">
                Nos complace informarte que has sido seleccionado/a para participar en la etapa de evaluación de competencias para la vacante:
              </p>

              <!-- Tarjeta del Puesto -->
              <div style="background-color: #f7fafc; border-left: 4px solid #6355DE; padding: 14px 18px; border-radius: 0 12px 12px 0; margin: 20px 0;">
                <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #718096; font-weight: 700; display: block;">
                  Puesto Convocado
                </span>
                <span style="font-size: 16px; font-weight: 800; color: #2d3748; display: block; margin-top: 3px;">
                  ${cleanPosition}
                </span>
              </div>

              <!-- Recuadro de Credenciales de Acceso -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f3f0ff; border-radius: 14px; padding: 18px 20px; margin: 25px 0;">
                <tr>
                  <td>
                    <span style="font-size: 12px; font-weight: 800; color: #553c9a; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px;">
                      🔑 Tus Credenciales de Acceso
                    </span>
                    <p style="font-size: 13px; color: #44337a; margin: 4px 0;">
                      <strong>Usuario:</strong> Tu documento de identidad (${dniClean || 'Tu DNI'})
                    </p>
                    ${passClean ? `
                    <p style="font-size: 13px; color: #44337a; margin: 4px 0;">
                      <strong>Contraseña asignada:</strong> <span style="font-family: monospace; background: #ffffff; padding: 3px 8px; border-radius: 6px; font-weight: bold; color: #180A3A; border: 1px solid #d6bcfa;">${passClean}</span>
                    </p>
                    ` : ''}
                    <p style="font-size: 13px; color: #44337a; margin: 4px 0;">
                      <strong>Código de Evaluación:</strong> <span style="font-family: monospace; background: #ffffff; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${codeClean}</span>
                    </p>
                    <p style="font-size: 13px; color: #44337a; margin: 4px 0;">
                      <strong>Duración aproximada:</strong> ${durationMinutes} minutos
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Botón Principal de Llamado a la Acción (CTA) -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" target="_blank" style="background-color: #6355DE; color: #ffffff; font-size: 15px; font-weight: 800; text-decoration: none; padding: 15px 35px; border-radius: 12px; display: inline-block; box-shadow: 0 4px 14px rgba(99, 85, 222, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">
                      Comenzar mi Evaluación
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Recomendaciones -->
              <div style="border-top: 1px solid #edf2f7; padding-top: 20px; margin-top: 20px;">
                <span style="font-size: 12px; font-weight: 700; color: #2d3748; display: block; margin-bottom: 8px;">
                  📋 Recomendaciones importantes para rendir tu prueba:
                </span>
                <ul style="font-size: 12px; color: #718096; line-height: 1.6; margin: 0; padding-left: 20px;">
                  <li>Ubícate en un espacio cómodo, iluminado y sin distracciones.</li>
                  <li>Asegúrate de contar con una conexión a internet estable.</li>
                  <li>Puedes realizar la evaluación desde tu computadora o teléfono móvil.</li>
                  <li>Una vez iniciada la prueba, procura completarla de manera continua.</li>
                </ul>
              </div>

              <!-- Enlace alternativo de respaldo -->
              <p style="font-size: 11px; color: #a0aec0; margin-top: 25px; line-height: 1.5;">
                Si el botón no abre automáticamente, puedes copiar y pegar el siguiente enlace en tu navegador:<br/>
                <a href="${loginUrl}" style="color: #6355DE; word-break: break-all;">${loginUrl}</a>
              </p>

            </td>
          </tr>

          <!-- Footer del Correo -->
          <tr>
            <td style="background-color: #f7fafc; padding: 25px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="font-size: 12px; font-weight: 700; color: #4a5568; margin: 0 0 4px 0;">
                GEA Internacional • División de Selección de Personal
              </p>
              <p style="font-size: 11px; color: #a0aec0; margin: 0;">
                Este es un mensaje automático de invitación a evaluación. Por favor no responder directamente a este correo.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export async function sendEmailInvitation(params: SendEmailInvitationParams) {
  const { 
    to, 
    candidateName, 
    dni, 
    processTitle, 
    accessCode, 
    password,
    durationMinutes = 45, 
    customLoginUrl 
  } = params;

  if (!to || typeof to !== 'string') {
    throw new Error('El correo electrónico destinatario (to) es obligatorio.');
  }

  const emailUser = process.env.GMAIL_USER || 'equipoworkforcegea@gmail.com';
  const emailPass = (process.env.GMAIL_APP_PASSWORD || process.env.VITE_GMAIL_APP_PASSWORD || 'gmvsbeaxeujrscyw').replace(/\s+/g, '');
  const appBaseUrl = process.env.APP_URL || process.env.VITE_APP_URL || 'https://evaluar-gea.vercel.app';

  if (!emailPass) {
    throw new Error('Falta contraseña de aplicación GMAIL_APP_PASSWORD.');
  }

  let nodemailer: any;
  try {
    const mod = await import('nodemailer');
    nodemailer = mod.default || mod;
  } catch {
    throw new Error('nodemailer no está instalado localmente. Por favor corre en tu terminal: npm install nodemailer');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });

  const codeClean = accessCode || `GEA-${dni || Math.floor(100000 + Math.random() * 900000)}`;
  const dniClean = (dni || '').trim();
  const cleanTo = to.trim().toLowerCase();
  const cleanName = candidateName || 'Postulante';
  const cleanPosition = processTitle || 'Convocatoria Laboral';
  const passClean = (password || '').trim();

  const loginUrl = customLoginUrl || `${appBaseUrl}/login?code=${encodeURIComponent(codeClean)}&dni=${encodeURIComponent(dniClean)}&email=${encodeURIComponent(cleanTo)}`;

  const html = generateInvitationHtml({
    cleanName,
    cleanPosition,
    dniClean,
    codeClean,
    passClean,
    durationMinutes,
    loginUrl
  });

  const mailOptions = {
    from: `"Selección y Talento Humano - GEA Internacional" <${emailUser}>`,
    to: cleanTo,
    subject: `Convocatoria de Evaluación Laboral: ${cleanPosition} - GEA Perú`,
    html
  };

  const info = await transporter.sendMail(mailOptions);

  return {
    success: true,
    messageId: info.messageId,
    recipient: cleanTo,
    loginUrl
  };
}
