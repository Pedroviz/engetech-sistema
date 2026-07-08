import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Listar todas as obras
export async function GET() {
  try {
    const obras = await prisma.obra.findMany({
      include: { cliente: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(obras);
  } catch (error) {
    console.error("Erro ao buscar obras:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// Criar nova obra
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const obra = await prisma.obra.create({
      data: {
        centroCusto: data.centroCusto,
        clienteId: data.clienteId,
        tipo: data.tipo,
        status: data.status,
        inicio: new Date(data.inicio),
        previsaoFim: new Date(data.previsaoFim),
        contrato: Number(data.contrato),
        orcamentoMat: Number(data.orcamentoMat),
        orcamentoMO: Number(data.orcamentoMO),
      },
      include: { cliente: true },
    });

    return NextResponse.json(obra, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar obra:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
