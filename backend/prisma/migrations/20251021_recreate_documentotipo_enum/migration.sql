-- Professional migration: recreate enum to remove legacy labels and remap data safely
-- This script:
-- 1) Creates a new enum type with the desired labels only
-- 2) Converts column values from old enum to new enum with a CASE mapping
-- 3) Drops the old enum type and renames the new type

BEGIN;

-- 1) Create the new enum type with only the desired labels
CREATE TYPE "DocumentoTipo_new" AS ENUM (
  'CNH',
  'COMPROVANTE_PAGAMENTO',
  'LISTA_PRESENCA',
  'TABELA_DADOS'
);

-- 2) Alter the column to use the new enum, mapping legacy values
ALTER TABLE "Documento"
  ALTER COLUMN "tipo" TYPE "DocumentoTipo_new"
  USING (
    CASE
      WHEN "tipo"::text = 'DOCUMENTO1' THEN 'LISTA_PRESENCA'
      WHEN "tipo"::text = 'DOCUMENTO2' THEN 'TABELA_DADOS'
      ELSE "tipo"::text
    END::"DocumentoTipo_new"
  );

-- 3) Drop the old enum and rename the new one to the canonical name
DROP TYPE "DocumentoTipo";
ALTER TYPE "DocumentoTipo_new" RENAME TO "DocumentoTipo";

COMMIT;
