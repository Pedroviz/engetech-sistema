import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/authMiddleware";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withAuth(request, async () => {
    try {
      const { id } = await params;
      const rdo = await prisma.rDO.findUnique({
        where: { id },
        include: {
          obra: { include: { cliente: true } },
          equipe: true,
          atividades: true,
          fotos: true,
        },
      });
      if (!rdo)
        return NextResponse.json(
          { error: "RDO não encontrado" },
          { status: 404 },
        );
      return NextResponse.json(rdo);
    } catch (error) {
      return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withAuth(request, async () => {
    try {
      const { id } = await params;
      await prisma.rDOEquipe.deleteMany({ where: { rdoId: id } });
      await prisma.rDOAtividade.deleteMany({ where: { rdoId: id } });
      await prisma.rDOFoto.deleteMany({ where: { rdoId: id } });
      await prisma.rDO.delete({ where: { id } });
      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
  });
}
