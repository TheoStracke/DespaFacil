import prisma from '../prisma/client';

export enum NOTIFICATION_TYPES {
  DOCUMENTO_ENVIADO = 'DOCUMENTO_ENVIADO',
  DOCUMENTO_APROVADO = 'DOCUMENTO_APROVADO',
  DOCUMENTO_NEGADO = 'DOCUMENTO_NEGADO',
  MOTORISTA_CRIADO = 'MOTORISTA_CRIADO',
  SOLICITACAO_PARCEIRO = 'SOLICITACAO_PARCEIRO',
  SOLICITACAO_APROVADA = 'SOLICITACAO_APROVADA',
  SOLICITACAO_NEGADA = 'SOLICITACAO_NEGADA',
  CERTIFICADO_ENVIADO = 'CERTIFICADO_ENVIADO',
  CERTIFICADO_BAIXADO = 'CERTIFICADO_BAIXADO',
  USUARIO_CRIADO = 'USUARIO_CRIADO',
  PASSWORD_RESET = 'PASSWORD_RESET',
}

interface CreateNotificationInput {
  userId: string;
  type: keyof typeof NOTIFICATION_TYPES;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  metadata?: any;
}

/**
 * Cria uma nova notificação
 * Nunca lança exceção para não quebrar operações principais
 */
export async function createNotification(data: CreateNotificationInput) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        entityType: data.entityType,
        entityId: data.entityId,
        metadata: data.metadata || {},
      },
    });

    console.log(`📬 Notificação criada: ${data.type} para usuário ${data.userId}`);
    return notification;
  } catch (error) {
    console.error('❌ Erro ao criar notificação:', error);
    // Não lança exceção para não quebrar a operação principal
    return null;
  }
}

/**
 * Busca notificações de um usuário com filtros
 */
export async function listNotifications(
  userId: string,
  filters: {
    read?: boolean;
    type?: string;
    limit?: number;
    offset?: number;
  } = {}
) {
  const { read, type, limit = 50, offset = 0 } = filters;

  const where: any = { userId };

  if (read !== undefined) {
    where.read = read;
  }

  if (type) {
    where.type = type;
  }

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    notifications,
    total,
    unreadCount: await getUnreadCount(userId),
  };
}

/**
 * Conta notificações não lidas de um usuário
 */
export async function getUnreadCount(userId: string): Promise<number> {
  return await prisma.notification.count({
    where: {
      userId,
      read: false,
    },
  });
}

/**
 * Marca uma notificação como lida
 */
export async function markAsRead(notificationId: string, userId: string) {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId, // Garantir que o usuário só pode marcar suas próprias notificações
    },
  });

  if (!notification) {
    throw new Error('Notificação não encontrada');
  }

  return await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });
}

/**
 * Marca todas as notificações de um usuário como lidas
 */
export async function markAllAsRead(userId: string) {
  return await prisma.notification.updateMany({
    where: {
      userId,
      read: false,
    },
    data: {
      read: true,
    },
  });
}

/**
 * Deleta notificações antigas (mais de 30 dias)
 * Útil para rodar em cron job
 */
export async function deleteOldNotifications(daysOld: number = 30) {
  const dateLimit = new Date();
  dateLimit.setDate(dateLimit.getDate() - daysOld);

  const result = await prisma.notification.deleteMany({
    where: {
      createdAt: {
        lt: dateLimit,
      },
      read: true, // Só deleta notificações já lidas
    },
  });

  console.log(`🗑️ ${result.count} notificações antigas deletadas`);
  return result;
}
