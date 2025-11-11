import { Request, Response } from 'express';
import { getParceiroStatus, solicitarParceria, listarSolicitacoes, aprovarSolicitacao, rejeitarSolicitacao } from '../services/parceiroService';
import { createAuditLog, AUDIT_ACTIONS } from '../services/auditLogService';
import prisma from '../prisma/client';
import { createNotification, NOTIFICATION_TYPES } from '../services/notificationService';

export async function status(req: Request, res: Response) {
  const { cnpj } = req.query as { cnpj?: string };
  if (!cnpj) return res.status(400).json({ error: 'CNPJ_OBRIGATORIO' });
  const data = await getParceiroStatus(cnpj);
  res.json(data);
}

export async function solicitar(req: Request, res: Response) {
  const { cnpj, empresa, telefone, email, senha, nomeResponsavel, mensagem } = req.body || {};
  if (!cnpj || !empresa || !telefone || !email || !senha) {
    return res.status(400).json({ error: 'CAMPOS_OBRIGATORIOS' });
  }
  const r = await solicitarParceria({ cnpj, empresa, telefone, email, senha, nomeResponsavel, mensagem });
  
  if (r.ok) {
    // Notificar admins sobre nova solicitação de parceria (não deve quebrar se falhar)
    try {
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true },
      });

      for (const admin of admins) {
        await createNotification({
          userId: admin.id,
          type: 'SOLICITACAO_PARCEIRO',
          title: 'Nova Solicitação de Parceria',
          message: `${empresa} solicitou cadastro como parceiro`,
          entityType: 'Solicitacao',
          entityId: (r as any).solicitacaoId,
          metadata: {
            empresa,
            cnpj,
            email,
            nomeResponsavel,
          },
        });
      }
    } catch (notifError) {
      console.error('Erro ao criar notificação (não crítico):', notifError);
    }
  }
  
  if (!r.ok) return res.status(429).json(r);
  res.json(r);
}

export async function listar(req: Request, res: Response) {
  const { status } = req.query as { status?: 'PENDENTE' | 'APROVADO' | 'REJEITADO' };
  res.json(await listarSolicitacoes(status));
}

export async function aprovar(req: Request, res: Response) {
  const result = await aprovarSolicitacao(req.params.id, (req as any).user?.id);

  if (result.ok) {
    // Buscar parceiro criado para log de auditoria
    const solicitacao = await (prisma as any).solicitacaoCadastro.findUnique({
      where: { id: req.params.id },
    });

    if (solicitacao) {
      const parceiro = await (prisma as any).parceiro.findUnique({
        where: { cnpj: solicitacao.cnpj },
      });

      if (parceiro) {
        await createAuditLog({
          userId: (req as any).user?.id,
          action: AUDIT_ACTIONS.SOLICITACAO_APROVAR,
          entityType: 'Parceiro',
          entityId: parceiro.id,
          entityName: parceiro.empresa,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          metadata: {
            cnpj: parceiro.cnpj,
            solicitacaoId: req.params.id,
          },
        });

        // Notificar usuário parceiro aprovado (não deve quebrar se falhar)
        try {
          if (parceiro.userId) {
            await createNotification({
              userId: parceiro.userId,
              type: 'SOLICITACAO_APROVADA',
              title: 'Solicitação Aprovada!',
              message: `Sua solicitação de parceria foi aprovada. Bem-vindo ao DespaFacil!`,
              entityType: 'Parceiro',
              entityId: parceiro.id,
              metadata: {
                empresa: parceiro.empresa,
                cnpj: parceiro.cnpj,
              },
            });
          }
        } catch (notifError) {
          console.error('Erro ao criar notificação (não crítico):', notifError);
        }
      }
    }
  }

  res.json(result);
}

export async function rejeitar(req: Request, res: Response) {
  // Buscar solicitação antes de rejeitar para log de auditoria
  const solicitacao = await (prisma as any).solicitacaoCadastro.findUnique({
    where: { id: req.params.id },
  });

  const result = await rejeitarSolicitacao(req.params.id, req.body?.observacoes, (req as any).user?.id);

  if (result.ok && solicitacao) {
    // Log de auditoria
    await createAuditLog({
      userId: (req as any).user?.id,
      action: AUDIT_ACTIONS.SOLICITACAO_NEGAR,
      entityType: 'Solicitacao',
      entityId: solicitacao.id,
      entityName: solicitacao.empresa,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: {
        cnpj: solicitacao.cnpj,
        observacoes: req.body?.observacoes,
      },
    });

    // Notificar sobre rejeição (se existir user criado) (não deve quebrar se falhar)
    try {
      if (solicitacao.userId) {
        await createNotification({
          userId: solicitacao.userId,
          type: 'SOLICITACAO_NEGADA',
          title: 'Solicitação Negada',
          message: `Sua solicitação de parceria foi negada${req.body?.observacoes ? `: ${req.body?.observacoes}` : ''}`,
          entityType: 'Solicitacao',
          entityId: solicitacao.id,
          metadata: {
            empresa: solicitacao.empresa,
            cnpj: solicitacao.cnpj,
            observacoes: req.body?.observacoes,
          },
        });
      }
    } catch (notifError) {
      console.error('Erro ao criar notificação (não crítico):', notifError);
    }
  }

  res.json(result);
}
