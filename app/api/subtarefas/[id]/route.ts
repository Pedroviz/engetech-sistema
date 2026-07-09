import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const subtarefa = await prisma.subtarefa.update({
      where: { id },
      data: {
        status: data.status,
        percentual: Number(data.percentual),
        motivo: data.motivo || null,
      },
    });
    return NextResponse.json(subtarefa);
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
