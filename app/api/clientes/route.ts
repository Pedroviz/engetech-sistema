import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/authMiddleware";
import { clienteSchema } from "@/lib/schemas";

export async function GET(request: NextRequest) {
  return withAuth(request, async (_, tenantId) => {
    try {
      const clientes = await prisma.cliente.findMany({
        where: { tenantId },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(clientes);
    } catch {
      return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, tenantId) => {
    try {
      const body = await req.json();
      const result = clienteSchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json(
          { error: "Dados inválidos", detalhes: result.error.issues },
          { status: 400 },
        );
      }
      const cliente = await prisma.cliente.create({
        data: { ...result.data, tenantId },
      });
      return NextResponse.json(cliente, { status: 201 });
    } catch {
      return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
  });
}
