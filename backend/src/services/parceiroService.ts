import prisma from '../prisma/client';
import bcrypt from 'bcryptjs';
import { notifySolicitacaoCadastro, notifyAdminNovaSolicitacao, notifySolicitacaoAprovada, notifySolicitacaoNegada } from './emailService';

const DAY_MS = 24 * 60 * 60 * 1000;
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);

function onlyDigits(v: string) {
  return (v || '').replace(/\D/g, '');
}

function isValidCnpj(cnpj: string) {
  const s = onlyDigits(cnpj);
  return s.length === 14; // validação básica; pode-se substituir por validação completa
}

export async function getParceiroStatus(cnpjRaw: string) {
  const cnpj = onlyDigits(cnpjRaw);
  const parceiro = await (prisma as any).parceiro.findUnique({ where: { cnpj } });

  const last = await (prisma as any).solicitacaoCadastro.findFirst({
    where: { cnpj },
    orderBy: { createdAt: 'desc' },
  });

  let cooldownSeconds = 0;
  if (last) {
    const diff = Date.now() - last.createdAt.getTime();
    const remain = DAY_MS - diff;
    cooldownSeconds = remain > 0 ? Math.ceil(remain / 1000) : 0;
  }

  if (!parceiro) return { status: 'NONE' as const, canRegister: false, cooldownSeconds };
  if (parceiro.status === 'PARCEIRO') return { status: 'PARCEIRO' as const, canRegister: true, cooldownSeconds: 0 };
  if (parceiro.status === 'LEAD') return { status: 'LEAD' as const, canRegister: false, cooldownSeconds };
  return { status: 'REJEITADO' as const, canRegister: false, cooldownSeconds };
}

export async function solicitarParceria(input: { cnpj: string; empresa: string; telefone: string; email: string; senha: string; nomeResponsavel?: string; mensagem?: string }) {
  const cnpj = onlyDigits(input.cnpj);
  if (!isValidCnpj(cnpj)) return { ok: false, error: 'CNPJ_INVALIDO' as const };

  // Validar senha
  if (!input.senha || input.senha.length < 8) {
    return { ok: false, error: 'SENHA_MINIMO_8' as const };
  }

  // Verificar se email já existe
  const existingEmail = await prisma.user.findUnique({ where: { email: input.email } });
  if (existingEmail) {
    return { ok: false, error: 'EMAIL_JA_CADASTRADO' as const };
  }

  // Verificar se CNPJ já possui usuário
  const existingCnpj = await prisma.user.findUnique({ where: { cnpj } });
  if (existingCnpj) {
    return { ok: false, error: 'CNPJ_JA_CADASTRADO' as const };
  }

  const last = await (prisma as any).solicitacaoCadastro.findFirst({
    where: { cnpj },
    orderBy: { createdAt: 'desc' },
  });
  if (last) {
    const diff = Date.now() - last.createdAt.getTime();
    if (diff < DAY_MS) {
      return { ok: false, error: 'AGUARDE_24H' as const, cooldownSeconds: Math.ceil((DAY_MS - diff) / 1000) };
    }
  }

  // Hash da senha
  const hashedPassword = await bcrypt.hash(input.senha, BCRYPT_ROUNDS);

  await (prisma as any).parceiro.upsert({
    where: { cnpj },
    update: { empresa: input.empresa, telefone: input.telefone, status: 'LEAD' as any },
    create: { cnpj, empresa: input.empresa, telefone: input.telefone, status: 'LEAD' as any },
  });

  const solicitacao = await (prisma as any).solicitacaoCadastro.create({
    data: {
      cnpj,
      empresa: input.empresa,
      telefone: input.telefone,
      email: input.email,
      senha: hashedPassword,
      nomeResponsavel: input.nomeResponsavel,
      mensagem: input.mensagem,
      status: 'PENDENTE' as any,
    },
  });

  // Enviar e-mails de notificação
  try {
    // E-mail para o usuário confirmando recebimento
    notifySolicitacaoCadastro(input.email, input.nomeResponsavel || input.empresa)
      .catch(err => console.error('Erro ao enviar e-mail ao usuário:', err));
    // E-mail para o admin notificando nova solicitação
    notifyAdminNovaSolicitacao({
      empresa: input.empresa,
      cnpj,
      email: input.email,
      telefone: input.telefone,
      nomeResponsavel: input.nomeResponsavel || 'Não informado',
      mensagem: input.mensagem,
    }).catch(err => console.error('Erro ao enviar e-mail ao admin:', err));
  } catch (emailError) {
    console.error('❌ Erro ao disparar e-mails:', emailError);
    // Não falha a solicitação se o e-mail falhar
  }

  return { ok: true, solicitacaoId: solicitacao.id };
}

export async function listarSolicitacoes(status?: 'PENDENTE' | 'APROVADO' | 'REJEITADO') {
  return (prisma as any).solicitacaoCadastro.findMany({ where: status ? { status } : undefined, orderBy: { createdAt: 'desc' } });
}

export async function aprovarSolicitacao(id: string, adminId?: string) {
  const s = await (prisma as any).solicitacaoCadastro.findUnique({ where: { id } });
  if (!s) throw new Error('Solicitação não encontrada');
  
  // Atualizar status da solicitação
  await (prisma as any).solicitacaoCadastro.update({ 
    where: { id }, 
    data: { status: 'APROVADO' as any, analisadoPor: adminId } 
  });
  
  // Atualizar status do parceiro
  await (prisma as any).parceiro.update({ 
    where: { cnpj: s.cnpj }, 
    data: { status: 'PARCEIRO' as any } 
  });

  // Criar usuário e despachante automaticamente
  try {
    // Verificar se já existe usuário com esse email ou CNPJ
    const existingEmail = await prisma.user.findUnique({ where: { email: s.email } });
    const existingCnpj = await prisma.user.findUnique({ where: { cnpj: s.cnpj } });

    if (!existingEmail && !existingCnpj) {
      const user = await prisma.user.create({
        data: {
          name: s.nomeResponsavel || s.empresa,
          email: s.email,
          cnpj: s.cnpj,
          password: s.senha, // Já está com hash
          role: 'DESPACHANTE',
        },
      });

      // Criar registro de Despachante
      await prisma.despachante.create({
        data: {
          userId: user.id,
          nome: s.empresa,
          cnpj: s.cnpj,
        },
      });

      console.log(`✅ Usuário criado automaticamente: ${s.email}`);
    } else {
      console.log(`ℹ️ Usuário já existe para email ou CNPJ: ${s.email}`);
    }
  } catch (error) {
    console.error('❌ Erro ao criar usuário automaticamente:', error);
    // Não falhar a aprovação se houver erro na criação do usuário
  }

  // Enviar e-mail de aprovação
  try {
    await notifySolicitacaoAprovada(s.email, s.nomeResponsavel || s.empresa);
  } catch (emailError) {
    console.error('❌ Erro ao enviar e-mail de aprovação:', emailError);
  }

  return { ok: true };
}

export async function rejeitarSolicitacao(id: string, observacoes?: string, adminId?: string) {
  const s = await (prisma as any).solicitacaoCadastro.update({ 
    where: { id }, 
    data: { 
      status: 'REJEITADO' as any, 
      observacoes: observacoes || 'Sua solicitação foi rejeitada. Você poderá solicitar novamente após 24 horas.', 
      analisadoPor: adminId 
    } 
  });
  await (prisma as any).parceiro.updateMany({ where: { cnpj: s.cnpj }, data: { status: 'REJEITADO' as any } });
  
  // Enviar e-mail de rejeição
  try {
    await notifySolicitacaoNegada(s.email, s.nomeResponsavel || s.empresa, observacoes);
  } catch (emailError) {
    console.error('❌ Erro ao enviar e-mail de rejeição:', emailError);
  }
  
  return { ok: true, message: 'Solicitação rejeitada. O usuário poderá tentar novamente após 24 horas.' };
}
