import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/authMiddleware";
import { obraSchema } from "@/lib/schemas";

export async function GET(request: NextRequest) {
  return withAuth(request, async () => {
    try {
      const obras = await prisma.obra.findMany({
        include: { cliente: true },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(obras);
    } catch {
      return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async () => {
    try {
      const body = await request.json();
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

      return NextResponse.json(obra, { status: 201 });
    } catch {
      return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
  });
}
