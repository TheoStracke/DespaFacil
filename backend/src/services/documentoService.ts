import prisma from '../prisma/client';
import { sendEmail } from '../utils/mailer';
import path from 'path';
import fs from 'fs';
import { getAppUrl } from '../utils/appUrl';

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

  // Converter page e limit para números
  const pageNum = parseInt(String(page), 10) || 1;
  const limitNum = parseInt(String(limit), 10) || 50;

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

  const skip = (pageNum - 1) * limitNum;

  const [documentos, total] = await Promise.all([
    prisma.documento.findMany({
      where,
      skip,
      take: limitNum,
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
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
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

  return documentos.map((doc: any) => ({
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

  console.log('');
  console.log('📧 ========== INICIANDO ENVIO DE EMAIL ==========');
  console.log('   Motorista:', motorista.nome);
  console.log('   CPF:', motorista.cpf);
  console.log('   Despachante:', motorista.despachante.user.name);
  console.log('   Email destino:', motorista.despachante.user.email);
  console.log('   Arquivo anexo:', file.originalname);
  console.log('   Tamanho:', (file.size / 1024).toFixed(2), 'KB');
  console.log('================================================');
  console.log('');

  // Salvar certificado no banco de dados
  const certificado = await prisma.certificado.create({
    data: {
      motoristaId: motorista.id,
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size,
      enviadoPor: userId,
    },
  });

  console.log('💾 Certificado salvo no banco de dados:', certificado.id);

  // Enviar email de notificação (SEM anexo, apenas aviso)
  sendEmail({
    to: motorista.despachante.user.email,
    subject: `📜 Novo Certificado Disponível - ${motorista.nome}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">📜 Novo Certificado Disponível</h2>
        
        <p>Olá <strong>${motorista.despachante.user.name}</strong>,</p>
        
        <p>Um novo certificado está disponível para o motorista:</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1f2937;">Informações do Motorista</h3>
          <p style="margin: 5px 0;"><strong>Nome:</strong> ${motorista.nome}</p>
          <p style="margin: 5px 0;"><strong>CPF:</strong> ${motorista.cpf}</p>
          <p style="margin: 5px 0;"><strong>Tipo de Curso:</strong> ${motorista.cursoTipo}</p>
        </div>
        
        <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb;">
          <p style="margin: 0; color: #1e40af;">
            <strong>� Para baixar o certificado:</strong><br>
            Acesse seu painel em <a href="${getAppUrl()}/dashboard" style="color: #2563eb; text-decoration: none;">DespaFacil</a> e vá na seção "Certificados".
          </p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          DespaFacil - Sistema de Gestão de Documentos<br>
          Este é um email automático, não responda.
        </p>
      </div>
    `,
  }).then(() => {
    console.log('');
    console.log('✅ ========== EMAIL DE NOTIFICAÇÃO ENVIADO ==========');
    console.log('   Para:', motorista.despachante.user.email);
    console.log('   Certificado salvo ID:', certificado.id);
    console.log('====================================================');
    console.log('');
  }).catch((err) => {
    console.log('');
    console.error('❌ ========== ERRO AO ENVIAR EMAIL ==========');
    console.error('   Para:', motorista.despachante.user.email);
    console.error('   Erro:', err.message);
    console.error('   Code:', err.code);
    console.error('   Stack:', err.stack);
    console.error('   OBS: Certificado foi salvo, mas email falhou');
    console.error('=============================================');
    console.error('');
  });

  // Log simplificado sem vincular a um documento específico
  console.log(`✅ Certificado enviado para ${motorista.nome} pelo admin ${userId}`);

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
