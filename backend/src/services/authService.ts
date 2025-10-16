import prisma from '../prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../utils/mailer';
import { validateCNPJ } from '../utils/validators';

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
const JWT_SECRET: string = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '1h';

interface RegisterData {
  name: string;
  email: string;
  cnpj?: string;
  password: string;
  confirmPassword: string;
}

interface LoginData {
  emailOrCnpj: string;
  password: string;
}

export async function register(data: RegisterData) {
  const { name, email, cnpj, password, confirmPassword } = data;

  if (!email || !password || !name) {
    throw new Error('Campos obrigatórios: name, email, password');
  }

  if (password !== confirmPassword) {
    throw new Error('As senhas não coincidem');
  }

  if (password.length < 8) {
    throw new Error('A senha deve ter no mínimo 8 caracteres');
  }

  // Validar CNPJ se fornecido (temporariamente desabilitado)
  // if (cnpj && !validateCNPJ(cnpj)) {
  //   throw new Error('CNPJ inválido');
  // }

  // Verificar se email já existe
  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    throw new Error('Email já cadastrado');
  }

  // Verificar se CNPJ já existe
  if (cnpj) {
    const existingCnpj = await prisma.user.findUnique({ where: { cnpj } });
    if (existingCnpj) {
      throw new Error('CNPJ já cadastrado');
    }
  }

  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      cnpj,
      password: hashedPassword,
      role: 'DESPACHANTE',
    },
  });

  // Sempre criar registro de Despachante para role DESPACHANTE
  await prisma.despachante.create({
    data: {
      userId: user.id,
      nome: name,
      cnpj: cnpj || null, // CNPJ pode ser opcional
    },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function login(data: LoginData) {
  const { emailOrCnpj, password } = data;

  if (!emailOrCnpj || !password) {
    throw new Error('Email/CNPJ e senha são obrigatórios');
  }

  // Buscar por email ou CNPJ
  let user = await prisma.user.findUnique({ where: { email: emailOrCnpj } });
  
  if (!user && emailOrCnpj.replace(/\D/g, '').length === 14) {
    user = await prisma.user.findUnique({ where: { cnpj: emailOrCnpj.replace(/\D/g, '') } });
  }

  if (!user) {
    throw new Error('Credenciais inválidas');
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    throw new Error('Credenciais inválidas');
  }

  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
  }

  const token = jwt.sign(
    { sub: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    accessToken: token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    // Não revelar se o email existe ou não
    return;
  }

  const resetToken = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '1h' });

  await sendEmail({
    to: email,
    subject: 'Redefinição de senha - DespaFacil',
    html: `
      <h2>Redefinição de senha</h2>
      <p>Você solicitou a redefinição de senha.</p>
      <p>Use o token abaixo para redefinir sua senha:</p>
      <p><strong>${resetToken}</strong></p>
      <p>Este token expira em 1 hora.</p>
    `,
  });
}

export async function resetPassword(token: string, newPassword: string) {
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.sub;

    if (newPassword.length < 8) {
      throw new Error('A senha deve ter no mínimo 8 caracteres');
    }

    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  } catch (err) {
    throw new Error('Token inválido ou expirado');
  }
}
