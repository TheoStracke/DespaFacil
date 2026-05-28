const { PrismaClient } = require('@prisma/client');

const DATABASE_URL = 'postgresql://postgres:DstaNPrlBwyMvuNGiWpsiMalMIqRyIcw@tramway.proxy.rlwy.net:52606/railway';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
});

async function checkAndFix() {
  try {
    console.log('🔍 Verificando estado do banco de dados...\n');

    // 1. Verificar tipos de enum no Postgres
    console.log('📋 Verificando enum DocumentoTipo no Postgres:');
    const enumValues = await prisma.$queryRaw`
      SELECT enumlabel 
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'DocumentoTipo'
      ORDER BY e.enumsortorder;
    `;
    
    console.log('Valores no enum:', enumValues.map(v => v.enumlabel));
    console.log('');

    // 2. Verificar documentos na tabela
    console.log('📄 Verificando documentos na tabela:');
    const docs = await prisma.$queryRaw`
      SELECT DISTINCT tipo FROM "Documento";
    `;
    
    console.log('Tipos usados nos documentos:', docs.map(d => d.tipo));
    console.log('');

    // 3. Verificar se precisa corrigir
    const hasNewValues = enumValues.some(v => v.enumlabel === 'LISTA_PRESENCA' || v.enumlabel === 'TABELA_DADOS');
    
    if (hasNewValues) {
      console.log('⚠️  PROBLEMA ENCONTRADO: O enum ainda contém LISTA_PRESENCA/TABELA_DADOS\n');
      console.log('🔧 Aplicando correção...\n');

      // Adicionar valores antigos se não existirem
      try {
        await prisma.$executeRaw`
          DO $$
          BEGIN
            BEGIN
              ALTER TYPE "DocumentoTipo" ADD VALUE IF NOT EXISTS 'DOCUMENTO1';
            EXCEPTION WHEN duplicate_object THEN NULL;
            END;
            BEGIN
              ALTER TYPE "DocumentoTipo" ADD VALUE IF NOT EXISTS 'DOCUMENTO2';
            EXCEPTION WHEN duplicate_object THEN NULL;
            END;
          END$$;
        `;
        console.log('✅ Valores DOCUMENTO1 e DOCUMENTO2 adicionados ao enum');
      } catch (e) {
        console.log('ℹ️  Valores DOCUMENTO1 e DOCUMENTO2 já existem');
      }

      // Migrar dados
      const updated1 = await prisma.$executeRaw`
        UPDATE "Documento" 
        SET tipo = 'DOCUMENTO1'::"DocumentoTipo" 
        WHERE tipo = 'LISTA_PRESENCA'::"DocumentoTipo";
      `;
      console.log(`✅ ${updated1} documentos migrados: LISTA_PRESENCA → DOCUMENTO1`);

      const updated2 = await prisma.$executeRaw`
        UPDATE "Documento" 
        SET tipo = 'DOCUMENTO2'::"DocumentoTipo" 
        WHERE tipo = 'TABELA_DADOS'::"DocumentoTipo";
      `;
      console.log(`✅ ${updated2} documentos migrados: TABELA_DADOS → DOCUMENTO2`);

      console.log('\n✅ Correção concluída! Os dados foram migrados.');
      console.log('ℹ️  Nota: Os labels LISTA_PRESENCA/TABELA_DADOS ainda existem no enum do Postgres,');
      console.log('   mas não são mais usados. Isso é normal e não causa problemas.\n');
    } else {
      console.log('✅ Banco de dados OK! Usando DOCUMENTO1 e DOCUMENTO2 corretamente.\n');
    }

    // Verificação final
    console.log('📊 Estado final:');
    const finalDocs = await prisma.$queryRaw`
      SELECT tipo, COUNT(*) as count 
      FROM "Documento" 
      GROUP BY tipo 
      ORDER BY tipo;
    `;
    
    console.table(finalDocs);

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndFix();
