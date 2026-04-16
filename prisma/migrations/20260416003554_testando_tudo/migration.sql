/*
  Warnings:

  - You are about to drop the column `salaId` on the `Reserva` table. All the data in the column will be lost.
  - You are about to drop the `Sala` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `classId` to the `Reserva` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Reserva" DROP CONSTRAINT "Reserva_salaId_fkey";

-- AlterTable
ALTER TABLE "Reserva" DROP COLUMN "salaId",
ADD COLUMN     "classId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Sala";

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
