-- CreateEnum
CREATE TYPE "SolicitacaoCodigoStatus" AS ENUM ('PENDENTE', 'ENVIADO', 'CANCELADO');

-- CreateTable
CREATE TABLE "SolicitacaoCodigo" (
    "id" TEXT NOT NULL,
    "motoristaId" TEXT NOT NULL,
    "emailDestino" TEXT NOT NULL,
    "observacao" TEXT,
    "codigo" TEXT,
    "status" "SolicitacaoCodigoStatus" NOT NULL DEFAULT 'PENDENTE',
    "solicitadoPor" TEXT NOT NULL,
    "solicitadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "enviadoEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SolicitacaoCodigo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SolicitacaoCodigo_motoristaId_idx" ON "SolicitacaoCodigo"("motoristaId");

-- CreateIndex
CREATE INDEX "SolicitacaoCodigo_status_idx" ON "SolicitacaoCodigo"("status");

-- AddForeignKey
ALTER TABLE "SolicitacaoCodigo" ADD CONSTRAINT "SolicitacaoCodigo_motoristaId_fkey" FOREIGN KEY ("motoristaId") REFERENCES "Motorista"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
