import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import * as motoristaService from '../services/motoristaService';
import { createAuditLog, AUDIT_ACTIONS } from '../services/auditLogService';
import { createNotification, NOTIFICATION_TYPES } from '../services/notificationService';
import prisma from '../prisma/client';

export async function create(req: AuthRequest, res: Response) {
  try {
    const motorista = await motoristaService.createMotorista(req.body, req.user!.id);

    // Log de auditoria
    await createAuditLog({
      userId: req.user!.id,
      action: AUDIT_ACTIONS.MOTORISTA_CREATE,
      entityType: 'Motorista',
      entityId: motorista.id,
      entityName: motorista.nome,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: {
        cpf: motorista.cpf,
        telefone: motorista.telefone,
        parceiroId: motorista.parceiroId,
      },
    });

    // Notificar admins sobre novo motorista (não deve quebrar se falhar)
    try {
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true },
      });

      for (const admin of admins) {
        await createNotification({
          userId: admin.id,
          type: 'MOTORISTA_CRIADO',
          title: 'Novo Motorista Cadastrado',
          message: `${motorista.nome} foi cadastrado no sistema`,
          entityType: 'Motorista',
          entityId: motorista.id,
          metadata: {
            motoristaNome: motorista.nome,
            cpf: motorista.cpf,
            cursoTipo: motorista.cursoTipo,
          },
        });
      }
    } catch (notifError) {
      console.error('Erro ao criar notificação (não crítico):', notifError);
    }

    res.status(201).json({ success: true, motorista });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function list(req: AuthRequest, res: Response) {
  try {
    const result = await motoristaService.listMotoristas(req.user!.id, req.user!.role, req.query);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function getById(req: AuthRequest, res: Response) {
  try {
    const motorista = await motoristaService.getMotoristaById(req.params.id, req.user!.id, req.user!.role);
    res.json({ success: true, motorista });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const motorista = await motoristaService.updateMotorista(req.params.id, req.body, req.user!.id, req.user!.role);

    // Log de auditoria
    await createAuditLog({
      userId: req.user!.id,
      action: AUDIT_ACTIONS.MOTORISTA_UPDATE,
      entityType: 'Motorista',
      entityId: motorista.id,
      entityName: motorista.nome,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: {
        updatedFields: Object.keys(req.body),
      },
    });

    res.json({ success: true, motorista });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    // Buscar motorista antes de deletar para pegar o nome
    const motorista = await motoristaService.getMotoristaById(req.params.id, req.user!.id, req.user!.role);

    await motoristaService.deleteMotorista(req.params.id, req.user!.id, req.user!.role);

    // Log de auditoria
    await createAuditLog({
      userId: req.user!.id,
      action: AUDIT_ACTIONS.MOTORISTA_DELETE,
      entityType: 'Motorista',
      entityId: motorista.id,
      entityName: motorista.nome,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: {
        cpf: motorista.cpf,
      },
    });

    res.json({ success: true, message: 'Motorista excluído' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}
