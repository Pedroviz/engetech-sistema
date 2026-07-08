import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const materiais = await prisma.material.findMany({
      include: { obra: true, fornecedor: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(materiais);
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const material = await prisma.material.create({
      data: {
        nome: data.nome,
        obraId: data.obraId,
        fornecedorId: data.fornecedorId || null,
        orcado: Number(data.orcado),
        utilizado: Number(data.utilizado || 0),
      },
      include: { obra: true, fornecedor: true },
    });
    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
