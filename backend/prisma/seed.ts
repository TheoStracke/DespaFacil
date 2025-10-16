import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'SenhaForte123!';
  const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

  // Criar admins
  const admins = [
    { email: 'theostracke11@gmail.com', name: 'Theo Stracke' },
    { email: 'pleuskick@gmail.com', name: 'Pleu Kick' },
  ];

  for (const admin of admins) {
    const existing = await prisma.user.findUnique({ where: { email: admin.email } });
    if (!existing) {
      await prisma.user.create({
        data: {
          name: admin.name,
          email: admin.email,
          password: hashedPassword,
          role: 'ADMIN',
        },
      });
      console.log(`✅ Admin criado: ${admin.email}`);
    } else {
      console.log(`ℹ️  Admin já existe: ${admin.email}`);
    }
  }

  // Criar despachante de teste
  const despachanteEmail = 'despachante@test.local';
  let despachanteUser = await prisma.user.findUnique({ where: { email: despachanteEmail } });

  if (!despachanteUser) {
    despachanteUser = await prisma.user.create({
      data: {
        name: 'Despachante Teste',
        email: despachanteEmail,
        cnpj: '00000000000191',
        password: hashedPassword,
        role: 'DESPACHANTE',
      },
    });

    await prisma.despachante.create({
      data: {
        userId: despachanteUser.id,
        nome: 'Despachante Teste Ltda',
        cnpj: '00000000000191',
      },
    });

    console.log(`✅ Despachante criado: ${despachanteEmail}`);
  } else {
    console.log(`ℹ️  Despachante já existe: ${despachanteEmail}`);
  }

  // Criar motorista de teste
  const despachante = await prisma.despachante.findFirst();
  if (despachante) {
    const motoristaExisting = await prisma.motorista.findUnique({ where: { cpf: '12345678909' } });
    if (!motoristaExisting) {
      await prisma.motorista.create({
        data: {
          despachanteId: despachante.id,
          nome: 'João da Silva',
          cpf: '12345678909',
          email: 'joao@test.local',
          telefone: '11999999999',
          cursoTipo: 'TAC',
        },
      });
      console.log(`✅ Motorista de teste criado`);
    } else {
      console.log(`ℹ️  Motorista de teste já existe`);
    }
  }

  console.log('');
  console.log('✅ Seed concluído!');
  console.log('');
  console.log('📋 Credenciais de acesso:');
  console.log('');
  console.log('👤 Admins:');
  console.log(`   - theostracke11@gmail.com / ${adminPassword}`);
  console.log(`   - pleuskick@gmail.com / ${adminPassword}`);
  console.log('');
  console.log('👤 Despachante de teste:');
  console.log(`   - ${despachanteEmail} / ${adminPassword}`);
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
