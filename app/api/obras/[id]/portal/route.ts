import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/authMiddleware";
import { randomBytes } from "crypto";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withAuth(request, async (req, tenantId) => {
    try {
      const { id } = await params;
      const body = await req.json();

      const obra = await prisma.obra.findFirst({ where: { id, tenantId } });
      if (!obra) {
        return NextResponse.json(
          { error: "Obra não encontrada" },
          { status: 404 },
        );
      }

      const token = obra.portalToken || randomBytes(9).toString("base64url");

      const atualizada = await prisma.obra.update({
        where: { id },
        data: {
          portalToken: token,
          portalAtivo: body.ativo ?? true,
          portalTitulo: body.titulo ?? obra.portalTitulo,
          endereco: body.endereco ?? obra.endereco,
        },
      });

      return NextResponse.json({
        token: atualizada.portalToken,
        ativo: atualizada.portalAtivo,
      });
    } catch {
      return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
  });
}
