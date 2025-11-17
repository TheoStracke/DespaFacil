import app from './app';
import http from 'http';
import fs from 'fs';
import path from 'path';

// Configure Google credentials for reCAPTCHA Enterprise in container environments
// If GOOGLE_APPLICATION_CREDENTIALS_JSON is provided (Railway, etc), write it to a temp file
// and point GOOGLE_APPLICATION_CREDENTIALS to that path. Local dev uses ./recaptcha-key.json from .env
(() => {
  try {
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      const targetPath = process.env.GOOGLE_APPLICATION_CREDENTIALS_PATH || path.join('/tmp', 'recaptcha-key.json');
      const jsonEnv = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON as string;
      let content = jsonEnv;
      // Try parse as JSON; if fails, try base64 decode; else write raw
      try {
        const parsed = JSON.parse(jsonEnv);
        content = JSON.stringify(parsed);
      } catch {
        try {
          const decoded = Buffer.from(jsonEnv, 'base64').toString('utf8');
          // Validate decoded is JSON
          JSON.parse(decoded);
          content = decoded;
        } catch {
          // keep original content
        }
      }
      fs.writeFileSync(targetPath, content, { encoding: 'utf8' });
      process.env.GOOGLE_APPLICATION_CREDENTIALS = targetPath;
      console.log('🔐 GOOGLE_APPLICATION_CREDENTIALS configured from JSON env at', targetPath);
    }
  } catch (e: any) {
    console.error('Failed to configure GOOGLE_APPLICATION_CREDENTIALS:', e?.message || e);
  }
})();

const PORT = Number(process.env.PORT) || 4000;
// Permite configurar o host para produção (ex.: 0.0.0.0 no Railway) e localhost no dev
const HOST = process.env.BIND_HOST || 'localhost';

const server = http.createServer(app);

// Timeouts para mitigar slowloris e conexões presas
server.headersTimeout = 65_000; // 65s
server.keepAliveTimeout = 60_000; // 60s
server.requestTimeout = 30_000; // 30s

server.listen(PORT, HOST, () => {
  console.log(`✅ Server running on http://${HOST}:${PORT}`);
  console.log(`📄 API Documentation: http://${HOST}:${PORT}/api`);
});
