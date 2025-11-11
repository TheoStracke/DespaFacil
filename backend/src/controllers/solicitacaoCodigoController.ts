import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import prisma from '../prisma/client';

// Admin: Criar solicitação de código
export async function createSolicitacao(req: AuthRequest, res: Response) {
  try {
    const { motoristaId, emailDestino, observacao } = req.body;

    if (!motoristaId || !emailDestino) {
      return res.status(400).json({ 
        success: false, 
        error: 'motoristaId e emailDestino são obrigatórios' 
      });
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

    // Criar solicitação
    const solicitacao = await prisma.solicitacaoCodigo.create({
      data: {
        motoristaId,
        emailDestino,
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
