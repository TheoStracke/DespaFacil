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
}

export default new DocumentoService();
