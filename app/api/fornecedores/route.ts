import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const fornecedores = await prisma.fornecedor.findMany({
      include: { itens: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(fornecedores);
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const fornecedor = await prisma.fornecedor.create({
      data: {
        razaoSocial: data.razaoSocial,
        cnpj: data.cnpj,
        categoria: data.categoria,
        pedidoMinimo: Number(data.pedidoMinimo || 0),
        telefone: data.telefone,
        email: data.email,
        vendedor: data.vendedor,
        condicaoPagto: data.condicaoPagto,
        endereco: data.endereco,
        cidade: data.cidade,
        materiais: data.materiais,
      },
    });
    return NextResponse.json(fornecedor, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
