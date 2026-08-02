import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/authMiddleware";
import { orcamentoSchema } from "@/lib/schemas";

export async function GET(request: NextRequest) {
  return withAuth(request, async () => {
    try {
      const orcamentos = await prisma.orcamento.findMany({
        include: { cliente: true },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(orcamentos);
    } catch (error) {
      return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async () => {
    try {
      const body = await request.json();
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
        data: result.data,
        include: { cliente: true },
      });
      return NextResponse.json(orcamento, { status: 201 });
    } catch (error) {
      return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
  });
}
