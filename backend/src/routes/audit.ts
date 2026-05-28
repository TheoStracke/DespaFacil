import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import {
  verifyAuditPassword,
  getLogs,
  getStats,
  exportLogs,
} from '../controllers/auditLogController';

const router = Router();

// Todas as rotas requerem autenticação de admin
router.use(authenticate);
router.use(requireAdmin);

// Verificar senha de acesso
router.post('/verify-password', verifyAuditPassword);

// Listar logs (após verificação de senha no frontend)
router.get('/logs', getLogs);

// Obter estatísticas
router.get('/stats', getStats);

// Exportar logs
router.get('/export', exportLogs);

export default router;
