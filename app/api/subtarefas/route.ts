import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const subtarefa = await prisma.subtarefa.create({
      data: {
        etapaId: data.etapaId,
        nome: data.nome,
        status: data.status || "pendente",
        percentual: Number(data.percentual || 0),
        motivo: data.motivo || null,
      },
    });
    return NextResponse.json(subtarefa, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
