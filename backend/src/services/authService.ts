import prisma from '../prisma/client';
import bcrypt from 'bcryptjs';
import jwt, { type SignOptions, type Secret } from 'jsonwebtoken';
import { sendEmail } from '../utils/mailer';
import { validateCNPJ } from '../utils/validators';
import axios from 'axios';
import { getParceiroStatus } from './parceiroService';
import { notifyCadastroCriado, notifyPrimeiroLogin } from './emailService';
import { getAppUrl } from '../utils/appUrl';

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
const JWT_SECRET: Secret = (process.env.JWT_SECRET || 'secret') as Secret;
const JWT_EXPIRES_IN: SignOptions['expiresIn'] = (process.env.JWT_EXPIRES_IN || '1h') as SignOptions['expiresIn'];

interface RegisterData {
  name: string;
  email: string;
  cnpj?: string;
  telefone?: string;
  password: string;
  confirmPassword: string;
}

interface LoginData {
  emailOrCnpj: string;
  password: string;
}

export async function register(data: RegisterData) {
  const { name, email, cnpj, telefone, password, confirmPassword } = data;

  if (!email || !password || !name) {
    throw new Error('Campos obrigatórios: name, email, password');
  }

  if (password !== confirmPassword) {
    throw new Error('As senhas não coincidem');
  }

  if (password.length < 8) {
    throw new Error('A senha deve ter no mínimo 8 caracteres');
  }

  // CNPJ é obrigatório para cadastro de despachante e deve ser parceiro aprovado
  if (!cnpj) {
    throw new Error('CNPJ é obrigatório');
  }
  // Validação básica/algorítmica do CNPJ (pode ser ajustada conforme utilitário)
  // if (!validateCNPJ(cnpj)) {
  //   throw new Error('CNPJ inválido');
  // }

  // Checar status de parceiro: apenas PARCEIRO pode registrar
  const parceiro = await getParceiroStatus(cnpj);
  if (!parceiro.canRegister) {
    if (parceiro.status === 'LEAD') {
      throw new Error('CNPJ aguardando aprovação. Aguarde o contato do time.');
    }
    if (parceiro.status === 'REJEITADO') {
      throw new Error('CNPJ rejeitado. Entre em contato para mais informações.');
    }
    // NONE ou outros estados
    throw new Error('CNPJ não aprovado como parceiro. Solicite parceria antes de cadastrar.');
  }

  // Verificar se email já existe
  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    throw new Error('Email já cadastrado');
  }

  // Verificar se CNPJ já existe
  const existingCnpj = await prisma.user.findUnique({ where: { cnpj } });
  if (existingCnpj) {
    throw new Error('CNPJ já cadastrado');
  }

  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      cnpj,
      telefone,
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

  // Enviar e-mail de boas-vindas
  try {
    await notifyCadastroCriado(email, name);
  } catch (emailError) {
    console.error('❌ Erro ao enviar e-mail de boas-vindas:', emailError);
    // Não falha o cadastro se o e-mail falhar
  }

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

  // Removido envio de e-mail de primeiro login para acelerar o login

  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
  }

  const token = jwt.sign(
    { sub: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN } as SignOptions
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

export async function forgotPassword(email: string, captcha: string) {
  // Validação do hCaptcha server-side
  const secret = process.env.HCAPTCHA_SECRET;
  if (!captcha) throw new Error('Captcha obrigatório');
  if (!secret) throw new Error('hCaptcha secret não configurado');
  
  const verifyUrl = 'https://hcaptcha.com/siteverify';
  try {
    const verifyRes = await axios.post(
      verifyUrl,
      new URLSearchParams({ secret, response: captcha }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    
    console.log('[HCAPTCHA] Resposta:', verifyRes.data);
    
    if (!verifyRes.data.success) {
      console.error('[HCAPTCHA] Falha na validação:', verifyRes.data['error-codes']);
      throw new Error('Falha ao validar captcha. Tente novamente.');
    }
  } catch (error: any) {
    console.error('[HCAPTCHA] Erro na chamada:', error.message);
    if (error.response) {
      console.error('[HCAPTCHA] Status:', error.response.status);
      console.error('[HCAPTCHA] Data:', error.response.data);
    }
    throw new Error('Erro ao validar captcha. Tente novamente.');
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Não revelar se o email existe ou não
    return;
  }

  const resetToken = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '1h' } as SignOptions);

  await sendEmail({
    to: email,
    subject: 'Redefinição de senha - DespaFacil',
    html: `
      <h2>Redefinição de senha</h2>
      <p>Você solicitou a redefinição de senha.</p>
      <p>Clique no link abaixo para redefinir sua senha. Se você não solicitou, ignore este email.</p>
      <p>
        <a href="${getAppUrl()}/reset-password?token=${resetToken}" target="_blank" rel="noopener noreferrer">
          Redefinir minha senha
        </a>
      </p>
      <p>Este link expira em 1 hora.</p>
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

export async function markTourVisto(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    // @ts-ignore - prisma client types not regenerated yet
    data: { tourVisto: true },
  });
}

export async function getTourStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    // @ts-ignore - prisma client types not regenerated yet
    select: { tourVisto: true },
  });
  // @ts-ignore - prisma client types not regenerated yet
  return user?.tourVisto || false;
}
