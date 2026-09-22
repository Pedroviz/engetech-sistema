import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/authMiddleware";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withAuth(request, async (req, tenantId) => {
    try {
      const { id } = await params;
      const data = await req.json();

      const orcamento = await prisma.orcamento.findFirst({
        where: { id, tenantId },
        include: { cliente: true },
      });

      if (!orcamento) {
        return NextResponse.json(
          { error: "Orçamento não encontrado" },
          { status: 404 },
        );
      }

      const jaExiste = await prisma.obra.findFirst({
        where: { centroCusto: data.centroCusto, tenantId },
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
          tenantId,
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
      console.error("Erro ao converter:", error);
      return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
  });
}
