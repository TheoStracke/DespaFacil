import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as notificationController from '../controllers/notificationController';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// GET /api/notifications/unread-count - Contagem de não lidas
router.get('/unread-count', notificationController.getUnreadCount);

// GET /api/notifications - Listar notificações
router.get('/', notificationController.list);

// PATCH /api/notifications/read-all - Marcar todas como lidas
router.patch('/read-all', notificationController.markAllAsRead);

// PATCH /api/notifications/:id/read - Marcar como lida
router.patch('/:id/read', notificationController.markAsRead);

export default router;
