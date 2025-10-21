const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('👨‍💼 Criando usuário admin...\n');

    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    const admin = await prisma.user.create({
      data: {
        name: 'Administrador',
        email: 'admin@despafacil.com',
        password: hashedPassword,
        role: 'ADMIN',
        tourVisto: true,
        primeiroLogin: false
      }
    });

    console.log('✅ Usuário admin criado com sucesso!\n');
    console.log('📧 Email: admin@despafacil.com');
    console.log('🔑 Senha: Admin@123');
    console.log('\n⚠️  IMPORTANTE: Altere a senha após o primeiro login!\n');

  } catch (error) {
    if (error.code === 'P2002') {
      console.log('ℹ️  Usuário admin já existe!');
    } else {
      console.error('❌ Erro:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
