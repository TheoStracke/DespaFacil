const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetTour() {
  const email = process.argv[2];
  
  if (!email) {
    console.error('❌ Erro: Informe o email do usuário');
    console.log('Uso: node reset-tour.js email@example.com');
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`❌ Usuário com email ${email} não encontrado`);
      process.exit(1);
    }

    await prisma.user.update({
      where: { email },
      data: { tourVisto: false },
    });

    console.log(`✅ Tour resetado para o usuário: ${user.name} (${email})`);
    console.log('🎯 O tour será exibido no próximo login!');
  } catch (error) {
    console.error('❌ Erro ao resetar tour:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetTour();
