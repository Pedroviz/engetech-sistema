import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const orcamentos = await prisma.orcamento.findMany({
      include: { cliente: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orcamentos);
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const orcamento = await prisma.orcamento.create({
      data: {
        numero: data.numero,
        clienteId: data.clienteId,
        valor: Number(data.valor),
        status: data.status || "enviado",
        linkArquivo: data.linkArquivo || null,
        observacoes: data.observacoes || null,
      },
      include: { cliente: true },
    });
    return NextResponse.json(orcamento, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
