import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/authMiddleware";

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, tenantId) => {
    try {
      const obraId = req.nextUrl.searchParams.get("obraId");
      const materiais = await prisma.material.findMany({
        where: { tenantId, ...(obraId ? { obraId } : {}) },
        include: { obra: true, fornecedor: true },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(materiais);
    } catch {
      return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, tenantId) => {
    try {
      const body = await req.json();
      const material = await prisma.material.create({
        data: {
          tenantId,
          nome: body.nome,
          obraId: body.obraId,
          fornecedorId: body.fornecedorId || null,
          orcado: Number(body.orcado),
          utilizado: Number(body.utilizado || 0),
        },
        include: { obra: true, fornecedor: true },
      });
      return NextResponse.json(material, { status: 201 });
    } catch {
      return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
  });
}
