-- CreateEnum
CREATE TYPE "ParceiroStatus" AS ENUM ('LEAD', 'PARCEIRO', 'REJEITADO');

-- CreateEnum
CREATE TYPE "SolicitacaoStatus" AS ENUM ('PENDENTE', 'APROVADO', 'REJEITADO');

-- CreateTable
CREATE TABLE "Parceiro" (
    "id" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "empresa" TEXT NOT NULL,
    "telefone" TEXT,
    "status" "ParceiroStatus" NOT NULL DEFAULT 'LEAD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Parceiro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolicitacaoCadastro" (
    "id" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "empresa" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mensagem" TEXT,
    "status" "SolicitacaoStatus" NOT NULL DEFAULT 'PENDENTE',
    "analisadoPor" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SolicitacaoCadastro_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Parceiro_cnpj_key" ON "Parceiro"("cnpj");

-- CreateIndex
CREATE INDEX "SolicitacaoCadastro_cnpj_createdAt_idx" ON "SolicitacaoCadastro"("cnpj", "createdAt");
