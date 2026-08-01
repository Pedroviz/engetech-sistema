import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/authMiddleware";
import { lancamentoSchema } from "@/lib/schemas";

export async function GET(request: NextRequest) {
  return withAuth(request, async () => {
    try {
      const obraId = request.nextUrl.searchParams.get("obraId");
      const lancamentos = await prisma.lancamento.findMany({
        where: obraId ? { obraId } : {},
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
  return withAuth(request, async () => {
    try {
      const body = await request.json();
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
