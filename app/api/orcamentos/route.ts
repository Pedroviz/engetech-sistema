import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/authMiddleware";
import { orcamentoSchema } from "@/lib/schemas";

export async function GET(request: NextRequest) {
  return withAuth(request, async (_, tenantId) => {
    try {
      const orcamentos = await prisma.orcamento.findMany({
        where: { tenantId },
        include: { cliente: true },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(orcamentos);
    } catch {
      return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, tenantId) => {
    try {
      const body = await req.json();
      const result = orcamentoSchema.safeParse({
        ...body,
        valor: Number(body.valor),
      });
      if (!result.success) {
        return NextResponse.json(
          { error: "Dados inválidos", detalhes: result.error.issues },
          { status: 400 },
        );
      }
      const orcamento = await prisma.orcamento.create({
        data: { ...result.data, tenantId },
        include: { cliente: true },
      });
      return NextResponse.json(orcamento, { status: 201 });
    } catch {
      return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
  });
}
