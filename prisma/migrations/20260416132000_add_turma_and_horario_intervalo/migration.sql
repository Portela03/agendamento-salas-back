ALTER TABLE "Reserva"
  ADD COLUMN "horario_inicio" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "horario_fim" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "turma" TEXT NOT NULL DEFAULT '';

UPDATE "Reserva"
SET
  "horario_inicio" = COALESCE(NULLIF(split_part("horario", '-', 1), ''), "horario"),
  "horario_fim" = COALESCE(
    NULLIF(split_part("horario", '-', 2), ''),
    COALESCE(NULLIF(split_part("horario", '-', 1), ''), "horario")
  )
WHERE "horario" IS NOT NULL;