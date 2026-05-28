import api from '@/lib/api';

export type ParceiroStatus = 'NONE' | 'LEAD' | 'PARCEIRO' | 'REJEITADO';

export async function getStatus(cnpj: string): Promise<{ status: ParceiroStatus; canRegister: boolean; cooldownSeconds: number }>{
  const res = await api.get('/parceiros/status', { params: { cnpj } });
  return res.data;
}

export async function solicitar(data: { 
  cnpj: string; 
  empresa: string; 
  telefone: string; 
  email: string; 
  senha: string; 
  nomeResponsavel?: string; 
  mensagem?: string 
}) {
  const res = await api.post('/parceiros/solicitar', data);
  return res.data;
}
