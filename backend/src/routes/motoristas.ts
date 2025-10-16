import { Router } from 'express';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';
import * as motoristaController from '../controllers/motoristaController';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// CRUD de motoristas (despachantes e admins)
router.post('/', roleMiddleware(['DESPACHANTE', 'ADMIN']), motoristaController.create);
router.get('/', roleMiddleware(['DESPACHANTE', 'ADMIN']), motoristaController.list);
router.get('/:id', roleMiddleware(['DESPACHANTE', 'ADMIN']), motoristaController.getById);
router.put('/:id', roleMiddleware(['DESPACHANTE', 'ADMIN']), motoristaController.update);
router.delete('/:id', roleMiddleware(['DESPACHANTE', 'ADMIN']), motoristaController.remove);

export default router;
