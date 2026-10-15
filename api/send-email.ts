import { generateInvitationEmailHtml } from '../src/utils/emailTemplate';

export default async function handler(req: any, res: any) {
  // Configuración de encabezados CORS para llamadas desde el navegador
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Método no permitido. Utilice POST.'
    });
  }

  try {
    // Soporte para body como objeto o string parseable
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    // Obtención de la variable de entorno RESEND_API_KEY en Vercel
    const resendApiKey = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;

    if (!resendApiKey) {
      return res.status(500).json({
        success: false,
        error: 'Variable de entorno RESEND_API_KEY no configurada en Vercel.',
        instructions: 'Agregue RESEND_API_KEY en Vercel -> Settings -> Environment Variables con su clave de https://resend.com'
      });
    }

    // Parámetros de la invitación
    const to = (body.to || body.correo || '').trim().toLowerCase();
    const candidateName = (body.candidateName || body.nombre || body.nombreCompleto || 'Postulante').trim();
    const processTitle = (body.processTitle || body.proceso || body.titulo_proceso || 'Proceso de Selección GEA').trim();
    const durationMinutes = Number(body.durationMinutes || body.duracion || body.duracion_minutos || 45);
    const inviteUrl = (body.inviteUrl || body.invite_url || '').trim();
    const subject = (body.subject || `Invitación a Evaluación Oficial - ${processTitle}`).trim();

    if (!to || !to.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'Correo electrónico de destino inválido o no especificado.'
      });
    }

    if (!inviteUrl) {
      return res.status(400).json({
        success: false,
        error: 'El enlace de invitación (inviteUrl) es obligatorio.'
      });
    }

    // Remitente: usa el configurado en Vercel o el predeterminado para pruebas
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'GEA Selección <onboarding@resend.dev>';

    // Generar cuerpo HTML con el diseño corporativo de Evaluar GEA
    const htmlContent = body.html || generateInvitationEmailHtml({
      candidateName,
      processTitle,
      durationMinutes,
      inviteUrl,
      companyName: 'GEA Perú'
    });

    // Despacho a través de la API oficial de Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject,
        html: htmlContent
      })
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.warn('[Vercel API Resend Error]:', resendData);
      return res.status(resendResponse.status).json({
        success: false,
        error: resendData.message || 'Error reportado por Resend API al enviar el correo.',
        details: resendData
      });
    }

    return res.status(200).json({
      success: true,
      id: resendData.id,
      message: 'Correo de evaluación enviado con éxito a través de Vercel.',
      to
    });
  } catch (error: any) {
    console.error('[Vercel API Exception]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor al procesar el envío de correo.'
    });
  }
}
