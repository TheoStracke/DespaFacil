const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Populando originalName para documentos existentes...');

  // Buscar todos os documentos sem originalName
  const documentos = await prisma.documento.findMany({
    where: {
      originalName: null,
    },
  });

  console.log(`📊 Encontrados ${documentos.length} documentos sem originalName`);

  for (const doc of documentos) {
    // Usar o filename como fallback para originalName
    // Remove o timestamp do início do filename (formato: timestamp-originalname)
    let originalName = doc.filename;
    
    // Tentar extrair o nome original removendo o prefixo de timestamp
    const match = doc.filename.match(/^\d+-\d+-(.+)$/);
    if (match) {
      originalName = match[1];
    }

    await prisma.documento.update({
      where: { id: doc.id },
      data: { originalName },
    });

    console.log(`  ✅ ${doc.id}: ${originalName}`);
  }

  console.log('✨ Concluído!');
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
