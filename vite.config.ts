import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

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
              res.end(JSON.stringify({ success: false, error: err?.message || 'Error al enviar correo' }));
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
    plugins: [react(), tailwindcss(), devEmailPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
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
              if (secretKey) {
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

