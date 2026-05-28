-- AlterTable
ALTER TABLE "Despachante" ALTER COLUMN "cnpj" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Certificado" (
    "id" TEXT NOT NULL,
    "motoristaId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mimetype" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "enviadoPor" TEXT NOT NULL,
    "enviadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "baixadoEm" TIMESTAMP(3),

    CONSTRAINT "Certificado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Certificado_motoristaId_idx" ON "Certificado"("motoristaId");

-- CreateIndex
CREATE INDEX "Certificado_enviadoEm_idx" ON "Certificado"("enviadoEm");

-- AddForeignKey
ALTER TABLE "Certificado" ADD CONSTRAINT "Certificado_motoristaId_fkey" FOREIGN KEY ("motoristaId") REFERENCES "Motorista"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
