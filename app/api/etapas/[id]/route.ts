import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const etapa = await prisma.etapa.update({
      where: { id },
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
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.subtarefa.deleteMany({ where: { etapaId: id } });
    await prisma.etapa.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
