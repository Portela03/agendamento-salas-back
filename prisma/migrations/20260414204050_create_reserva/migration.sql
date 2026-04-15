-- CreateTable
CREATE TABLE "Reserva" (
    "id" TEXT NOT NULL,
    "professorId" TEXT NOT NULL,
    "salaId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "horario" TEXT NOT NULL,
    "periodo" TEXT NOT NULL,
    "semestre" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reserva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sala" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sala_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_salaId_fkey" FOREIGN KEY ("salaId") REFERENCES "Sala"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
