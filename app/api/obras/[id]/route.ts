import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Buscar obra por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const obra = await prisma.obra.findUnique({
      where: { id: params.id },
      include: { cliente: true },
    });

    if (!obra) {
      return NextResponse.json(
        { error: "Obra não encontrada" },
        { status: 404 },
      );
    }

    return NextResponse.json(obra);
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// Atualizar obra
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const data = await request.json();

    const obra = await prisma.obra.update({
      where: { id: params.id },
      data: {
        status: data.status,
        gastoMat: Number(data.gastoMat),
        gastoMO: Number(data.gastoMO),
        gastoEsporadico: Number(data.gastoEsporadico),
        previsaoFim: data.previsaoFim ? new Date(data.previsaoFim) : undefined,
      },
      include: { cliente: true },
    });

    return NextResponse.json(obra);
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// Deletar obra
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await prisma.obra.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
