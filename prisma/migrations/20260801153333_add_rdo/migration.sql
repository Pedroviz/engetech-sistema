-- CreateTable
CREATE TABLE "RDO" (
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

    CONSTRAINT "RDO_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RDOEquipe" (
    "id" TEXT NOT NULL,
    "rdoId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "funcao" TEXT NOT NULL,
    "presente" BOOLEAN NOT NULL DEFAULT true,
    "horas" DOUBLE PRECISION NOT NULL DEFAULT 8,

    CONSTRAINT "RDOEquipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RDOAtividade" (
    "id" TEXT NOT NULL,
    "rdoId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "etapa" TEXT,
    "percentual" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'executado',

    CONSTRAINT "RDOAtividade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RDOFoto" (
    "id" TEXT NOT NULL,
    "rdoId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "descricao" TEXT,
    "etapa" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RDOFoto_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RDO" ADD CONSTRAINT "RDO_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RDOEquipe" ADD CONSTRAINT "RDOEquipe_rdoId_fkey" FOREIGN KEY ("rdoId") REFERENCES "RDO"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RDOAtividade" ADD CONSTRAINT "RDOAtividade_rdoId_fkey" FOREIGN KEY ("rdoId") REFERENCES "RDO"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RDOFoto" ADD CONSTRAINT "RDOFoto_rdoId_fkey" FOREIGN KEY ("rdoId") REFERENCES "RDO"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
