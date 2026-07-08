import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const obraId = request.nextUrl.searchParams.get("obraId");
    const ocorrencias = await prisma.ocorrencia.findMany({
      where: obraId ? { obraId } : {},
      include: { obra: true },
      orderBy: { data: "desc" },
    });
    return NextResponse.json(ocorrencias);
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const ocorrencia = await prisma.ocorrencia.create({
      data: {
        obraId: data.obraId,
        etapaId: data.etapaId || null,
        causa: data.causa,
        descricao: data.descricao,
        diasAtraso: Number(data.diasAtraso || 0),
        data: data.data ? new Date(data.data) : new Date(),
      },
      include: { obra: true },
    });
    return NextResponse.json(ocorrencia, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
