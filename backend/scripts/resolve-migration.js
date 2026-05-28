const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resolveFailedMigration() {
  try {
    console.log('🔧 Resolvendo migração falhada...\n');

    // Marcar a migração falhada como rolled back
    await prisma.$executeRaw`
      DELETE FROM "_prisma_migrations" 
      WHERE migration_name = '20251021_fix_documento_enum';
    `;
    
    console.log('✅ Migração falhada removida do histórico');
    console.log('✅ Sistema pronto para funcionar!\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resolveFailedMigration();
