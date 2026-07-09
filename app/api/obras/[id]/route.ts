import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const obra = await prisma.obra.findUnique({
      where: { id },
      include: { cliente: true },
    });
    if (!obra)
      return NextResponse.json({ error: "Não encontrada" }, { status: 404 });
    return NextResponse.json(obra);
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const obra = await prisma.obra.update({
      where: { id },
      data: {
        status: data.status,
        tipo: data.tipo,
        previsaoFim: data.previsaoFim ? new Date(data.previsaoFim) : undefined,
        contrato: data.contrato ? Number(data.contrato) : undefined,
        orcamentoMat: data.orcamentoMat ? Number(data.orcamentoMat) : undefined,
        orcamentoMO: data.orcamentoMO ? Number(data.orcamentoMO) : undefined,
        gastoMat:
          data.gastoMat !== undefined ? Number(data.gastoMat) : undefined,
        gastoMO: data.gastoMO !== undefined ? Number(data.gastoMO) : undefined,
        gastoEsporadico:
          data.gastoEsporadico !== undefined
            ? Number(data.gastoEsporadico)
            : undefined,
        clienteId: data.clienteId || undefined,
        inicio: data.inicio ? new Date(data.inicio) : undefined,
      },
      include: { cliente: true },
    });
    return NextResponse.json(obra);
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
    await prisma.obra.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
