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
      
      console.log('[Google Credentials] Processing credentials JSON...');
      
      // Try parse as JSON; if fails, try base64 decode; else write raw
      try {
        const parsed = JSON.parse(jsonEnv);
        // Ensure private_key has proper line breaks (\n should become actual newlines)
        if (parsed.private_key && typeof parsed.private_key === 'string') {
          // Replace literal \n with actual newlines
          parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
          console.log('[Google Credentials] Private key format normalized');
        }
        content = JSON.stringify(parsed, null, 2); // Pretty print for readability
      } catch (parseErr: any) {
        console.warn('[Google Credentials] JSON parse failed, trying base64:', parseErr.message);
        try {
          const decoded = Buffer.from(jsonEnv, 'base64').toString('utf8');
          const parsed = JSON.parse(decoded);
          if (parsed.private_key && typeof parsed.private_key === 'string') {
            parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
          }
          content = JSON.stringify(parsed, null, 2);
        } catch (base64Err: any) {
          console.warn('[Google Credentials] Base64 decode failed, using raw:', base64Err.message);
          // keep original content
        }
      }
      
      fs.writeFileSync(targetPath, content, { encoding: 'utf8' });
      process.env.GOOGLE_APPLICATION_CREDENTIALS = targetPath;
      console.log('🔐 GOOGLE_APPLICATION_CREDENTIALS configured from JSON env at', targetPath);
      
      // Validate the file was written correctly
      try {
        const verification = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
        console.log('[Google Credentials] Verification: project_id =', verification.project_id);
        console.log('[Google Credentials] Verification: client_email =', verification.client_email);
        const keyPreview = verification.private_key ? verification.private_key.substring(0, 50) : 'MISSING';
        console.log('[Google Credentials] Verification: private_key preview =', keyPreview + '...');
      } catch (verifyErr: any) {
        console.error('[Google Credentials] Verification failed:', verifyErr.message);
      }
    }
  } catch (e: any) {
    console.error('❌ Failed to configure GOOGLE_APPLICATION_CREDENTIALS:', e?.message || e);
    console.error('Stack:', e?.stack);
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
