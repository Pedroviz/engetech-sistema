import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const orcamento = await prisma.orcamento.findUnique({
      where: { id },
      include: { cliente: true },
    });

    if (!orcamento) {
      return NextResponse.json(
        { error: "Orçamento não encontrado" },
        { status: 404 },
      );
    }

    const jaExiste = await prisma.obra.findUnique({
      where: { centroCusto: data.centroCusto },
    });

    if (jaExiste) {
      return NextResponse.json(
        {
          error: `Já existe uma obra com o centro de custo ${data.centroCusto}`,
        },
        { status: 400 },
      );
    }

    const obra = await prisma.obra.create({
      data: {
        centroCusto: data.centroCusto,
        clienteId: orcamento.clienteId,
        tipo: data.tipo || "residencial",
        status: "andamento",
        inicio: new Date(data.inicio),
        previsaoFim: new Date(data.previsaoFim),
        contrato: orcamento.valor,
        orcamentoMat: Number(data.orcamentoMat || 0),
        orcamentoMO: Number(data.orcamentoMO || 0),
      },
      include: { cliente: true },
    });

    await prisma.orcamento.update({
      where: { id },
      data: { status: "aprovado" },
    });

    return NextResponse.json(obra, { status: 201 });
  } catch (error) {
    console.error("Erro ao converter orçamento:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
