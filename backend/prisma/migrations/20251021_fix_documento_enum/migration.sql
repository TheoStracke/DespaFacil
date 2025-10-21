-- Migration: Rename DOCUMENTO1 -> LISTA_PRESENCA, DOCUMENTO2 -> TABELA_DADOS
-- Strategy:
-- 1) Add the new enum values to the existing Postgres enum type
-- 2) Update any rows that reference the old enum values
-- Note: Postgres does not allow dropping enum labels easily; we'll leave old labels to avoid risk.

DO $$
BEGIN
  -- Add new enum values if they don't exist
  BEGIN
    ALTER TYPE "DocumentoTipo" ADD VALUE 'LISTA_PRESENCA';
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER TYPE "DocumentoTipo" ADD VALUE 'TABELA_DADOS';
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
END$$;

-- Update existing rows in tables that reference the enum. Replace table/column names as appropriate.
-- Common table: "MotoristaDocumento" or similar; inspect your schema for the correct table name.

UPDATE "Documento"
SET tipo = 'LISTA_PRESENCA'
WHERE tipo = 'DOCUMENTO1';

UPDATE "Documento"
SET tipo = 'TABELA_DADOS'
WHERE tipo = 'DOCUMENTO2';

-- If you have other tables referencing the enum (e.g., logs), update them similarly:
-- UPDATE "SomeOtherTable" SET documento_tipo = 'LISTA_PRESENCA' WHERE documento_tipo = 'DOCUMENTO1';

-- After these updates, the Prisma schema that uses LISTA_PRESENCA/TABELA_DADOS will work.
