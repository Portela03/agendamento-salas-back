-- ...existing code...

-- Remover FK antiga somente se existir
ALTER TABLE "Reserva" DROP CONSTRAINT IF EXISTS "Reserva_salaId_fkey";

-- (opcional, mais robusto) remover qualquer FK que ainda use salaId
DO $$
DECLARE c RECORD;
BEGIN
  FOR c IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = '"Reserva"'::regclass
      AND contype = 'f'
      AND pg_get_constraintdef(oid) ILIKE '%("salaId")%'
  LOOP
    EXECUTE format('ALTER TABLE "Reserva" DROP CONSTRAINT IF EXISTS %I', c.conname);
  END LOOP;
END $$;

-- Evita erro se coluna já foi removida manualmente
ALTER TABLE "Reserva" DROP COLUMN IF EXISTS "salaId";

-- ...existing code...