import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const data = await request.json();

    const orcamento = await prisma.orcamento.update({
      where: { id: resolvedParams.id },
      data: {
        status: data.status,
        observacoes: data.observacoes,
        linkArquivo: data.linkArquivo,
      },
      include: { cliente: true },
    });
    return NextResponse.json(orcamento);
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;

    await prisma.orcamento.delete({
      where: { id: resolvedParams.id },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
