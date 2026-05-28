import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import prisma from '../prisma/client';
import path from 'path';
import fs from 'fs';
import { createAuditLog, AUDIT_ACTIONS } from '../services/auditLogService';
import { isAzureProvider, getAzureReadStream } from '../utils/azureStorage';

// Listar todos certificados (admin e despachante)
export async function listAll(req: AuthRequest, res: Response) {
  try {
    const where: any = {};
    
    // Se for despachante, filtrar apenas seus motoristas
    if (req.user?.role === 'DESPACHANTE') {
      const despachante = await prisma.despachante.findUnique({
        where: { userId: req.user.id },
      });
      
      if (despachante) {
        where.motorista = {
          despachanteId: despachante.id,
        };
      }
    }
    
    const certificados = await prisma.certificado.findMany({
      where,
      include: {
        motorista: {
          select: {
            id: true,
            nome: true,
            cpf: true,
            cursoTipo: true,
          },
        },
      },
      orderBy: { enviadoEm: 'desc' },
    });

    res.json({ success: true, certificados });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

// Listar certificados do despachante logado
export async function listCertificados(req: AuthRequest, res: Response) {
  try {
    const despachante = await prisma.despachante.findUnique({
      where: { userId: req.user!.id },
    });

    if (!despachante) {
      return res.status(404).json({ success: false, error: 'Despachante não encontrado' });
    }

    const certificados = await prisma.certificado.findMany({
      where: {
        motorista: {
          despachanteId: despachante.id,
        },
      },
      include: {
        motorista: {
          select: {
            id: true,
            nome: true,
            cpf: true,
            cursoTipo: true,
          },
        },
      },
      orderBy: {
        enviadoEm: 'desc',
      },
    });

    res.json({ success: true, certificados });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

// Baixar certificado
export async function downloadCertificado(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const certificado = await prisma.certificado.findUnique({
      where: { id },
      include: {
        motorista: {
          include: {
            despachante: true,
          },
        },
      },
    });

    if (!certificado) {
      return res.status(404).json({ success: false, error: 'Certificado não encontrado' });
    }

    // Verificar permissão (somente o despachante dono)
    if (req.user!.role === 'DESPACHANTE') {
      const despachante = await prisma.despachante.findUnique({
        where: { userId: req.user!.id },
      });

      if (!despachante || certificado.motorista.despachanteId !== despachante.id) {
        return res.status(403).json({ success: false, error: 'Sem permissão para acessar este certificado' });
      }
    }

    // Atualizar data de download (primeira vez)
    const isFirstDownload = !certificado.baixadoEm;
    if (isFirstDownload) {
      await prisma.certificado.update({
        where: { id },
        data: { baixadoEm: new Date() },
      });

      // Log de auditoria apenas no primeiro download
      await createAuditLog({
        userId: req.user!.id,
        action: AUDIT_ACTIONS.CERTIFICADO_DOWNLOAD,
        entityType: 'Certificado',
        entityId: certificado.id,
        entityName: `${certificado.motorista.nome} - ${certificado.motorista.cursoTipo}`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        metadata: {
          motoristaId: certificado.motoristaId,
          originalName: certificado.originalName,
        },
      });
    }

    // Enviar arquivo
    if (isAzureProvider()) {
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(certificado.originalName)}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      const azureStream = await getAzureReadStream(certificado.path);
      azureStream.pipe(res);
      azureStream.on('error', (error) => {
        console.error('Erro ao baixar certificado do Azure:', error);
        if (!res.headersSent) {
          res.status(500).json({ success: false, error: 'Erro ao baixar certificado' });
        }
      });
    } else {
      const filePath = path.resolve(certificado.path);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, error: 'Arquivo não encontrado no servidor' });
      }
      res.download(filePath, certificado.originalName);
    }
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}
