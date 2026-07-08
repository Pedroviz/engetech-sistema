import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const data = await request.json();
    const etapa = await prisma.etapa.update({
      where: { id: params.id },
      data: {
        status: data.status,
        percentual: Number(data.percentual),
        inicioReal: data.inicioReal ? new Date(data.inicioReal) : null,
        fimReal: data.fimReal ? new Date(data.fimReal) : null,
      },
      include: { subtarefas: true },
    });
    return NextResponse.json(etapa);
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await prisma.subtarefa.deleteMany({ where: { etapaId: params.id } });
    await prisma.etapa.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
