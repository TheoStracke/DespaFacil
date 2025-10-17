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
import certificadoRoutes from './routes/certificados';
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
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
}));
app.use(morgan('dev'));

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

// Error handler (deve ser o último middleware)
app.use(errorHandler);

export default app;
