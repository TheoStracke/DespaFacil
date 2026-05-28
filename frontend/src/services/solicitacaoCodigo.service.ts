import api from '../lib/api';

export interface SolicitacaoCodigo {
  id: string;
  motoristaId: string;
  emailDestino: string;
  observacao?: string;
  codigo?: string;
  status: 'PENDENTE' | 'ENVIADO' | 'CANCELADO';
  solicitadoPor: string;
  solicitadoEm: string;
  enviadoEm?: string;
  motorista?: {
    id: string;
    nome: string;
    cpf: string;
    cursoTipo: string;
    email?: string;
  };
}

export interface CreateSolicitacaoData {
  motoristaId: string;
  emailDestino?: string;
  observacao?: string;
}

export interface EnviarCodigoData {
  codigo: string;
}

class SolicitacaoCodigoService {
  // ADMIN: Criar nova solicitação
  async create(data: CreateSolicitacaoData): Promise<SolicitacaoCodigo> {
    const response = await api.post('/admin/solicitacoes-codigo', data);
    return response.data;
  }

  // ADMIN: Listar todas solicitações
  async listAll(status?: string): Promise<SolicitacaoCodigo[]> {
    const params = status ? { status } : {};
    const response = await api.get('/admin/solicitacoes-codigo', { params });
    return response.data.solicitacoes || [];
  }

  // ADMIN: Cancelar solicitação
  async cancel(id: string): Promise<void> {
    await api.delete(`/admin/solicitacoes-codigo/${id}`);
  }

  // DESPACHANTE: Listar solicitações pendentes
  async listPendentes(): Promise<SolicitacaoCodigo[]> {
    const response = await api.get('/solicitacoes-codigo');
    return response.data.solicitacoes || [];
  }

  // DESPACHANTE: Enviar código
  async enviarCodigo(id: string, data: EnviarCodigoData): Promise<SolicitacaoCodigo> {
    const response = await api.post(`/solicitacoes-codigo/${id}/enviar-codigo`, data);
    return response.data;
  }
}

export default new SolicitacaoCodigoService();
