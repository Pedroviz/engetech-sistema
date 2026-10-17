import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { withAuth } from "@/lib/authMiddleware";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  return withAuth(request, async (_req, _tenantId, role) => {
    if (role !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    // User não tem relação direta com Obra no schema —
    // a ligação é via tenantId, então buscamos a contagem separada
    const usuarios = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        empresa: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Conta obras por tenantId (userId) para cada usuário
    const obrasCount = await prisma.obra.groupBy({
      by: ["tenantId"],
      _count: { id: true },
    });

    const countMap = Object.fromEntries(
      obrasCount.map((o) => [o.tenantId, o._count.id]),
    );

    const resultado = usuarios.map((u) => ({
      ...u,
      _count: { obras: countMap[u.id] ?? 0 },
    }));

    return NextResponse.json(resultado);
  });
}
