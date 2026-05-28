import { Router } from 'express';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';
import * as solicitacaoCodigoController from '../controllers/solicitacaoCodigoController';

const router = Router();

// Todas as rotas requerem autenticação de despachante
router.use(authMiddleware);
router.use(roleMiddleware(['DESPACHANTE']));

// Listar solicitações pendentes do despachante
router.get('/', solicitacaoCodigoController.listDespachantesolicitacoes);

// Enviar código para uma solicitação
router.post('/:id/enviar-codigo', solicitacaoCodigoController.enviarCodigo);

export default router;
