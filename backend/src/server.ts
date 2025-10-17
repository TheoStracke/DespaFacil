import app from './app';
import http from 'http';

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
