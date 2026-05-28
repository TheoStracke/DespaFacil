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
      let parsed: any;
      
      console.log('[Google Credentials] Processing credentials JSON...');
      
      // Try parse as JSON; if fails, try base64 decode
      try {
        parsed = JSON.parse(jsonEnv);
        console.log('[Google Credentials] Parsed as direct JSON');
      } catch (parseErr: any) {
        console.warn('[Google Credentials] Direct parse failed, trying base64:', parseErr.message);
        try {
          const decoded = Buffer.from(jsonEnv, 'base64').toString('utf8');
          parsed = JSON.parse(decoded);
          console.log('[Google Credentials] Parsed from base64');
        } catch (base64Err: any) {
          throw new Error(`Failed to parse credentials: ${parseErr.message}`);
        }
      }
      
      // Ensure private_key has proper line breaks (\n should become actual newlines)
      if (parsed.private_key && typeof parsed.private_key === 'string') {
        const beforeLength = parsed.private_key.length;
        // Replace literal \n with actual newlines
        parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
        const afterLength = parsed.private_key.length;
        console.log(`[Google Credentials] Private key: ${beforeLength} -> ${afterLength} chars (replaced \\n with newlines)`);
        
        // Verify PEM format
        if (!parsed.private_key.includes('-----BEGIN PRIVATE KEY-----') || !parsed.private_key.includes('-----END PRIVATE KEY-----')) {
          console.error('[Google Credentials] WARNING: Private key missing PEM headers!');
        }
      } else {
        console.error('[Google Credentials] ERROR: No private_key found in credentials!');
      }
      
      // Write to file with proper formatting
      const content = JSON.stringify(parsed, null, 2);
      fs.writeFileSync(targetPath, content, { encoding: 'utf8' });
      process.env.GOOGLE_APPLICATION_CREDENTIALS = targetPath;
      console.log('🔐 GOOGLE_APPLICATION_CREDENTIALS written to', targetPath);
      
      // Validate the file
      try {
        const verification = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
        console.log('[Google Credentials] ✓ project_id:', verification.project_id);
        console.log('[Google Credentials] ✓ client_email:', verification.client_email);
        console.log('[Google Credentials] ✓ private_key length:', verification.private_key?.length || 0);
        const keyLines = verification.private_key?.split('\n') || [];
        console.log('[Google Credentials] ✓ private_key lines:', keyLines.length);
        console.log('[Google Credentials] ✓ First line:', keyLines[0]);
        console.log('[Google Credentials] ✓ Last line:', keyLines[keyLines.length - 1]);
      } catch (verifyErr: any) {
        console.error('[Google Credentials] Verification failed:', verifyErr.message);
      }
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.log('🔐 Using existing GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
    } else {
      console.warn('⚠️  No Google credentials configured (GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_APPLICATION_CREDENTIALS_JSON)');
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
