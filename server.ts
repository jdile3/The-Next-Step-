import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '10mb' }));

  // System status - 100% Local / Zero Cloud API Charges
  app.get('/api/status', (_req, res) => {
    res.json({
      status: 'online',
      appName: 'THE NEXT STEP: BUDGETING',
      mode: '100% Local / Zero Cloud API Billing',
      cloudApiUsed: false,
    });
  });

  // Serve public assets (icons, manifest.json, sw.js) with accurate MIME types
  app.use(express.static(path.resolve(__dirname, 'public'), {
    maxAge: '1h',
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('sw.js')) {
        res.setHeader('Service-Worker-Allowed', '/');
        res.setHeader('Content-Type', 'application/javascript');
      }
    }
  }));

  // Mount Vite dev server or static production files
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`THE NEXT STEP app server running on http://0.0.0.0:${PORT} (Zero Cloud API Mode)`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
