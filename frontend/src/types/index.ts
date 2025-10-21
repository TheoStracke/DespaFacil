// Tipos de usuário
export type UserRole = 'ADMIN' | 'DESPACHANTE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  cnpj?: string;
}

export interface AuthResponse {
  success: boolean;
  accessToken: string;
  user: User;
}

// Tipos de documento
export type DocumentoTipo = 'CNH' | 'COMPROVANTE_PAGAMENTO' | 'LISTA_PRESENCA' | 'TABELA_DADOS';
export type DocumentoStatus = 'PENDENTE' | 'APROVADO' | 'NEGADO';

export interface Documento {
  id: string;
  motoristaId: string;
  tipo: DocumentoTipo;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  status: DocumentoStatus;
  motivo?: string;
  uploadedAt: string;
  updatedAt: string;
  motorista?: {
    id: string;
    nome: string;
    cpf: string;
  };
}

// Tipos de motorista
export type CursoTipo = 'TAC' | 'RT';
export type Sexo = 'M' | 'F';

export interface Motorista {
  id: string;
  nome: string;
  cpf: string;
  email?: string;
  telefone?: string;
  dataNascimento?: string;
  sexo?: Sexo;
  identidade?: string;
  orgaoEmissor?: string;
  ufEmissor?: string;
  cursoTipo: CursoTipo;
  despachanteId: string;
  createdAt: string;
  updatedAt: string;
  documentos?: Documento[];
}

export interface MotoristaFormData {
  nome: string;
  cpf: string;
  email?: string;
  telefone?: string;
  dataNascimento?: string;
  sexo?: Sexo;
  identidade?: string;
  orgaoEmissor?: string;
  ufEmissor?: string;
  cursoTipo: CursoTipo;
}

// Paginação
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Respostas da API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  motoristas?: T[]; // Para /motoristas
  documentos?: T[]; // Para /documentos
  data?: T[]; // Fallback genérico
  pagination: Pagination;
}

// Login/Register
export interface LoginData {
  emailOrCnpj: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  cnpj?: string;
  password: string;
  confirmPassword: string;
}
