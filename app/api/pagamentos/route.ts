import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const pagamentos = await prisma.pagamento.findMany({
      include: { diarista: true, obra: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(pagamentos);
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const total = Number(data.diasTrab) * Number(data.valorDia);
    const pagamento = await prisma.pagamento.create({
      data: {
        diaristaId: data.diaristaId,
        obraId: data.obraId,
        diasTrab: Number(data.diasTrab),
        valorDia: Number(data.valorDia),
        total,
        status: data.status || "pendente",
      },
      include: { diarista: true, obra: true },
    });
    return NextResponse.json(pagamento, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
