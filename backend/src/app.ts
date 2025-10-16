import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import motoristaRoutes from './routes/motoristas';
import documentoRoutes from './routes/documentos';
import adminRoutes from './routes/admin';
import { errorHandler } from './middlewares/errorHandler';

dotenv.config();

const app = express();

// Middlewares globais
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(morgan('dev'));

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    service: 'DespaFacil API',
    version: '1.0.0',
  });
});

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/motoristas', motoristaRoutes);
app.use('/api/documentos', documentoRoutes);
app.use('/api/admin', adminRoutes);

// Error handler (deve ser o último middleware)
app.use(errorHandler);

export default app;
