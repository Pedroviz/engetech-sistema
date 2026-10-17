import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { withAuth } from "@/lib/authMiddleware";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  return withAuth(request, async (_req, _tenantId, role) => {
    if (role !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const usuarios = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        empresa: true,
        role: true,
        createdAt: true,
        _count: { select: { obras: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(usuarios);
  });
}
