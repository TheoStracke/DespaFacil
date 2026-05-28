import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import prisma from '../prisma/client';
import { createNotification, NOTIFICATION_TYPES } from '../services/notificationService';
import { createAuditLog, AUDIT_ACTIONS } from '../services/auditLogService';

// Admin: Criar solicitação de código
export async function createSolicitacao(req: AuthRequest, res: Response) {
  try {
    const { motoristaId, emailDestino, observacao } = req.body;

    if (!motoristaId) {
      return res.status(400).json({ success: false, error: 'motoristaId é obrigatório' });
    }

    // Buscar motorista
    const motorista = await prisma.motorista.findUnique({
      where: { id: motoristaId },
      include: {
        despachante: {
          include: { user: true },
        },
      },
    });

    if (!motorista) {
      return res.status(404).json({ success: false, error: 'Motorista não encontrado' });
    }

    // Determinar email de destino: usa o informado ou o email do motorista
    const emailDestinoFinal = emailDestino || motorista.email;
    if (!emailDestinoFinal) {
      return res.status(400).json({ success: false, error: 'Email do motorista não disponível' });
    }

    // Criar solicitação (sem envio de email externo)
    const solicitacao = await prisma.solicitacaoCodigo.create({
      data: {
        motoristaId,
        emailDestino: emailDestinoFinal,
        observacao,
        solicitadoPor: req.user!.id,
      },
      include: {
        motorista: {
          include: {
            despachante: {
              include: { user: true },
            },
          },
        },
      },
    });

    // Atualizar automaticamente a "Tabela de Dados" (DOCUMENTO2) para NEGADO com mensagem padrão
    const MOTIVO_NEGACAO = 'Solicitação de código ao email do motorista. Por favor, envie o código e então reenvie a tabela.';
    try {
      const docTabela = await prisma.documento.findUnique({
        where: {
          motoristaId_tipo: { motoristaId, tipo: 'DOCUMENTO2' as any },
        },
        include: { motorista: { include: { despachante: { include: { user: true } } } } },
      });

      if (docTabela) {
        const documentoAtualizado = await prisma.documento.update({
          where: { id: docTabela.id },
          data: {
            status: 'NEGADO' as any,
            motivoNegacao: MOTIVO_NEGACAO,
            reviewedBy: req.user!.id,
            reviewedAt: new Date(),
          },
          include: { motorista: { include: { despachante: { include: { user: true } } } } },
        });

        // Log do documento
        await prisma.logDocumento.create({
          data: {
            documentoId: documentoAtualizado.id,
            acao: 'NEGADO',
            adminId: req.user!.id,
            observacao: MOTIVO_NEGACAO,
          },
        });

        // Notificação ao despachante sobre a negação com instrução para enviar código
        try {
          await createNotification({
            userId: documentoAtualizado.motorista.despachante.userId,
            type: 'DOCUMENTO_NEGADO',
            title: 'Tabela de Dados Negada',
            message: MOTIVO_NEGACAO,
            entityType: 'Documento',
            entityId: documentoAtualizado.id,
            metadata: {
              motoristaId: documentoAtualizado.motoristaId,
              motoristaNome: documentoAtualizado.motorista.nome,
              tipo: 'DOCUMENTO2',
              solicitacaoCodigoId: solicitacao.id,
            },
          });
        } catch (notifErr) {
          console.error('Erro ao notificar despachante (não crítico):', notifErr);
        }
      }
    } catch (docErr) {
      console.error('Erro ao atualizar/registrar negação automática da Tabela de Dados:', docErr);
      // Prossegue mesmo se falhar, já que a solicitação foi criada
    }

    // Log de auditoria da solicitação
    try {
      await createAuditLog({
        userId: req.user!.id,
        action: AUDIT_ACTIONS.CODIGO_SOLICITAR,
        entityType: 'SolicitacaoCodigo',
        entityId: solicitacao.id,
        entityName: solicitacao.motorista.nome,
        metadata: {
          motoristaId,
          emailDestino: emailDestinoFinal,
          observacao,
        },
      });
    } catch (auditErr) {
      console.error('Erro ao registrar audit log (não crítico):', auditErr);
    }

    res.status(201).json({ success: true, solicitacao });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

// Admin: Listar todas solicitações
export async function listAll(req: AuthRequest, res: Response) {
  try {
    const { status } = req.query;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const solicitacoes = await prisma.solicitacaoCodigo.findMany({
      where,
      include: {
        motorista: {
          include: {
            despachante: {
              include: { user: { select: { name: true, email: true } } },
            },
          },
        },
      },
      orderBy: { solicitadoEm: 'desc' },
    });

    res.json({ success: true, solicitacoes });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

// Despachante: Listar suas solicitações
export async function listDespachantesolicitacoes(req: AuthRequest, res: Response) {
  try {
    const despachante = await prisma.despachante.findUnique({
      where: { userId: req.user!.id },
    });

    if (!despachante) {
      return res.status(404).json({ success: false, error: 'Despachante não encontrado' });
    }

    const solicitacoes = await prisma.solicitacaoCodigo.findMany({
      where: {
        motorista: {
          despachanteId: despachante.id,
        },
      },
      include: {
        motorista: true,
      },
      orderBy: { solicitadoEm: 'desc' },
    });

    res.json({ success: true, solicitacoes });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

// Despachante: Enviar código
export async function enviarCodigo(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { codigo } = req.body;

    if (!codigo) {
      return res.status(400).json({ success: false, error: 'Código é obrigatório' });
    }

    const solicitacao = await prisma.solicitacaoCodigo.findUnique({
      where: { id },
      include: {
        motorista: {
          include: {
            despachante: true,
          },
        },
      },
    });

    if (!solicitacao) {
      return res.status(404).json({ success: false, error: 'Solicitação não encontrada' });
    }

    // Verificar permissão
    const despachante = await prisma.despachante.findUnique({
      where: { userId: req.user!.id },
    });

    if (!despachante || solicitacao.motorista.despachanteId !== despachante.id) {
      return res.status(403).json({ success: false, error: 'Sem permissão' });
    }

    // Permitir reenvio - apenas atualizar a data de envio e o código
    // Atualizar solicitação
    const updated = await prisma.solicitacaoCodigo.update({
      where: { id },
      data: {
        codigo,
        status: 'ENVIADO',
        enviadoEm: new Date(),
      },
      include: {
        motorista: true,
      },
    });

    // Código registrado no sistema - despachante enviará manualmente
    res.json({ success: true, solicitacao: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

// Admin: Cancelar solicitação
export async function cancelarSolicitacao(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const solicitacao = await prisma.solicitacaoCodigo.update({
      where: { id },
      data: {
        status: 'CANCELADO',
      },
    });

    res.json({ success: true, solicitacao });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}
