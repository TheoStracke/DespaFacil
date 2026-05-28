-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'DESPACHANTE');

-- CreateEnum
CREATE TYPE "CursoTipo" AS ENUM ('TAC', 'RT');

-- CreateEnum
CREATE TYPE "DocumentoTipo" AS ENUM ('CNH', 'COMPROVANTE_PAGAMENTO', 'DOCUMENTO1', 'DOCUMENTO2');

-- CreateEnum
CREATE TYPE "DocumentoStatus" AS ENUM ('PENDENTE', 'APROVADO', 'NEGADO');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cnpj" TEXT,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'DESPACHANTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Despachante" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Despachante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Motorista" (
    "id" TEXT NOT NULL,
    "despachanteId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "email" TEXT,
    "dataNascimento" TIMESTAMP(3),
    "sexo" TEXT,
    "identidade" TEXT,
    "orgaoEmissor" TEXT,
    "ufEmissor" TEXT,
    "telefone" TEXT,
    "cursoTipo" "CursoTipo" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Motorista_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Documento" (
    "id" TEXT NOT NULL,
    "motoristaId" TEXT NOT NULL,
    "tipo" "DocumentoTipo" NOT NULL,
    "filename" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mimetype" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "status" "DocumentoStatus" NOT NULL DEFAULT 'PENDENTE',
    "motivoNegacao" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "Documento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogDocumento" (
    "id" TEXT NOT NULL,
    "documentoId" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "adminId" TEXT,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogDocumento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_cnpj_key" ON "User"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "Despachante_userId_key" ON "Despachante"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Despachante_cnpj_key" ON "Despachante"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "Motorista_cpf_key" ON "Motorista"("cpf");

-- CreateIndex
CREATE INDEX "Motorista_despachanteId_idx" ON "Motorista"("despachanteId");

-- CreateIndex
CREATE INDEX "Motorista_cpf_idx" ON "Motorista"("cpf");

-- CreateIndex
CREATE INDEX "Documento_motoristaId_idx" ON "Documento"("motoristaId");

-- CreateIndex
CREATE INDEX "Documento_status_idx" ON "Documento"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Documento_motoristaId_tipo_key" ON "Documento"("motoristaId", "tipo");

-- CreateIndex
CREATE INDEX "LogDocumento_documentoId_idx" ON "LogDocumento"("documentoId");

-- AddForeignKey
ALTER TABLE "Despachante" ADD CONSTRAINT "Despachante_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Motorista" ADD CONSTRAINT "Motorista_despachanteId_fkey" FOREIGN KEY ("despachanteId") REFERENCES "Despachante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_motoristaId_fkey" FOREIGN KEY ("motoristaId") REFERENCES "Motorista"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogDocumento" ADD CONSTRAINT "LogDocumento_documentoId_fkey" FOREIGN KEY ("documentoId") REFERENCES "Documento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
