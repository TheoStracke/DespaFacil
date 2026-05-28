const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function testLogin() {
  console.log('\n🔐 Testando login...\n');
  
  const emailOrCnpj = '98.765.432/0001-10';
  const password = 'SenhaForte123!';
  
  console.log('Input CNPJ:', emailOrCnpj);
  const cleanCnpj = emailOrCnpj.replace(/\D/g, '');
  console.log('CNPJ limpo:', cleanCnpj);
  console.log('Tamanho:', cleanCnpj.length);
  
  // Buscar por email
  let user = await prisma.user.findUnique({ where: { email: emailOrCnpj } });
  console.log('Busca por email:', user ? 'Encontrado' : 'Não encontrado');
  
  // Buscar por CNPJ
  if (!user && cleanCnpj.length === 14) {
    console.log('Tentando buscar por CNPJ:', cleanCnpj);
    user = await prisma.user.findUnique({ where: { cnpj: cleanCnpj } });
    console.log('Busca por CNPJ:', user ? 'Encontrado' : 'Não encontrado');
  }
  
  if (user) {
    console.log('\n✅ Usuário encontrado:');
    console.log({
      id: user.id,
      name: user.name,
      email: user.email,
      cnpj: user.cnpj,
      role: user.role
    });
    
    // Testar senha
    const validPassword = await bcrypt.compare(password, user.password);
    console.log('\n🔑 Senha válida:', validPassword ? 'SIM ✅' : 'NÃO ❌');
  } else {
    console.log('\n❌ Usuário não encontrado!');
  }
  
  await prisma.$disconnect();
}

testLogin().catch(console.error);
