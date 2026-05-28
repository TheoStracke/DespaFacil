const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
  console.log('\n🔍 Verificando usuários no banco...\n');
  
  // Buscar solicitações
  const solicitacoes = await prisma.solicitacaoCadastro.findMany({
    where: {
      cnpj: '98765432000110'
    }
  });
  
  console.log('📋 Solicitações encontradas:', solicitacoes.length);
  if (solicitacoes.length > 0) {
    console.log(JSON.stringify(solicitacoes, null, 2));
  }
  
  // Buscar usuário
  const users = await prisma.user.findMany({
    where: {
      cnpj: '98765432000110'
    }
  });
  
  console.log('\n👤 Usuários encontrados:', users.length);
  if (users.length > 0) {
    users.forEach(u => {
      console.log({
        id: u.id,
        name: u.name,
        email: u.email,
        cnpj: u.cnpj,
        role: u.role
      });
    });
  }
  
  // Buscar despachante
  const despachantes = await prisma.despachante.findMany({
    where: {
      cnpj: '98765432000110'
    }
  });
  
  console.log('\n🚛 Despachantes encontrados:', despachantes.length);
  if (despachantes.length > 0) {
    console.log(JSON.stringify(despachantes, null, 2));
  }
  
  await prisma.$disconnect();
}

checkUser().catch(console.error);
