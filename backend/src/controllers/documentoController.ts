import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import * as documentoService from '../services/documentoService';
import * as XLSX from 'xlsx';
import prisma from '../prisma/client';
// @ts-ignore - tipos opcionais para archiver
import archiver from 'archiver';
import { createAuditLog, AUDIT_ACTIONS } from '../services/auditLogService';
import { createNotification, NOTIFICATION_TYPES } from '../services/notificationService';

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

    // Log de auditoria
    await createAuditLog({
      userId: req.user!.id,
      action: AUDIT_ACTIONS.DOCUMENTO_UPLOAD,
      entityType: 'Documento',
      entityId: documento.id,
      entityName: `${documento.motorista.nome} - ${tipo}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: {
        motoristaId,
        tipo,
        filename: req.file.filename,
      },
    });

    // Notificar admins sobre novo documento (não deve quebrar se falhar)
    try {
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true },
      });

      for (const admin of admins) {
        await createNotification({
          userId: admin.id,
          type: 'DOCUMENTO_ENVIADO',
          title: 'Novo Documento Enviado',
          message: `${documento.motorista.nome} enviou documento: ${tipo}`,
          entityType: 'Documento',
          entityId: documento.id,
          metadata: {
            motoristaId,
            motoristaNome: documento.motorista.nome,
            tipo,
          },
        });
      }
    } catch (notifError) {
      console.error('Erro ao criar notificação (não crítico):', notifError);
    }

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

    // Log de auditoria
    const action = status === 'APROVADO' ? AUDIT_ACTIONS.DOCUMENTO_APROVAR : AUDIT_ACTIONS.DOCUMENTO_NEGAR;
    await createAuditLog({
      userId: req.user!.id,
      action,
      entityType: 'Documento',
      entityId: documento.id,
      entityName: `${documento.motorista.nome} - ${documento.tipo}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: {
        status,
        motivo,
        motoristaId: documento.motoristaId,
        tipo: documento.tipo,
      },
    });

    // Notificar despachante dono do motorista (não deve quebrar se falhar)
    try {
      const notificationType = status === 'APROVADO' ? 'DOCUMENTO_APROVADO' : 'DOCUMENTO_NEGADO';
      const notificationTitle = status === 'APROVADO' ? 'Documento Aprovado' : 'Documento Negado';
      const notificationMessage = status === 'APROVADO'
        ? `Documento ${documento.tipo} de ${documento.motorista.nome} foi aprovado`
        : `Documento ${documento.tipo} de ${documento.motorista.nome} foi negado${motivo ? `: ${motivo}` : ''}`;

      await createNotification({
        userId: documento.motorista.despachante.userId,
        type: notificationType,
        title: notificationTitle,
        message: notificationMessage,
        entityType: 'Documento',
        entityId: documento.id,
        metadata: {
          status,
          motivo,
          motoristaNome: documento.motorista.nome,
          tipo: documento.tipo,
        },
      });
    } catch (notifError) {
      console.error('Erro ao criar notificação (não crítico):', notifError);
    }

    res.json({ success: true, documento });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function listAdmin(req: AuthRequest, res: Response) {
  try {
    const filters = { ...req.query };
    
    // Se for despachante, filtrar apenas seus documentos
    if (req.user?.role === 'DESPACHANTE') {
      const despachante = await prisma.despachante.findUnique({
        where: { userId: req.user.id },
      });
      
      if (despachante) {
        filters.despachanteId = despachante.id;
      }
    }
    
    const result = await documentoService.listDocumentosAdmin(filters);
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

    // Log de auditoria
    await createAuditLog({
      userId: req.user!.id,
      action: AUDIT_ACTIONS.CERTIFICADO_ENVIAR,
      entityType: 'Certificado',
      entityId: result.certificado.id,
      entityName: `${result.motorista.nome} - ${result.motorista.cursoTipo}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: {
        motoristaId: result.motorista.id,
        motoristaSearch,
        filename: req.file.filename,
      },
    });

    // Notificar despachante que possui o motorista (não deve quebrar se falhar)
    try {
      const motorista = await prisma.motorista.findUnique({
        where: { id: result.motorista.id },
        include: {
          despachante: {
            select: { userId: true },
          },
        },
      });

      if (motorista) {
        await createNotification({
          userId: motorista.despachante.userId,
          type: 'CERTIFICADO_ENVIADO',
          title: 'Certificado Disponível',
          message: `Certificado de ${motorista.nome} (${motorista.cursoTipo}) está disponível para download`,
          entityType: 'Certificado',
          entityId: result.certificado.id,
          metadata: {
            motoristaNome: motorista.nome,
            cursoTipo: motorista.cursoTipo,
          },
        });
      }
    } catch (notifError) {
      console.error('Erro ao criar notificação (não crítico):', notifError);
    }

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

export async function downloadZipMotorista(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params; // motoristaId

    // Buscar motorista para compor o nome do arquivo e validar existência
    const motorista = await prisma.motorista.findUnique({ where: { id } });
    if (!motorista) {
      return res.status(404).json({ success: false, error: 'Motorista não encontrado' });
    }

    // Verificar aprovação de todos documentos e obter lista de arquivos
    const files = await documentoService.bulkDownloadMotoristaDocumentos(id);

    // Configurar headers para download do ZIP
    const safeName = motorista.nome.replace(/[^a-zA-Z0-9_\-]/g, '_');
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=${safeName}_documentos.zip`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', (err: any) => {
      console.error('Erro no archiver:', err);
      res.status(500).end();
    });

    // Pipe para resposta
    archive.pipe(res);

    // Adicionar arquivos
    for (const f of files) {
      archive.file(f.path, { name: f.name });
    }

    await archive.finalize();
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}
