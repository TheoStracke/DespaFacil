require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'suporte@redevellum.com.br';
  const senha = '@FaMx1WxXoYovx31';
  const nome = 'Suporte Rede Vellum';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('ℹ️  Usuário já existe:', email);
    await prisma.$disconnect();
    return;
  }

  const hashed = await bcrypt.hash(senha, 12);

  const user = await prisma.user.create({
    data: {
      name: nome,
      email,
      password: hashed,
      role: 'ADMIN',
      tourVisto: true,
      primeiroLogin: false,
    },
  });

  console.log('✅ Admin criado com sucesso!');
  console.log('📧 Email:', user.email);
  console.log('🔑 Senha:', senha);
  console.log('🆔 ID:', user.id);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('❌ Erro:', e.message);
  process.exit(1);
});
