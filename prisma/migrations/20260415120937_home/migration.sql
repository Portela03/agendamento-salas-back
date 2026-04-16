-- CreateEnum
CREATE TYPE "ClassType" AS ENUM ('SALA', 'LABORATORIO', 'AUDITORIO');

-- CreateEnum
CREATE TYPE "ClassStatus" AS ENUM ('INDISPONIVEL', 'DISPONIVEL');

-- CreateTable
CREATE TABLE "classes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "capacity" INTEGER NOT NULL,
    "type" "ClassType" NOT NULL,
    "status" "ClassStatus" NOT NULL DEFAULT 'DISPONIVEL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);
