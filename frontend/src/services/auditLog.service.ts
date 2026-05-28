import api from '@/lib/api';

export interface AuditLog {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  action: string;
  entityType?: string;
  entityId?: string;
  entityName?: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AuditStats {
  totalLogs: number;
  actionCounts: Array<{ action: string; _count: number }>;
  userCounts: Array<{ userId: string; _count: number }>;
}

class AuditLogService {
  // Verificar senha de acesso
  async verifyPassword(password: string): Promise<boolean> {
    try {
      const response = await api.post('/audit/verify-password', { password });
      return response.data.success;
    } catch (error: any) {
      console.error('Erro ao verificar senha:', error);
      throw error;
    }
  }

  // Listar logs com filtros
  async getLogs(filters?: {
    userId?: string;
    action?: string;
    entityType?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ logs: AuditLog[]; total: number }> {
    try {
      const response = await api.get('/audit/logs', { params: filters });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao listar logs:', error);
      throw error;
    }
  }

  // Obter estatísticas
  async getStats(startDate?: string, endDate?: string): Promise<AuditStats> {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await api.get('/audit/stats', { params });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao obter estatísticas:', error);
      throw error;
    }
  }

  // Exportar logs
  async exportLogs(filters?: {
    userId?: string;
    action?: string;
    entityType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ logs: AuditLog[]; total: number }> {
    try {
      const response = await api.get('/audit/export', { params: filters });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao exportar logs:', error);
      throw error;
    }
  }

  // Helper: Traduzir ações para português
  translateAction(action: string): string {
    const translations: Record<string, string> = {
      LOGIN: 'Login',
      LOGOUT: 'Logout',
      LOGIN_FAILED: 'Tentativa de Login Falhou',
      PASSWORD_RESET_REQUEST: 'Solicitação de Reset de Senha',
      PASSWORD_RESET_COMPLETE: 'Reset de Senha Completo',
      PASSWORD_CHANGE: 'Alteração de Senha',
      MOTORISTA_CREATE: 'Motorista Criado',
      MOTORISTA_UPDATE: 'Motorista Atualizado',
      MOTORISTA_DELETE: 'Motorista Excluído',
      DOCUMENTO_UPLOAD: 'Documento Enviado',
      DOCUMENTO_APROVAR: 'Documento Aprovado',
      DOCUMENTO_NEGAR: 'Documento Negado',
      DOCUMENTO_DOWNLOAD: 'Documento Baixado',
      DOCUMENTO_DELETE: 'Documento Excluído',
      CERTIFICADO_ENVIAR: 'Certificado Enviado',
      CERTIFICADO_DOWNLOAD: 'Certificado Baixado',
      USER_CREATE: 'Usuário Criado',
      USER_UPDATE: 'Usuário Atualizado',
      USER_DELETE: 'Usuário Excluído',
      SOLICITACAO_APROVAR: 'Solicitação Aprovada',
      SOLICITACAO_NEGAR: 'Solicitação Negada',
      CODIGO_SOLICITAR: 'Código Solicitado',
      CODIGO_ENVIAR: 'Código Enviado',
      AUDIT_ACCESS: 'Acesso aos Logs de Auditoria',
      AUDIT_EXPORT: 'Exportação de Logs',
      AUDIT_ACCESS_DENIED: 'Tentativa de Acesso Negada',
    };
    return translations[action] || action;
  }

  // Helper: Cor da badge por tipo de ação
  getActionColor(action: string): string {
    if (action.includes('CREATE') || action.includes('APROVAR') || action === 'LOGIN') {
      return 'green';
    }
    if (action.includes('DELETE') || action.includes('NEGAR') || action.includes('FAILED') || action.includes('DENIED')) {
      return 'red';
    }
    if (action.includes('UPDATE') || action.includes('ENVIAR')) {
      return 'blue';
    }
    if (action.includes('DOWNLOAD') || action.includes('EXPORT')) {
      return 'purple';
    }
    return 'gray';
  }
}

export default new AuditLogService();
