import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import motoristaRoutes from './routes/motoristas';
import documentoRoutes from './routes/documentos';
import adminRoutes from './routes/admin';
import parceiroRoutes from './routes/parceiros';
import certificadoRoutes from './routes/certificados';
import userRoutes from './routes/users';
import { errorHandler } from './middlewares/errorHandler';

dotenv.config();

const app = express();

// Confie no proxy se estiver atrás de Cloudflare/NGINX
if (process.env.TRUST_PROXY === '1') {
  app.set('trust proxy', 1);
}

// Middlewares globais
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
// CORS restrito em produção (FRONTEND_URL pode ser lista separada por vírgula)
const allowedOrigins = (process.env.FRONTEND_URL || '').split(',').map((s) => s.trim()).filter(Boolean);
const isProd = process.env.NODE_ENV === 'production';
app.use(
  cors({
    origin: function (origin, callback) {
      if (!isProd) return callback(null, true); // liberar em dev
      if (!origin) return callback(null, true); // permitir ferramentas sem Origin
      if (allowedOrigins.length === 0) return callback(null, true); // fallback se não configurado
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);

// Logging: detalhado em dev, combined em prod
app.use(morgan(isProd ? 'combined' : 'dev'));

// Health check
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    service: 'DespaFacil API',
    version: '1.0.0',
  });
});

// Rotas
// Rate limit global básico na API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// Rate limit mais rígido no login para evitar brute-force
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Muitas tentativas de login. Tente novamente mais tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/login', loginLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/motoristas', motoristaRoutes);
app.use('/api/documentos', documentoRoutes);
app.use('/api/certificados', certificadoRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/parceiros', parceiroRoutes);

// Error handler (deve ser o último middleware)
app.use(errorHandler);

export default app;
