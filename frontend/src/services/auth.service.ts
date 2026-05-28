import api from '@/lib/api';
import { AuthResponse, LoginData, RegisterData, User, ApiResponse } from '@/types';

class AuthService {
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    
    if (response.data.success) {
      // Salvar token e usuário no localStorage
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    
    if (response.data.success) {
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'ADMIN';
  }

  async forgotPassword(email: string, captcha?: string): Promise<ApiResponse<null>> {
    const res = await api.post<ApiResponse<null>>('/auth/forgot-password', { email, captcha });
    return res.data;
  }

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<null>> {
    const res = await api.post<ApiResponse<null>>('/auth/reset-password', { token, newPassword });
    return res.data;
  }

  async getTourStatus(): Promise<boolean> {
    try {
      const res = await api.get<any>('/auth/tour-status');
      return res.data.tourVisto || false;
    } catch {
      return false;
    }
  }

  async markTourVisto(): Promise<void> {
    await api.post('/auth/mark-tour-visto');
  }
}

export default new AuthService();
