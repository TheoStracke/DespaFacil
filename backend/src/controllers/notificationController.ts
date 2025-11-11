import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import * as notificationService from '../services/notificationService';

/**
 * GET /api/notifications/unread-count
 * Retorna contagem de notificações não lidas
 */
export async function getUnreadCount(req: AuthRequest, res: Response) {
  try {
    const count = await notificationService.getUnreadCount(req.user!.id);
    res.json({ success: true, count });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/notifications
 * Lista notificações do usuário com filtros
 */
export async function list(req: AuthRequest, res: Response) {
  try {
    const { read, type, limit, offset } = req.query;

    const filters: any = {};

    if (read !== undefined) {
      filters.read = read === 'true';
    }

    if (type) {
      filters.type = type as string;
    }

    if (limit) {
      filters.limit = parseInt(limit as string);
    }

    if (offset) {
      filters.offset = parseInt(offset as string);
    }

    const result = await notificationService.listNotifications(req.user!.id, filters);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

/**
 * PATCH /api/notifications/:id/read
 * Marca uma notificação como lida
 */
export async function markAsRead(req: AuthRequest, res: Response) {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user!.id);
    res.json({ success: true, notification });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

/**
 * PATCH /api/notifications/read-all
 * Marca todas as notificações como lidas
 */
export async function markAllAsRead(req: AuthRequest, res: Response) {
  try {
    const result = await notificationService.markAllAsRead(req.user!.id);
    res.json({ success: true, count: result.count });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}
