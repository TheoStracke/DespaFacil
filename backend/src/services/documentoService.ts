import prisma from '../prisma/client';
import { sendEmail } from '../utils/mailer';
import path from 'path';
import fs from 'fs';

export async function uploadDocumento(
  motoristaId: string,
  tipo: string,
  file: Express.Multer.File,
  userId: string,
  role: string
) {
  console.log('📤 uploadDocumento chamado:');
  console.log('  - motoristaId:', motoristaId);
  console.log('  - tipo:', tipo);
  console.log('  - file:', file ? file.filename : 'NULL');
  console.log('  - userId:', userId);
  console.log('  - role:', role);

  const motorista = await prisma.motorista.findUnique({
    where: { id: motoristaId },
    include: {
      despachante: {
        include: { user: true },
      },
    },
  });

  if (!motorista) {
    throw new Error('Motorista não encontrado');
  }

  // Verificar permissão
  if (role === 'DESPACHANTE') {
    const despachante = await prisma.despachante.findUnique({ where: { userId } });
    if (!despachante || motorista.despachanteId !== despachante.id) {
      throw new Error('Acesso negado');
    }
  }

  // Verificar se já existe documento deste tipo
  const existingDoc = await prisma.documento.findUnique({
    where: {
      motoristaId_tipo: {
        motoristaId,
        tipo: tipo as any,
      },
    },
  });

  if (existingDoc) {
    // Remover arquivo antigo
    try {
      if (fs.existsSync(existingDoc.path)) {
        fs.unlinkSync(existingDoc.path);
      }
    } catch (err) {
      console.error('Erro ao remover arquivo antigo:', err);
    }

    // Atualizar documento
    const updated = await prisma.documento.update({
      where: { id: existingDoc.id },
      data: {
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
        status: 'PENDENTE',
        uploadedBy: userId,
        uploadedAt: new Date(),
        reviewedBy: null,
        reviewedAt: null,
        motivoNegacao: null,
      },
    });

    // Criar log
    await prisma.logDocumento.create({
      data: {
        documentoId: updated.id,
        acao: 'SUBSTITUIDO',
        adminId: userId,
        observacao: `Arquivo substituído: ${file.filename}`,
      },
    });

    // Enviar notificação (não-bloqueante)
    notifyDocumentUploaded(motorista, tipo, motorista.despachante.user.email)
      .catch((err) => {
        console.error('⚠️ Erro ao enviar email (não bloqueou o upload):', err.message);
      });

    return updated;
  } else {
    // Criar novo documento
    const documento = await prisma.documento.create({
      data: {
        motoristaId,
        tipo: tipo as any,
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
        uploadedBy: userId,
      },
    });

    // Criar log
    await prisma.logDocumento.create({
      data: {
        documentoId: documento.id,
        acao: 'ENVIADO',
        adminId: userId,
        observacao: `Documento enviado: ${file.filename}`,
      },
    });

    // Enviar notificação (não-bloqueante)
    notifyDocumentUploaded(motorista, tipo, motorista.despachante.user.email)
      .catch((err) => {
        console.error('⚠️ Erro ao enviar email (não bloqueou o upload):', err.message);
      });

    return documento;
  }
}

export async function updateDocumentoStatus(
  documentoId: string,
  status: string,
  motivoNegacao: string | undefined,
  userId: string
) {
  const documento = await prisma.documento.findUnique({
    where: { id: documentoId },
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

  if (!documento) {
    throw new Error('Documento não encontrado');
  }

  const updated = await prisma.documento.update({
    where: { id: documentoId },
    data: {
      status: status as any,
      motivoNegacao: status === 'NEGADO' ? motivoNegacao : null,
      reviewedBy: userId,
      reviewedAt: new Date(),
    },
  });

  // Criar log
  await prisma.logDocumento.create({
    data: {
      documentoId,
      acao: status,
      adminId: userId,
      observacao: motivoNegacao || `Status alterado para ${status}`,
    },
  });

  // Notificar despachante (não-bloqueante)
  notifyStatusChanged(documento.motorista, documento.tipo, status, motivoNegacao)
    .catch((err) => {
      console.error('⚠️ Erro ao enviar email (não bloqueou a operação):', err.message);
    });

  return updated;
}

export async function listDocumentosAdmin(filters: any) {
  const { status, from, to, despachanteId, motoristaId, page = 1, limit = 50 } = filters;

  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (from || to) {
    where.uploadedAt = {};
    if (from) where.uploadedAt.gte = new Date(from);
    if (to) where.uploadedAt.lte = new Date(to);
  }

  if (motoristaId) {
    where.motoristaId = motoristaId;
  }

  if (despachanteId) {
    where.motorista = {
      despachanteId,
    };
  }

  const skip = (page - 1) * limit;

  const [documentos, total] = await Promise.all([
    prisma.documento.findMany({
      where,
      skip,
      take: limit,
      include: {
        motorista: {
          include: {
            despachante: {
              include: {
                user: { select: { name: true, email: true } },
              },
            },
          },
        },
      },
      orderBy: { uploadedAt: 'desc' },
    }),
    prisma.documento.count({ where }),
  ]);

  return {
    documentos,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

export async function exportDocumentos(filters: any) {
  const { status, from, to } = filters;

  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (from || to) {
    where.uploadedAt = {};
    if (from) where.uploadedAt.gte = new Date(from);
    if (to) where.uploadedAt.lte = new Date(to);
  }

  const documentos = await prisma.documento.findMany({
    where,
    include: {
      motorista: {
        include: {
          despachante: {
            include: {
              user: { select: { name: true, email: true } },
            },
          },
        },
      },
    },
    orderBy: { uploadedAt: 'desc' },
  });

  return documentos.map((doc) => ({
    'Nome Despachante': doc.motorista.despachante.user.name,
    'Email Despachante': doc.motorista.despachante.user.email,
    'Nome Motorista': doc.motorista.nome,
    'CPF Motorista': doc.motorista.cpf,
    'Tipo Curso': doc.motorista.cursoTipo,
    'Tipo Documento': doc.tipo,
    'Status': doc.status,
    'Data Envio': doc.uploadedAt.toISOString(),
    'Data Revisão': doc.reviewedAt ? doc.reviewedAt.toISOString() : '',
    'Motivo Negação': doc.motivoNegacao || '',
  }));
}

export async function sendCertificado(
  motoristaSearch: string,
  file: Express.Multer.File,
  userId: string
) {
  // Buscar motorista por nome ou CPF
  const motorista = await prisma.motorista.findFirst({
    where: {
      OR: [
        { nome: { contains: motoristaSearch, mode: 'insensitive' } },
        { cpf: motoristaSearch.replace(/\D/g, '') },
      ],
    },
    include: {
      despachante: {
        include: { user: true },
      },
    },
  });

  if (!motorista) {
    throw new Error('Motorista não encontrado');
  }

  // Enviar email com certificado (não-bloqueante)
  sendEmail({
    to: motorista.despachante.user.email,
    subject: `Certificado disponível - ${motorista.nome}`,
    html: `
      <h2>Certificado Disponível</h2>
      <p>O certificado do motorista <strong>${motorista.nome}</strong> (CPF: ${motorista.cpf}) está disponível.</p>
      <p>Entre em contato com a administração para receber o arquivo.</p>
    `,
  }).catch((err) => {
    console.error('⚠️ Erro ao enviar email de certificado:', err.message);
  });

  // Criar log
  await prisma.logDocumento.create({
    data: {
      documentoId: motorista.id, // Usar motoristaId como referência temporária
      acao: 'CERTIFICADO_ENVIADO',
      adminId: userId,
      observacao: `Certificado enviado para ${motorista.nome}`,
    } as any,
  });

  return { message: 'Certificado enviado com sucesso', motorista };
}

async function notifyDocumentUploaded(motorista: any, tipo: string, despachanteEmail: string) {
  const notificationEmail = process.env.NOTIFICATION_EMAIL || 'despafacilrepo@gmail.com';
  const ccEmail = process.env.NOTIFICATION_CC || 'theostracke11@gmail.com';

  return sendEmail({
    to: notificationEmail,
    cc: ccEmail,
    subject: `Novo documento enviado - ${motorista.nome}`,
    html: `
      <h2>Novo Documento Enviado</h2>
      <p><strong>Motorista:</strong> ${motorista.nome} (CPF: ${motorista.cpf})</p>
      <p><strong>Tipo de documento:</strong> ${tipo}</p>
      <p><strong>Despachante:</strong> ${despachanteEmail}</p>
      <p>Acesse o painel administrativo para revisar.</p>
    `,
  });
}

async function notifyStatusChanged(
  motorista: any,
  tipo: string,
  status: string,
  motivo?: string
) {
  const despachanteEmail = motorista.despachante.user.email;

  const statusText = status === 'APROVADO' ? 'aprovado' : 'negado';

  return sendEmail({
    to: despachanteEmail,
    subject: `Documento ${statusText} - ${motorista.nome}`,
    html: `
      <h2>Status do Documento Atualizado</h2>
      <p><strong>Motorista:</strong> ${motorista.nome} (CPF: ${motorista.cpf})</p>
      <p><strong>Tipo de documento:</strong> ${tipo}</p>
      <p><strong>Status:</strong> ${statusText.toUpperCase()}</p>
      ${motivo ? `<p><strong>Motivo:</strong> ${motivo}</p>` : ''}
    `,
  });
}
