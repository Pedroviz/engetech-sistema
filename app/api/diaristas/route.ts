import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const diaristas = await prisma.diarista.findMany({
      include: { obra: true, pagamentos: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(diaristas);
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const diarista = await prisma.diarista.create({
      data: {
        nome: data.nome,
        funcao: data.funcao,
        telefone: data.telefone,
        obraId: data.obraId,
      },
      include: { obra: true },
    });
    return NextResponse.json(diarista, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
