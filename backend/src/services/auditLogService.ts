import prisma from '../prisma/client';

export interface CreateAuditLogInput {
  userId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  entityName?: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}

// Criar log de auditoria
export async function createAuditLog(data: CreateAuditLogInput) {
  try {
    const log = await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        entityName: data.entityName,
        metadata: data.metadata,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
    
    console.log(`📝 Audit Log: ${data.action} by ${data.userId}`);
    return log;
  } catch (error) {
    console.error('❌ Erro ao criar log de auditoria:', error);
    // Não falha a operação principal se o log falhar
    return null;
  }
}

// Listar logs com filtros
export async function listAuditLogs(filters: {
  userId?: string;
  action?: string;
  entityType?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const where: any = {};

  if (filters.userId) where.userId = filters.userId;
  if (filters.action) where.action = filters.action;
  if (filters.entityType) where.entityType = filters.entityType;
  
  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate) where.createdAt.gte = filters.startDate;
    if (filters.endDate) where.createdAt.lte = filters.endDate;
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 50,
      skip: filters.offset || 0,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total };
}

// Obter estatísticas de auditoria
export async function getAuditStats(startDate?: Date, endDate?: Date) {
  const where: any = {};
  
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  const [totalLogs, actionCounts, userCounts] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.groupBy({
      by: ['action'],
      where,
      _count: true,
      orderBy: { _count: { action: 'desc' } },
      take: 10,
    }),
    prisma.auditLog.groupBy({
      by: ['userId'],
      where,
      _count: true,
      orderBy: { _count: { userId: 'desc' } },
      take: 10,
    }),
  ]);

  return {
    totalLogs,
    actionCounts,
    userCounts,
  };
}

// Constantes de ações para auditoria
export const AUDIT_ACTIONS = {
  // Autenticação
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  LOGIN_FAILED: 'LOGIN_FAILED',
  PASSWORD_RESET_REQUEST: 'PASSWORD_RESET_REQUEST',
  PASSWORD_RESET_COMPLETE: 'PASSWORD_RESET_COMPLETE',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  
  // Motoristas
  MOTORISTA_CREATE: 'MOTORISTA_CREATE',
  MOTORISTA_UPDATE: 'MOTORISTA_UPDATE',
  MOTORISTA_DELETE: 'MOTORISTA_DELETE',
  
  // Documentos
  DOCUMENTO_UPLOAD: 'DOCUMENTO_UPLOAD',
  DOCUMENTO_APROVAR: 'DOCUMENTO_APROVAR',
  DOCUMENTO_NEGAR: 'DOCUMENTO_NEGAR',
  DOCUMENTO_DOWNLOAD: 'DOCUMENTO_DOWNLOAD',
  DOCUMENTO_DELETE: 'DOCUMENTO_DELETE',
  
  // Certificados
  CERTIFICADO_ENVIAR: 'CERTIFICADO_ENVIAR',
  CERTIFICADO_DOWNLOAD: 'CERTIFICADO_DOWNLOAD',
  
  // Usuários
  USER_CREATE: 'USER_CREATE',
  USER_UPDATE: 'USER_UPDATE',
  USER_DELETE: 'USER_DELETE',
  
  // Solicitações
  SOLICITACAO_APROVAR: 'SOLICITACAO_APROVAR',
  SOLICITACAO_NEGAR: 'SOLICITACAO_NEGAR',
  
  // Códigos
  CODIGO_SOLICITAR: 'CODIGO_SOLICITAR',
  CODIGO_ENVIAR: 'CODIGO_ENVIAR',
  
  // Auditoria
  AUDIT_ACCESS: 'AUDIT_ACCESS',
  AUDIT_EXPORT: 'AUDIT_EXPORT',
} as const;
