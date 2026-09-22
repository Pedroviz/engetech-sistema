import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/authMiddleware";
import { lancamentoSchema } from "@/lib/schemas";

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, tenantId) => {
    try {
      const obraId = req.nextUrl.searchParams.get("obraId");
      const lancamentos = await prisma.lancamento.findMany({
        where: { tenantId, ...(obraId ? { obraId } : {}) },
        include: { obra: true },
        orderBy: { data: "desc" },
      });
      return NextResponse.json(lancamentos);
    } catch {
      return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, tenantId) => {
    try {
      const body = await req.json();
      const result = lancamentoSchema.safeParse({
        ...body,
        valor: Number(body.valor),
      });
      if (!result.success) {
        return NextResponse.json(
          { error: "Dados inválidos", detalhes: result.error.issues },
          { status: 400 },
        );
      }
      const lancamento = await prisma.lancamento.create({
        data: {
          ...result.data,
          tenantId,
          data: result.data.data ? new Date(result.data.data) : new Date(),
        },
        include: { obra: true },
      });
      return NextResponse.json(lancamento, { status: 201 });
    } catch {
      return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
  });
}
