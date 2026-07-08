import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }, // 1. Adicione a Promise aqui
) {
  try {
    // 2. Extraia o ID usando await
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const data = await request.json();

    // 3. Use a constante 'id' no Prisma
    const etapaAtualizada = await prisma.etapa.update({
      where: { id },
      data,
    });

    return NextResponse.json(etapaAtualizada);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
