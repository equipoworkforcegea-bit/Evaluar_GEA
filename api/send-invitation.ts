import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendEmailInvitation } from './emailHelper.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método no permitido. Utilice POST.' });
  }

  try {
    const result = await sendEmailInvitation(req.body || {});
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('[API send-invitation] Error enviando correo:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Error interno al procesar el envío del correo electrónico.'
    });
  }
}
