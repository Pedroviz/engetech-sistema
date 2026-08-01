/*
  Warnings:

  - You are about to drop the `RDO` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RDOAtividade` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RDOEquipe` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RDOFoto` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RDO" DROP CONSTRAINT "RDO_obraId_fkey";

-- DropForeignKey
ALTER TABLE "RDOAtividade" DROP CONSTRAINT "RDOAtividade_rdoId_fkey";

-- DropForeignKey
ALTER TABLE "RDOEquipe" DROP CONSTRAINT "RDOEquipe_rdoId_fkey";

-- DropForeignKey
ALTER TABLE "RDOFoto" DROP CONSTRAINT "RDOFoto_rdoId_fkey";

-- DropTable
DROP TABLE "RDO";

-- DropTable
DROP TABLE "RDOAtividade";

-- DropTable
DROP TABLE "RDOEquipe";

-- DropTable
DROP TABLE "RDOFoto";

-- CreateTable
CREATE TABLE "Rdo" (
    "id" TEXT NOT NULL,
    "obraId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clima" TEXT NOT NULL,
    "tempMax" DOUBLE PRECISION,
    "tempMin" DOUBLE PRECISION,
    "anotacoes" TEXT,
    "ocorrencias" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rdo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RdoEquipe" (
    "id" TEXT NOT NULL,
    "rdoId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "funcao" TEXT NOT NULL,
    "presente" BOOLEAN NOT NULL DEFAULT true,
    "horas" DOUBLE PRECISION NOT NULL DEFAULT 8,

    CONSTRAINT "RdoEquipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RdoAtividade" (
    "id" TEXT NOT NULL,
    "rdoId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "etapa" TEXT,
    "percentual" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'executado',

    CONSTRAINT "RdoAtividade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RdoFoto" (
    "id" TEXT NOT NULL,
    "rdoId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "descricao" TEXT,
    "etapa" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RdoFoto_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Rdo" ADD CONSTRAINT "Rdo_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RdoEquipe" ADD CONSTRAINT "RdoEquipe_rdoId_fkey" FOREIGN KEY ("rdoId") REFERENCES "Rdo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RdoAtividade" ADD CONSTRAINT "RdoAtividade_rdoId_fkey" FOREIGN KEY ("rdoId") REFERENCES "Rdo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RdoFoto" ADD CONSTRAINT "RdoFoto_rdoId_fkey" FOREIGN KEY ("rdoId") REFERENCES "Rdo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
