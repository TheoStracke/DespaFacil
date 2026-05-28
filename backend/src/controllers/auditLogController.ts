import { Request, Response } from 'express';
import { listAuditLogs, getAuditStats, createAuditLog, AUDIT_ACTIONS } from '../services/auditLogService';

// Senha fixa para acessar logs de auditoria
const AUDIT_PASSWORD = '$up0rt32025';

// Verificar senha de acesso aos logs
export async function verifyAuditPassword(req: Request, res: Response) {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Senha é obrigatória' });
    }

    if (password !== AUDIT_PASSWORD) {
      // Log de tentativa de acesso negado
      if (req.user?.id) {
        await createAuditLog({
          userId: req.user.id,
          action: 'AUDIT_ACCESS_DENIED',
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          metadata: { reason: 'Senha incorreta' },
        });
      }
      
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    // Log de acesso bem-sucedido
    if (req.user?.id) {
      await createAuditLog({
        userId: req.user.id,
        action: AUDIT_ACTIONS.AUDIT_ACCESS,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
    }

    return res.json({ success: true, message: 'Acesso autorizado' });
  } catch (error: any) {
    console.error('Erro ao verificar senha de auditoria:', error);
    return res.status(500).json({ error: 'Erro ao verificar senha' });
  }
}

// Listar logs de auditoria
export async function getLogs(req: Request, res: Response) {
  try {
    const {
      userId,
      action,
      entityType,
      startDate,
      endDate,
      limit,
      offset,
    } = req.query;

    const filters: any = {
      limit: limit ? parseInt(limit as string) : 50,
      offset: offset ? parseInt(offset as string) : 0,
    };

    if (userId) filters.userId = userId as string;
    if (action) filters.action = action as string;
    if (entityType) filters.entityType = entityType as string;
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);

    const result = await listAuditLogs(filters);

    return res.json(result);
  } catch (error: any) {
    console.error('Erro ao listar logs de auditoria:', error);
    return res.status(500).json({ error: 'Erro ao listar logs' });
  }
}

// Obter estatísticas
export async function getStats(req: Request, res: Response) {
  try {
    const { startDate, endDate } = req.query;

    const filters: any = {};
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);

    const stats = await getAuditStats(filters.startDate, filters.endDate);

    return res.json(stats);
  } catch (error: any) {
    console.error('Erro ao obter estatísticas de auditoria:', error);
    return res.status(500).json({ error: 'Erro ao obter estatísticas' });
  }
}

// Exportar logs (será logado também)
export async function exportLogs(req: Request, res: Response) {
  try {
    const {
      userId,
      action,
      entityType,
      startDate,
      endDate,
    } = req.query;

    const filters: any = {
      limit: 10000, // Máximo para export
      offset: 0,
    };

    if (userId) filters.userId = userId as string;
    if (action) filters.action = action as string;
    if (entityType) filters.entityType = entityType as string;
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);

    const result = await listAuditLogs(filters);

    // Log da exportação
    if (req.user?.id) {
      await createAuditLog({
        userId: req.user.id,
        action: AUDIT_ACTIONS.AUDIT_EXPORT,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        metadata: { filters, totalExported: result.logs.length },
      });
    }

    return res.json({ logs: result.logs, total: result.total });
  } catch (error: any) {
    console.error('Erro ao exportar logs:', error);
    return res.status(500).json({ error: 'Erro ao exportar logs' });
  }
}
