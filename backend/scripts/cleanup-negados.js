// Apaga arquivos de documentos NEGADOS há mais de 3 dias
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');
const DAYS = 3;

async function main() {
  const cutoff = new Date(Date.now() - DAYS * 24 * 60 * 60 * 1000);
  const docs = await prisma.documento.findMany({
    where: {
      status: 'NEGADO',
      reviewedAt: { lte: cutoff },
    },
    select: { id: true, path: true, filename: true },
  });
  if (!docs.length) {
    console.log('Nenhum documento negado para apagar.');
    return;
  }
  let deleted = 0;
  for (const doc of docs) {
    if (doc.path && doc.path.startsWith(UPLOADS_DIR)) {
      try {
        if (fs.existsSync(doc.path)) {
          fs.unlinkSync(doc.path);
          deleted++;
          console.log(`Apagado: ${doc.filename}`);
        }
      } catch (e) {
        console.warn(`Erro ao apagar ${doc.filename}:`, e.message);
      }
    }
    // Opcional: remover registro do banco
    // await prisma.documento.delete({ where: { id: doc.id } });
  }
  console.log(`Total apagados: ${deleted}`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
