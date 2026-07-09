import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const orcamento = await prisma.orcamento.update({
      where: { id },
      data: {
        status: data.status,
        observacoes: data.observacoes,
        linkArquivo: data.linkArquivo,
        valor: data.valor ? Number(data.valor) : undefined,
      },
      include: { cliente: true },
    });
    return NextResponse.json(orcamento);
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
    await prisma.orcamento.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
