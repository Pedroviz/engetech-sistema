import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/authMiddleware";

export async function GET(request: NextRequest) {
  return withAuth(request, async (_, tenantId) => {
    try {
      const diaristas = await prisma.diarista.findMany({
        where: { tenantId },
        include: { obra: true, pagamentos: true },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(diaristas);
    } catch {
      return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, tenantId) => {
    try {
      const body = await req.json();
      const diarista = await prisma.diarista.create({
        data: {
          tenantId,
          nome: body.nome,
          funcao: body.funcao,
          telefone: body.telefone,
          obraId: body.obraId,
        },
        include: { obra: true },
      });
      return NextResponse.json(diarista, { status: 201 });
    } catch {
      return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
  });
}
