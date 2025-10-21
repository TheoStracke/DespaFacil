const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function recreateTables() {
  try {
    console.log('🔨 Recriando estrutura do banco de dados...\n');

    // 1. Dropar todas as tabelas na ordem correta (por causa das foreign keys)
    console.log('Dropando tabelas antigas...');
    
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "Certificado" CASCADE;`);
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "LogDocumento" CASCADE;`);
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "Documento" CASCADE;`);
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "Motorista" CASCADE;`);
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "Despachante" CASCADE;`);
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "SolicitacaoCadastro" CASCADE;`);
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "Parceiro" CASCADE;`);
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "User" CASCADE;`);
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;`);

    // 2. Dropar enums antigos
    console.log('Dropando enums antigos...');
    await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "DocumentoTipo" CASCADE;`);
    await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "DocumentoStatus" CASCADE;`);
    await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "Role" CASCADE;`);
    await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "CursoTipo" CASCADE;`);
    await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "ParceiroStatus" CASCADE;`);
    await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "SolicitacaoStatus" CASCADE;`);

    console.log('✅ Tabelas e enums antigos removidos\n');
    console.log('⏳ Agora execute: npx prisma migrate deploy\n');
    console.log('Isso vai recriar tudo do zero com a estrutura correta! 🎉\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

recreateTables();
