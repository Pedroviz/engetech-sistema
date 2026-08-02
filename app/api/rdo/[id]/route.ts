import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }, // 👈 params tipado como Promise
) {
  try {
    const { id } = await params; // 👈 await no params aqui

    // Deletar dependências do RDO
    await prisma.rdoEquipe.deleteMany({ where: { rdoId: id } });
    await prisma.rdoAtividade.deleteMany({ where: { rdoId: id } });
    await prisma.rdoFoto.deleteMany({ where: { rdoId: id } });

    // Deletar o RDO principal
    await prisma.rdo.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao deletar RDO" }, { status: 500 });
  }
}
