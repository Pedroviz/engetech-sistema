import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const lancamentos = await prisma.lancamento.findMany({
      include: { obra: true },
      orderBy: { data: "desc" },
    });
    return NextResponse.json(lancamentos);
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const lancamento = await prisma.lancamento.create({
      data: {
        descricao: data.descricao,
        obraId: data.obraId,
        tipo: data.tipo,
        categoria: data.categoria,
        valor: Number(data.valor),
        data: data.data ? new Date(data.data) : new Date(),
      },
      include: { obra: true },
    });
    return NextResponse.json(lancamento, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
