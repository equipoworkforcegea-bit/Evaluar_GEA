import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { generateInvitationEmailHtml } from './src/utils/emailTemplate.ts';

function devEmailPlugin() {
  return {
    name: 'dev-email-invitation-plugin',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url?.startsWith('/api/send-invitation') && req.method === 'POST') {
          let bodyStr = '';
          req.on('data', (chunk: any) => { bodyStr += chunk; });
          req.on('end', async () => {
            try {
              const body = JSON.parse(bodyStr || '{}');
              const { sendEmailInvitation } = await import('./api/emailHelper');
              const result = await sendEmailInvitation(body);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(result));
            } catch (err: any) {
              console.error('[Vite Dev Email] Error al enviar correo:', err);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ 
                success: false, 
                error: err?.message || 'Error al enviar correo en local' 
              }));
            }
          });
          return;
        }
        next();
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const secretKey = env.SUPABASE_SECRET_KEY || env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';
  const targetUrl = env.VITE_SUPABASE_URL || 'https://tipiorfjpdpiozwfhxfd.supabase.co';

  return {
    plugins: [
      react(),
      tailwindcss(),
      devEmailPlugin(),
      {
        name: 'local-email-api-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (
              req.url &&
              (req.url.startsWith('/api/send-email') || req.url.startsWith('/api/invitar-postulante')) &&
              req.method === 'POST'
            ) {
              let bodyStr = '';
              req.on('data', (chunk) => {
                bodyStr += chunk;
              });
              req.on('end', async () => {
                res.setHeader('Content-Type', 'application/json');
                try {
                  const payload = bodyStr ? JSON.parse(bodyStr) : {};
                  const resendApiKey = env.RESEND_API_KEY || process.env.RESEND_API_KEY;

                  if (!resendApiKey) {
                    res.statusCode = 400;
                    res.end(
                      JSON.stringify({
                        success: false,
                        error: 'Variable RESEND_API_KEY no configurada en .env.local para pruebas locales.'
                      })
                    );
                    return;
                  }

                  const to = (payload.to || payload.correo || '').trim().toLowerCase();
                  const candidateName = (payload.candidateName || payload.nombre || 'Postulante').trim();
                  const processTitle = (payload.processTitle || payload.proceso || 'Proceso de Selección GEA').trim();
                  const durationMinutes = Number(payload.durationMinutes || payload.duracion || 45);
                  const inviteUrl = (payload.inviteUrl || payload.invite_url || '').trim();
                  const subject = payload.subject || `Invitación a Evaluación Oficial - ${processTitle}`;
                  const fromEmail = env.RESEND_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || 'GEA Selección <onboarding@resend.dev>';

                  const html = payload.html || generateInvitationEmailHtml({
                    candidateName,
                    processTitle,
                    durationMinutes,
                    inviteUrl,
                    companyName: 'GEA Perú'
                  });

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
                      html
                    })
                  });

                  const resData = await resendResponse.json();
                  res.statusCode = resendResponse.ok ? 200 : resendResponse.status;
                  res.end(JSON.stringify(resData));
                } catch (err: any) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ success: false, error: err.message }));
                }
              });
              return;
            }
            next();
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname || process.cwd(), '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/supabase-api': {
          target: targetUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (p) => p.replace(/^\/supabase-api/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.removeHeader('origin');
              proxyReq.removeHeader('referer');
              proxyReq.removeHeader('sec-ch-ua');
              proxyReq.removeHeader('sec-ch-ua-mobile');
              proxyReq.removeHeader('sec-ch-ua-platform');
              proxyReq.removeHeader('sec-fetch-dest');
              proxyReq.removeHeader('sec-fetch-mode');
              proxyReq.removeHeader('sec-fetch-site');
              proxyReq.setHeader('User-Agent', 'EvaluarGEA-Backend/1.0');
              if (secretKey && !secretKey.startsWith('tu_') && secretKey.length > 20) {
                proxyReq.setHeader('apikey', secretKey);
                proxyReq.setHeader('Authorization', `Bearer ${secretKey}`);
              }
            });
          },
        },
      },
    },
  };
});
