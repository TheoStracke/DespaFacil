const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetDatabase() {
  try {
    console.log('🗑️  Limpando banco de dados...\n');

    // 1. Deletar todos os dados (ordem importa por causa das foreign keys)
    console.log('Deletando certificados...');
    await prisma.certificado.deleteMany();
    
    console.log('Deletando logs de documentos...');
    await prisma.logDocumento.deleteMany();
    
    console.log('Deletando documentos...');
    await prisma.documento.deleteMany();
    
    console.log('Deletando motoristas...');
    await prisma.motorista.deleteMany();
    
    console.log('Deletando despachantes...');
    await prisma.despachante.deleteMany();
    
    console.log('Deletando solicitações de cadastro...');
    await prisma.solicitacaoCadastro.deleteMany();
    
    console.log('Deletando parceiros...');
    await prisma.parceiro.deleteMany();
    
    console.log('Deletando usuários...');
    await prisma.user.deleteMany();

    // 2. Limpar histórico de migrações problemáticas
    console.log('\nLimpando histórico de migrações problemáticas...');
    await prisma.$executeRaw`
      DELETE FROM "_prisma_migrations" 
      WHERE migration_name LIKE '%20251021%';
    `;

    console.log('\n✅ Banco de dados completamente limpo!');
    console.log('✅ Pronto para criar novos cadastros do zero.\n');
    console.log('ℹ️  Próximos passos:');
    console.log('   1. Faça o deploy no Railway');
    console.log('   2. Acesse o sistema e crie um novo usuário admin');
    console.log('   3. Tudo vai funcionar perfeitamente! 🎉\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();
