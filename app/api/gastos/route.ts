import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/authMiddleware";
import { gastoSchema } from "@/lib/schemas";

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, tenantId) => {
    try {
      const obraId = req.nextUrl.searchParams.get("obraId");
      const gastos = await prisma.gastoEsporadico.findMany({
        where: { tenantId, ...(obraId ? { obraId } : {}) },
        include: { obra: true },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(gastos);
    } catch {
      return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, tenantId) => {
    try {
      const body = await req.json();
      const result = gastoSchema.safeParse({
        ...body,
        valor: Number(body.valor),
      });
      if (!result.success) {
        return NextResponse.json(
          { error: "Dados inválidos", detalhes: result.error.issues },
          { status: 400 },
        );
      }
      const gasto = await prisma.gastoEsporadico.create({
        data: {
          ...result.data,
          tenantId,
          data: result.data.data ? new Date(result.data.data) : new Date(),
        },
        include: { obra: true },
      });
      return NextResponse.json(gasto, { status: 201 });
    } catch {
      return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
  });
}
