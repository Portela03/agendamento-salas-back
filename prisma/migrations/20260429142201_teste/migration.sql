-- DropForeignKey
ALTER TABLE "Reserva" DROP CONSTRAINT "Reserva_classId_fkey";

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
