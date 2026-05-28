// Use dynamic require to avoid TS compile errors when Prisma Client isn't generated yet
// and keep runtime working once it is generated.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const prismaPkg = require('@prisma/client');
const PrismaClient = prismaPkg?.PrismaClient || (class {} as any);
const prisma: any = new PrismaClient();

export default prisma;
