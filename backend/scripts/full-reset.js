const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fullReset() {
  try {
    console.log('🔥 RESET COMPLETO DO BANCO DE DADOS\n');
    console.log('⚠️  Isso vai APAGAR TUDO e recriar do zero!\n');

    // PASSO 1: Dropar TODAS as tabelas
    console.log('1️⃣  Dropando todas as tabelas...');
    
    const tables = [
      'Certificado',
      'LogDocumento', 
      'Documento',
      'Motorista',
      'Despachante',
      'SolicitacaoCadastro',
      'Parceiro',
      'User',
      '_prisma_migrations'
    ];

    for (const table of tables) {
      try {
        await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "${table}" CASCADE;`);
        console.log(`   ✅ Tabela ${table} removida`);
      } catch (e) {
        console.log(`   ℹ️  Tabela ${table} não existe`);
      }
    }

    // PASSO 2: Dropar TODOS os enums
    console.log('\n2️⃣  Dropando todos os enums...');
    
    const enums = [
      'DocumentoTipo',
      'DocumentoStatus',
      'Role',
      'CursoTipo',
      'ParceiroStatus',
      'SolicitacaoStatus'
    ];

    for (const enumType of enums) {
      try {
        await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "${enumType}" CASCADE;`);
        console.log(`   ✅ Enum ${enumType} removido`);
      } catch (e) {
        console.log(`   ℹ️  Enum ${enumType} não existe`);
      }
    }

    await prisma.$disconnect();

    // PASSO 3: Recriar tudo via Prisma
    console.log('\n3️⃣  Recriando estrutura do banco...');
    console.log('   Executando: prisma migrate deploy\n');
    
    try {
      execSync('npx prisma migrate deploy', { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      console.log('\n   ✅ Estrutura recriada com sucesso!');
    } catch (e) {
      console.log('\n   ⚠️  Prisma migrate falhou, tentando db push...');
      execSync('npx prisma db push --force-reset', { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      console.log('\n   ✅ Estrutura recriada com db push!');
    }

    // PASSO 4: Criar usuário admin
    console.log('\n4️⃣  Criando usuário administrador...');
    
    const prismaNew = new PrismaClient();
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    await prismaNew.user.create({
      data: {
        name: 'Administrador',
        email: 'admin@despafacil.com',
        password: hashedPassword,
        role: 'ADMIN',
        tourVisto: true,
        primeiroLogin: false
      }
    });

    console.log('   ✅ Admin criado!');
    await prismaNew.$disconnect();

    // RESUMO FINAL
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 RESET COMPLETO FINALIZADO COM SUCESSO!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ Banco de dados completamente limpo');
    console.log('✅ Estrutura recriada do zero');
    console.log('✅ Enums corretos: DOCUMENTO1, DOCUMENTO2');
    console.log('✅ Usuário admin criado\n');
    console.log('📧 Email: admin@despafacil.com');
    console.log('🔑 Senha: Admin@123\n');
    console.log('🚀 Próximo passo: Fazer deploy no Railway!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    console.error(error);
  }
}

fullReset();
