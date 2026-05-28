import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
  
  // Senhas específicas para cada admin
  const vellumPassword = 'Vellum@25';
  const estradaFacilPassword = 'estradaFacil@25';
  
  const hashedVellumPassword = await bcrypt.hash(vellumPassword, saltRounds);
  const hashedEstradaFacilPassword = await bcrypt.hash(estradaFacilPassword, saltRounds);

  // Criar admins com CNPJs
  const admins = [
    { 
      name: 'Rede Vellum', 
      cnpj: '43403910000128', 
      email: 'vellum@admin.local',
      password: hashedVellumPassword 
    },
    { 
      name: 'Estrada Fácil', 
      cnpj: '20692051000139', 
      email: 'estradafacil@admin.local',
      password: hashedEstradaFacilPassword 
    },
  ];

  for (const admin of admins) {
    const existing = await prisma.user.findUnique({ where: { cnpj: admin.cnpj } });
    if (!existing) {
      await prisma.user.create({
        data: {
          name: admin.name,
          email: admin.email,
          cnpj: admin.cnpj,
          password: admin.password,
          role: 'ADMIN',
        },
      });
      console.log(`✅ Admin criado: ${admin.name} (CNPJ: ${admin.cnpj})`);
    } else {
      console.log(`ℹ️  Admin já existe: ${admin.name}`);
    }
  }

  // Criar despachante de teste
  const despachanteEmail = 'despachante@test.local';
  const despachantePassword = 'SenhaForte123!';
  const hashedDespachantePassword = await bcrypt.hash(despachantePassword, saltRounds);
  
  let despachanteUser = await prisma.user.findUnique({ where: { email: despachanteEmail } });

  if (!despachanteUser) {
    despachanteUser = await prisma.user.create({
      data: {
        name: 'Despachante Teste',
        email: despachanteEmail,
        cnpj: '00000000000191',
        password: hashedDespachantePassword,
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
  console.log(`   - Rede Vellum (CNPJ: 43.403.910/0001-28) / ${vellumPassword}`);
  console.log(`   - Estrada Fácil (CNPJ: 20.692.051/0001-39) / ${estradaFacilPassword}`);
  console.log('');
  console.log('👤 Despachante de teste:');
  console.log(`   - ${despachanteEmail} / ${despachantePassword}`);
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
