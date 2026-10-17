import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { withAuth } from "@/lib/authMiddleware";

const prisma = new PrismaClient();

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withAuth(request, async (_req, _tenantId, role) => {
    if (role !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }
    const { id } = await params;
    const { role: novoRole } = await request.json();
    if (!["admin", "user"].includes(novoRole)) {
      return NextResponse.json({ error: "Role inválido" }, { status: 400 });
    }
    const updated = await prisma.user.update({
      where: { id },
      data: { role: novoRole },
    });
    return NextResponse.json(updated);
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withAuth(request, async (_req, tenantId, role) => {
    if (role !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }
    const { id } = await params;
    if (id === tenantId) {
      return NextResponse.json(
        { error: "Você não pode excluir sua própria conta" },
        { status: 400 },
      );
    }

    // Busca IDs das obras do usuário para cascata
    const obras = await prisma.obra.findMany({
      where: { tenantId: id },
      select: { id: true },
    });
    const obraIds = obras.map((o) => o.id);

    // Busca IDs dos RDOs do usuário
    const rdos = await prisma.rDO.findMany({
      where: { tenantId: id },
      select: { id: true },
    });
    const rdoIds = rdos.map((r) => r.id);

    // Deleta filhos dos RDOs
    await prisma.rDOEquipe.deleteMany({ where: { rdoId: { in: rdoIds } } });
    await prisma.rDOAtividade.deleteMany({ where: { rdoId: { in: rdoIds } } });
    await prisma.rDOFoto.deleteMany({ where: { rdoId: { in: rdoIds } } });
    await prisma.rDO.deleteMany({ where: { tenantId: id } });

    // Deleta filhos das obras
    await prisma.subtarefa.deleteMany({
      where: { etapa: { obraId: { in: obraIds } } },
    });
    await prisma.etapa.deleteMany({ where: { obraId: { in: obraIds } } });
    await prisma.pagamento.deleteMany({
      where: { diarista: { obraId: { in: obraIds } } },
    });
    await prisma.diarista.deleteMany({ where: { obraId: { in: obraIds } } });
    await prisma.ocorrencia.deleteMany({ where: { obraId: { in: obraIds } } });
    await prisma.material.deleteMany({ where: { tenantId: id } });
    await prisma.gastoEsporadico.deleteMany({ where: { tenantId: id } });
    await prisma.lancamento.deleteMany({ where: { tenantId: id } });
    await prisma.orcamento.deleteMany({ where: { tenantId: id } });
    await prisma.obra.deleteMany({ where: { tenantId: id } });
    await prisma.cliente.deleteMany({ where: { tenantId: id } });
    await prisma.fornecedor.deleteMany({ where: { tenantId: id } });
    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  });
}
