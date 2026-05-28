import api from '@/lib/api'
import { ApiResponse, User } from '@/types'

export interface UpdateMePayload {
  name?: string
  email?: string
}

export async function getMe(): Promise<User> {
  const res = await api.get<ApiResponse<User>>('/users/me')
  return (res.data.data as User) || (res.data as any).user || (res.data as any)
}

export async function updateMe(data: UpdateMePayload): Promise<User> {
  const res = await api.patch<ApiResponse<User>>('/users/me', data)
  return (res.data.data as User) || (res.data as any).user || (res.data as any)
}
