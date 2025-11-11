import api from '@/lib/api';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  entityType?: string;
  entityId?: string;
  metadata?: any;
  createdAt: string;
}

export type NotificationType =
  | 'DOCUMENTO_ENVIADO'
  | 'DOCUMENTO_APROVADO'
  | 'DOCUMENTO_NEGADO'
  | 'MOTORISTA_CRIADO'
  | 'SOLICITACAO_PARCEIRO'
  | 'SOLICITACAO_APROVADA'
  | 'SOLICITACAO_NEGADA'
  | 'CERTIFICADO_ENVIADO'
  | 'CERTIFICADO_BAIXADO'
  | 'USUARIO_CRIADO'
  | 'PASSWORD_RESET';

/**
 * Busca contagem de notificações não lidas
 */
export async function getUnreadCount(): Promise<number> {
  try {
    const response = await api.get('/notifications/unread-count', {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    });
    return response.data.count || 0;
  } catch (error) {
    console.error('Erro ao buscar contagem de notificações:', error);
    return 0;
  }
}

/**
 * Lista notificações com filtros
 */
export async function getNotifications(filters?: {
  read?: boolean;
  type?: string;
  limit?: number;
  offset?: number;
}): Promise<{
  notifications: Notification[];
  total: number;
  unreadCount: number;
}> {
  const params = new URLSearchParams();

  if (filters?.read !== undefined) {
    params.append('read', filters.read.toString());
  }

  if (filters?.type) {
    params.append('type', filters.type);
  }

  if (filters?.limit) {
    params.append('limit', filters.limit.toString());
  }

  if (filters?.offset) {
    params.append('offset', filters.offset.toString());
  }

  console.log('📡 Buscando notificações com filtros:', filters);
  const response = await api.get(`/notifications?${params.toString()}`, {
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    },
  });
  console.log('📦 Resposta do servidor:', response.data);
  return response.data;
}

/**
 * Marca uma notificação como lida
 */
export async function markAsRead(notificationId: string): Promise<void> {
  await api.patch(`/notifications/${notificationId}/read`);
}

/**
 * Marca todas as notificações como lidas
 */
export async function markAllAsRead(): Promise<void> {
  await api.patch('/notifications/read-all');
}

/**
 * Traduz o tipo de notificação para português
 */
export function translateNotificationType(type: NotificationType): string {
  const translations: Record<NotificationType, string> = {
    DOCUMENTO_ENVIADO: 'Documento Enviado',
    DOCUMENTO_APROVADO: 'Documento Aprovado',
    DOCUMENTO_NEGADO: 'Documento Negado',
    MOTORISTA_CRIADO: 'Motorista Criado',
    SOLICITACAO_PARCEIRO: 'Solicitação de Parceria',
    SOLICITACAO_APROVADA: 'Solicitação Aprovada',
    SOLICITACAO_NEGADA: 'Solicitação Negada',
    CERTIFICADO_ENVIADO: 'Certificado Enviado',
    CERTIFICADO_BAIXADO: 'Certificado Baixado',
    USUARIO_CRIADO: 'Usuário Criado',
    PASSWORD_RESET: 'Senha Redefinida',
  };

  return translations[type] || type;
}

/**
 * Retorna a cor do badge baseado no tipo de notificação
 */
export function getNotificationColor(type: NotificationType): string {
  const colors: Record<NotificationType, string> = {
    DOCUMENTO_ENVIADO: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    DOCUMENTO_APROVADO: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    DOCUMENTO_NEGADO: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    MOTORISTA_CRIADO: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    SOLICITACAO_PARCEIRO: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    SOLICITACAO_APROVADA: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    SOLICITACAO_NEGADA: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    CERTIFICADO_ENVIADO: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    CERTIFICADO_BAIXADO: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    USUARIO_CRIADO: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    PASSWORD_RESET: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  };

  return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
}

/**
 * Retorna o ícone emoji baseado no tipo de notificação
 */
export function getNotificationIcon(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    DOCUMENTO_ENVIADO: '📄',
    DOCUMENTO_APROVADO: '✅',
    DOCUMENTO_NEGADO: '❌',
    MOTORISTA_CRIADO: '👤',
    SOLICITACAO_PARCEIRO: '🤝',
    SOLICITACAO_APROVADA: '✅',
    SOLICITACAO_NEGADA: '❌',
    CERTIFICADO_ENVIADO: '📜',
    CERTIFICADO_BAIXADO: '⬇️',
    USUARIO_CRIADO: '👤',
    PASSWORD_RESET: '🔑',
  };

  return icons[type] || '🔔';
}

/**
 * Formata a data da notificação de forma amigável
 */
export function formatNotificationDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Agora mesmo';
  if (diffMins < 60) return `${diffMins} min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays < 7) return `${diffDays}d atrás`;
  
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
