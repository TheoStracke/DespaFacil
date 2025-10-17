import api from '@/lib/api';

export interface Certificado {
  id: string;
  motoristaId: string;
  filename: string;
  originalName: string;
  path: string;
  mimetype: string;
  size: number;
  enviadoPor: string;
  enviadoEm: string;
  baixadoEm?: string;
  motorista: {
    id: string;
    nome: string;
    cpf: string;
    cursoTipo: string;
  };
}

class CertificadoService {
  async getAll(): Promise<Certificado[]> {
    const response = await api.get<{ success: boolean; certificados: Certificado[] }>('/certificados');
    return response.data.certificados;
  }

  async download(certificadoId: string): Promise<Blob> {
    const response = await api.get(`/certificados/${certificadoId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }
}

export default new CertificadoService();
