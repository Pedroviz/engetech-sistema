import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("engetech-token");

    if (!tokenCookie) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const user = (await verifyToken(tokenCookie.value)) as {
      userId?: string;
      email?: string;
      role?: string;
      tenantId?: string;
    } | null;

    if (!user) {
      return NextResponse.json({ error: "Sessão inválida." }, { status: 401 });
    }

    const { id } = await context.params;

    // Busca a obra e todas as frentes financeiras e operacionais associadas
    const obra = await prisma.obra.findFirst({
      where: {
        id,
        ...(user.tenantId ? { tenantId: user.tenantId } : {}),
      },
      include: {
        cliente: true,
        materiais: true,
        gastos: true,
        pagamentos: true,
        lancamentos: true,
      },
    });

    if (!obra) {
      return NextResponse.json(
        { error: "Obra não encontrada." },
        { status: 404 },
      );
    }

    // 1. Custos de Materiais (somatório do valor utilizado)
    const totalMateriaisReal = obra.materiais.reduce(
      (acc, m) => acc + (m.utilizado || 0),
      0,
    );

    // 2. Gastos Esporádicos (alimentação, insumos de campo, imprevistos)
    const totalGastosEsporadicos = obra.gastos.reduce(
      (acc, g) => acc + (g.valor || 0),
      0,
    );

    // 3. Pagamentos a Diaristas (apenas os efetivamente quitados/pagos)
    const totalDiaristas = obra.pagamentos.reduce(
      (acc, p) => acc + (p.status === "pago" ? p.total : 0),
      0,
    );

    // 4. Lançamentos Financeiros (despesas e saídas gerais vinculadas na aba Financeiro, ex: combustível, fretes, taxas)
    const totalLancamentosSaida = obra.lancamentos.reduce(
      (acc, l) =>
        acc + (l.tipo === "saida" || l.tipo === "despesa" ? l.valor : 0),
      0,
    );

    // Consolidando Mão de Obra e Materiais globais
    const totalMOReal = obra.gastoMO + totalDiaristas;
    const totalMateriaisGeral = obra.gastoMat + totalMateriaisReal;

    // Custo Total Real somando todas as frentes possíveis
    const custoTotalReal =
      totalMateriaisGeral +
      totalMOReal +
      totalGastosEsporadicos +
      totalLancamentosSaida;

    const receitaContrato = obra.contrato || 0;
    const resultadoBruto = receitaContrato - custoTotalReal;
    const margemReal =
      receitaContrato > 0
        ? Number(((resultadoBruto / receitaContrato) * 100).toFixed(1))
        : 0;

    const orcamentoTotalPrevisto = obra.orcamentoMat + obra.orcamentoMO;

    return NextResponse.json({
      obra: {
        id: obra.id,
        centroCusto: obra.centroCusto,
        cliente: obra.cliente?.nome,
        status: obra.status,
      },
      dre: {
        receitaContrato,
        orcamento: {
          material: obra.orcamentoMat,
          maoDeObra: obra.orcamentoMO,
          total: orcamentoTotalPrevisto,
        },
        realizado: {
          material: totalMateriaisGeral,
          maoDeObra: totalMOReal,
          esporadicos: totalGastosEsporadicos,
          financeiroGeral: totalLancamentosSaida,
          total: custoTotalReal,
        },
        resultado: {
          lucroBruto: resultadoBruto,
          margemPercentual: margemReal,
        },
        detalhes: {
          materiais: obra.materiais,
          gastos: obra.gastos,
          pagamentos: obra.pagamentos,
          lancamentos: obra.lancamentos,
        },
      },
    });
  } catch (error) {
    console.error("Erro ao calcular DRE da obra:", error);
    return NextResponse.json(
      { error: "Erro interno ao calcular DRE." },
      { status: 500 },
    );
  }
}
