import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const obraId = request.nextUrl.searchParams.get("obraId");
    const etapas = await prisma.etapa.findMany({
      where: obraId ? { obraId } : {},
      include: { subtarefas: true, obra: true },
      orderBy: { ordem: "asc" },
    });
    return NextResponse.json(etapas);
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const etapa = await prisma.etapa.create({
      data: {
        obraId: data.obraId,
        nome: data.nome,
        ordem: Number(data.ordem || 0),
        status: data.status || "pendente",
        percentual: Number(data.percentual || 0),
        inicioPlano: new Date(data.inicioPlano),
        fimPlano: new Date(data.fimPlano),
        inicioReal: data.inicioReal ? new Date(data.inicioReal) : null,
        fimReal: data.fimReal ? new Date(data.fimReal) : null,
      },
      include: { subtarefas: true },
    });
    return NextResponse.json(etapa, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
