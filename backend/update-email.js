const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateEmail() {
  try {
    const result = await prisma.user.updateMany({
      where: { email: 'teste@email.com' },
      data: { email: 'theostracke11@gmail.com' }
    });
    console.log('✅ Atualizado:', result.count, 'registro(s)');
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateEmail();
