import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const gastos = await prisma.gastoEsporadico.findMany({
      include: { obra: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(gastos);
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const gasto = await prisma.gastoEsporadico.create({
      data: {
        descricao: data.descricao,
        justificativa: data.justificativa,
        obraId: data.obraId,
        valor: Number(data.valor),
        data: data.data ? new Date(data.data) : new Date(),
      },
      include: { obra: true },
    });
    return NextResponse.json(gasto, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
