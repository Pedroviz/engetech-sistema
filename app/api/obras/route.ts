import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/authMiddleware";
import { obraSchema } from "@/lib/schemas";

export async function GET(request: NextRequest) {
  return withAuth(request, async (_, tenantId) => {
    try {
      const obras = await prisma.obra.findMany({
        where: { tenantId },
        include: {
          cliente: true,
          // Incluir totais reais para calcular gastos dinamicamente
          materiais: { select: { utilizado: true } },
          pagamentos: { select: { total: true } },
          gastos: { select: { valor: true } },
          lancamentos: { select: { tipo: true, categoria: true, valor: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      // Calcular gastos reais somando os registros filhos
      const obrasComGastos = obras.map((obra) => {
        const gastoMat = obra.materiais.reduce((a, m) => a + m.utilizado, 0);
        const gastoMO = obra.pagamentos.reduce((a, p) => a + p.total, 0);
        const gastoEsporadico = obra.gastos.reduce((a, g) => a + g.valor, 0);

        // Lançamentos de saída também entram no total gasto
        const totalSaidas = obra.lancamentos
          .filter((l) => l.tipo === "saida")
          .reduce((a, l) => a + l.valor, 0);

        return {
          ...obra,
          gastoMat,
          gastoMO,
          gastoEsporadico,
          // Campo extra: total de saídas financeiras registradas
          totalSaidas,
          // Remover arrays filhos da resposta (não precisam ir pro frontend)
          materiais: undefined,
          pagamentos: undefined,
          gastos: undefined,
          lancamentos: undefined,
        };
      });

      return NextResponse.json(obrasComGastos);
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, tenantId) => {
    try {
      const body = await req.json();
      const result = obraSchema.safeParse({
        ...body,
        contrato: Number(body.contrato),
        orcamentoMat: Number(body.orcamentoMat),
        orcamentoMO: Number(body.orcamentoMO),
      });

      if (!result.success) {
        return NextResponse.json(
          { error: "Dados inválidos", detalhes: result.error.issues },
          { status: 400 },
        );
      }

      const obra = await prisma.obra.create({
        data: {
          tenantId,
          centroCusto: result.data.centroCusto,
          clienteId: result.data.clienteId,
          tipo: result.data.tipo,
          status: result.data.status,
          inicio: new Date(result.data.inicio),
          previsaoFim: new Date(result.data.previsaoFim),
          contrato: result.data.contrato,
          orcamentoMat: result.data.orcamentoMat,
          orcamentoMO: result.data.orcamentoMO,
        },
        include: { cliente: true },
      });

      return NextResponse.json(
        { ...obra, gastoMat: 0, gastoMO: 0, gastoEsporadico: 0 },
        { status: 201 },
      );
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
  });
}
