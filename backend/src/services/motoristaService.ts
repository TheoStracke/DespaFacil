import prisma from '../prisma/client';
import { validateCPF } from '../utils/validators';

export async function createMotorista(data: any, userId: string) {
  const despachante = await prisma.despachante.findUnique({ where: { userId } });
  if (!despachante) {
    throw new Error('Despachante não encontrado');
  }

  const { nome, cpf, email, dataNascimento, sexo, identidade, orgaoEmissor, ufEmissor, telefone, cursoTipo } = data;

  if (!nome || !cpf || !cursoTipo) {
    throw new Error('Campos obrigatórios: nome, cpf, cursoTipo');
  }

  if (!validateCPF(cpf)) {
    throw new Error('CPF inválido');
  }

  const existingCpf = await prisma.motorista.findUnique({ where: { cpf: cpf.replace(/\D/g, '') } });
  if (existingCpf) {
    throw new Error('CPF já cadastrado');
  }

  const motorista = await prisma.motorista.create({
    data: {
      despachanteId: despachante.id,
      nome,
      cpf: cpf.replace(/\D/g, ''),
      email,
      dataNascimento: dataNascimento ? new Date(dataNascimento) : null,
      sexo,
      identidade,
      orgaoEmissor,
      ufEmissor,
      telefone,
      cursoTipo,
    },
  });

  return motorista;
}

export async function listMotoristas(userId: string, role: string, filters: any) {
  const { search, despachanteId, page = 1, limit = 20 } = filters;

  const where: any = {};

  if (role === 'DESPACHANTE') {
    const despachante = await prisma.despachante.findUnique({ where: { userId } });
    if (!despachante) throw new Error('Despachante não encontrado');
    where.despachanteId = despachante.id;
  } else if (role === 'ADMIN' && despachanteId) {
    where.despachanteId = despachanteId;
  }

  if (search) {
    where.OR = [
      { nome: { contains: search, mode: 'insensitive' } },
      { cpf: { contains: search.replace(/\D/g, '') } },
    ];
  }

  const skip = (page - 1) * limit;

  const [motoristas, total] = await Promise.all([
    prisma.motorista.findMany({
      where,
      skip,
      take: limit,
      include: {
        despachante: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        documentos: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.motorista.count({ where }),
  ]);

  return {
    motoristas,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

export async function getMotoristaById(id: string, userId: string, role: string) {
  const motorista = await prisma.motorista.findUnique({
    where: { id },
    include: {
      despachante: {
        include: {
          user: { select: { name: true, email: true } },
        },
      },
      documentos: {
        include: {
          logs: {
            orderBy: { createdAt: 'desc' },
          },
        },
      },
    },
  });

  if (!motorista) {
    throw new Error('Motorista não encontrado');
  }

  // Verificar permissão
  if (role === 'DESPACHANTE') {
    const despachante = await prisma.despachante.findUnique({ where: { userId } });
    if (!despachante || motorista.despachanteId !== despachante.id) {
      throw new Error('Acesso negado');
    }
  }

  return motorista;
}

export async function updateMotorista(id: string, data: any, userId: string, role: string) {
  const motorista = await prisma.motorista.findUnique({ where: { id } });
  if (!motorista) {
    throw new Error('Motorista não encontrado');
  }

  // Verificar permissão
  if (role === 'DESPACHANTE') {
    const despachante = await prisma.despachante.findUnique({ where: { userId } });
    if (!despachante || motorista.despachanteId !== despachante.id) {
      throw new Error('Acesso negado');
    }
  }

  const updated = await prisma.motorista.update({
    where: { id },
    data: {
      nome: data.nome,
      email: data.email,
      dataNascimento: data.dataNascimento ? new Date(data.dataNascimento) : undefined,
      sexo: data.sexo,
      identidade: data.identidade,
      orgaoEmissor: data.orgaoEmissor,
      ufEmissor: data.ufEmissor,
      telefone: data.telefone,
      cursoTipo: data.cursoTipo,
    },
  });

  return updated;
}

export async function deleteMotorista(id: string, userId: string, role: string) {
  const motorista = await prisma.motorista.findUnique({ where: { id } });
  if (!motorista) {
    throw new Error('Motorista não encontrado');
  }

  // Verificar permissão (apenas despachante dono)
  if (role === 'DESPACHANTE') {
    const despachante = await prisma.despachante.findUnique({ where: { userId } });
    if (!despachante || motorista.despachanteId !== despachante.id) {
      throw new Error('Acesso negado');
    }
  }

  await prisma.motorista.delete({ where: { id } });
}
