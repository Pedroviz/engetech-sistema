import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const data = await request.json();

    // Buscar o orçamento
    const orcamento = await prisma.orcamento.findUnique({
      where: { id: params.id },
      include: { cliente: true },
    });

    if (!orcamento) {
      return NextResponse.json(
        { error: "Orçamento não encontrado" },
        { status: 404 },
      );
    }

    // Verificar se já existe obra com esse centro de custo
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

    // Criar a obra
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

    // Atualizar status do orçamento para aprovado
    await prisma.orcamento.update({
      where: { id: params.id },
      data: { status: "aprovado" },
    });

    return NextResponse.json(obra, { status: 201 });
  } catch (error) {
    console.error("Erro ao converter orçamento:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
