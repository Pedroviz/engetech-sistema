import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const fornecedor = await prisma.fornecedor.update({
      where: { id },
      data: {
        razaoSocial: data.razaoSocial,
        cnpj: data.cnpj,
        categoria: data.categoria,
        pedidoMinimo: Number(data.pedidoMinimo || 0),
        telefone: data.telefone,
        email: data.email,
        vendedor: data.vendedor,
        condicaoPagto: data.condicaoPagto,
        cidade: data.cidade,
        materiais: data.materiais,
      },
    });
    return NextResponse.json(fornecedor);
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.fornecedor.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
