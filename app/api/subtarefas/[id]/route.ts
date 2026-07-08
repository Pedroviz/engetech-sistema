import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const data = await request.json();
    const subtarefa = await prisma.subtarefa.update({
      where: { id: params.id },
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
