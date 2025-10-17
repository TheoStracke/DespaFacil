import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import prisma from '../prisma/client';
import path from 'path';
import fs from 'fs';

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
    if (!certificado.baixadoEm) {
      await prisma.certificado.update({
        where: { id },
        data: { baixadoEm: new Date() },
      });
    }

    // Enviar arquivo
    const filePath = path.resolve(certificado.path);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Arquivo não encontrado no servidor' });
    }

    res.download(filePath, certificado.originalName);
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}
