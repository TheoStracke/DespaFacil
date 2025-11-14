import api from '@/lib/api';
import { Documento, DocumentoStatus, DocumentoTipo, PaginatedResponse } from '@/types';

class DocumentoService {
  async upload(motoristaId: string, tipo: DocumentoTipo, file: File): Promise<Documento> {
    console.log('📤 Upload iniciado:');
    console.log('  - Motorista ID:', motoristaId);
    console.log('  - Tipo:', tipo);
    console.log('  - Arquivo:', file.name, file.type, file.size, 'bytes');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('motoristaId', motoristaId);
    formData.append('tipo', tipo);

    console.log('📦 FormData criado:', {
      file: file.name,
      motoristaId,
      tipo
    });

    try {
      const response = await api.post<{ success: boolean; documento: Documento }>(
        '/documentos/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('✅ Upload sucesso:', response.data);
      return response.data.documento;
    } catch (error: any) {
      console.error('❌ Erro no upload:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }

  async getByMotorista(motoristaId: string): Promise<Documento[]> {
    const response = await api.get<{ success: boolean; documentos: Documento[] }>(
      `/motoristas/${motoristaId}/documentos`
    );
    return response.data.documentos;
  }

  async download(documentoId: string): Promise<Blob> {
    const response = await api.get(`/documentos/${documentoId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }

  async getViewUrl(documentoId: string): Promise<string> {
    try {
      // Para visualização inline, precisamos criar um blob URL com o conteúdo do documento
      const response = await api.get(`/documentos/${documentoId}/view`, {
        responseType: 'blob',
      });
      
      // Criar URL do blob para visualização
      const blob = response.data;
      
      // Verificar se recebemos um blob válido
      if (!(blob instanceof Blob)) {
        throw new Error('Resposta inválida do servidor');
      }
      
      return window.URL.createObjectURL(blob);
    } catch (error: any) {
      console.error('Erro ao obter URL de visualização:', error);
      throw new Error(error.response?.data?.error || 'Não foi possível carregar o documento');
    }
  }

  // Admin endpoints
  async getAllAdmin(params?: {
    page?: number;
    limit?: number;
    status?: DocumentoStatus;
    from?: string;
    to?: string;
  }): Promise<PaginatedResponse<Documento>> {
    const response = await api.get<PaginatedResponse<Documento>>('/admin/documentos', { params });
    return response.data;
  }

  async updateStatus(
    documentoId: string,
    status: DocumentoStatus,
    motivo?: string
  ): Promise<Documento> {
    const response = await api.put<{ success: boolean; documento: Documento }>(
      `/documentos/${documentoId}/status`,
      { status, motivo }
    );
    return response.data.documento;
  }

  async exportToExcel(params?: {
    status?: DocumentoStatus;
    from?: string;
    to?: string;
  }): Promise<Blob> {
    const response = await api.get('/admin/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  }

  async sendCertificado(file: File, motoristaSearch: string): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('motoristaSearch', motoristaSearch);

    await api.post('/admin/certificados/send', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Listar histórico de certificados (admin)
  async listCertificadosAdmin(): Promise<any[]> {
    const response = await api.get<{ success: boolean; certificados: any[] }>('/admin/certificados');
    return response.data.certificados;
  }

  // Baixar ZIP com todos documentos do motorista
  async downloadZipMotorista(motoristaId: string, motoristaNome: string): Promise<void> {
    const response = await api.get(`/admin/motoristas/${motoristaId}/documentos/zip`, {
      responseType: 'blob',
    });

    // Criar download do blob
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${motoristaNome}_documentos.zip`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
}

export default new DocumentoService();
