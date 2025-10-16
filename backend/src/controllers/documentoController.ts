import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import * as documentoService from '../services/documentoService';
import * as XLSX from 'xlsx';
import prisma from '../prisma/client';

export async function upload(req: AuthRequest, res: Response) {
  try {
    console.log('🔵 Upload controller chamado');
    console.log('  - req.file:', req.file ? req.file.filename : 'NULL');
    console.log('  - req.body:', req.body);
    console.log('  - user:', req.user?.id, req.user?.role);

    if (!req.file) {
      console.log('❌ Nenhum arquivo enviado');
      return res.status(400).json({ success: false, error: 'Nenhum arquivo enviado' });
    }

    const { motoristaId, tipo } = req.body;

    if (!motoristaId || !tipo) {
      console.log('❌ Campos obrigatórios faltando:', { motoristaId, tipo });
      return res.status(400).json({ success: false, error: 'motoristaId e tipo são obrigatórios' });
    }

    const documento = await documentoService.uploadDocumento(
      motoristaId,
      tipo,
      req.file,
      req.user!.id,
      req.user!.role
    );

    res.status(201).json({ success: true, documento });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function updateStatus(req: AuthRequest, res: Response) {
  try {
    const { status, motivo } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: 'Status é obrigatório' });
    }

    const documento = await documentoService.updateDocumentoStatus(
      req.params.id,
      status,
      motivo,
      req.user!.id
    );

    res.json({ success: true, documento });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function listAdmin(req: AuthRequest, res: Response) {
  try {
    const result = await documentoService.listDocumentosAdmin(req.query);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function exportCSV(req: AuthRequest, res: Response) {
  try {
    const data = await documentoService.exportDocumentos(req.query);

    // Gerar CSV
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Documentos');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=documentos-export.xlsx');
    res.send(buffer);
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function sendCertificate(req: AuthRequest, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Nenhum arquivo enviado' });
    }

    const { motoristaSearch } = req.body;

    if (!motoristaSearch) {
      return res.status(400).json({ success: false, error: 'motoristaSearch é obrigatório (nome ou CPF)' });
    }

    const result = await documentoService.sendCertificado(
      motoristaSearch,
      req.file,
      req.user!.id
    );

    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function downloadDocumento(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    
    const documento = await prisma.documento.findUnique({
      where: { id },
      include: {
        motorista: {
          include: { despachante: true },
        },
      },
    });

    if (!documento) {
      return res.status(404).json({ success: false, error: 'Documento não encontrado' });
    }

    // Verificar permissão
    if (req.user!.role === 'DESPACHANTE') {
      const despachante = await prisma.despachante.findUnique({ where: { userId: req.user!.id } });
      if (!despachante || documento.motorista.despachanteId !== despachante.id) {
        return res.status(403).json({ success: false, error: 'Acesso negado' });
      }
    }

    res.download(documento.path, documento.filename);
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}
