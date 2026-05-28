import api from '@/lib/api';
import { Motorista, MotoristaFormData, PaginatedResponse } from '@/types';

class MotoristaService {
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ motoristas: Motorista[]; pagination: { page: number; limit: number; total: number; pages: number } }> {
    const response = await api.get<{ success: boolean; motoristas: Motorista[]; pagination: any }>('/motoristas', { params });
    return {
      motoristas: response.data.motoristas || [],
      pagination: response.data.pagination || { page: 1, limit: 20, total: 0, pages: 0 }
    };
  }

  async getById(id: string): Promise<Motorista> {
    const response = await api.get<{ success: boolean; motorista: Motorista }>(`/motoristas/${id}`);
    return response.data.motorista;
  }

  async create(data: MotoristaFormData): Promise<Motorista> {
    const response = await api.post<{ success: boolean; motorista: Motorista }>('/motoristas', data);
    return response.data.motorista;
  }

  async update(id: string, data: Partial<MotoristaFormData>): Promise<Motorista> {
    const response = await api.put<{ success: boolean; motorista: Motorista }>(`/motoristas/${id}`, data);
    return response.data.motorista;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/motoristas/${id}`);
  }
}

export default new MotoristaService();
