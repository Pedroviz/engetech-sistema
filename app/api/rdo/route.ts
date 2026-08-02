import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar todos os RDOs
export async function GET() {
  try {
    const rdos = await prisma.rdo.findMany({
      // 👈 prisma.rdo em minúsculo
      include: {
        obra: { include: { cliente: true } },
        equipe: true,
        atividades: true,
        fotos: true,
      },
      orderBy: { data: "desc" },
    });

    return NextResponse.json(rdos);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar RDOs" }, { status: 500 });
  }
}

// POST - Criar um novo RDO
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      obraId,
      data,
      clima,
      tempMax,
      tempMin,
      anotacoes,
      ocorrencias,
      equipe,
      atividades,
    } = body;

    const rdo = await prisma.rdo.create({
      // 👈 prisma.rdo em minúsculo
      data: {
        obraId,
        data: data ? new Date(data) : new Date(),
        clima,
        tempMax: tempMax ? Number(tempMax) : null,
        tempMin: tempMin ? Number(tempMin) : null,
        anotacoes,
        ocorrencias,
        equipe: {
          create: equipe || [],
        },
        atividades: {
          create: atividades || [],
        },
      },
      include: {
        equipe: true,
        atividades: true,
      },
    });

    return NextResponse.json(rdo, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar RDO" }, { status: 500 });
  }
}
