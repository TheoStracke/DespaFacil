/*
  Warnings:

  - Added the required column `senha` to the `SolicitacaoCadastro` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable: Adicionar coluna com valor temporário para registros existentes
ALTER TABLE "SolicitacaoCadastro" ADD COLUMN     "nomeResponsavel" TEXT;
ALTER TABLE "SolicitacaoCadastro" ADD COLUMN     "senha" TEXT NOT NULL DEFAULT '$2a$12$TEMP_HASH_FOR_MIGRATION';

-- Remover o default após popular registros existentes
ALTER TABLE "SolicitacaoCadastro" ALTER COLUMN "senha" DROP DEFAULT;
