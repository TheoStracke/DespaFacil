import { Router } from 'express';
import { status, solicitar, listar, aprovar, rejeitar } from '../controllers/parceiroController';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Público: checar status do CNPJ e solicitar parceria
router.get('/status', status);
router.post('/solicitar', solicitar);

// Admin: gerenciar solicitações
router.use(authMiddleware, roleMiddleware(['ADMIN']));
router.get('/solicitacoes', listar);
router.post('/solicitacoes/:id/aprovar', aprovar);
router.post('/solicitacoes/:id/rejeitar', rejeitar);

export default router;
