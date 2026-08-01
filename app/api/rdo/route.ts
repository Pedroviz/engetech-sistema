import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/authMiddleware";

export async function GET(request: NextRequest) {
  return withAuth(request, async () => {
    try {
      const obraId = request.nextUrl.searchParams.get("obraId");
      const rdos = await prisma.rDO.findMany({
        where: obraId ? { obraId } : {},
        include: {
          obra: { include: { cliente: true } },
          equipe: true,
          atividades: true,
          fotos: true,
        },
        orderBy: { data: "desc" },
      });
      return NextResponse.json(rdos);
    } catch (error) {
      return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
  });
}

type RdoEquipeItem = {
  nome: string;
  funcao: string;
  presente?: boolean;
  horas?: number | string;
};

type RdoAtividadeItem = {
  descricao: string;
  etapa?: string | null;
  percentual?: number | string;
  status?: string;
};

type RdoCreateBody = {
  obraId: string;
  data?: string;
  clima?: string;
  tempMax?: number | string;
  tempMin?: number | string;
  anotacoes?: string | null;
  ocorrencias?: string | null;
  equipe?: RdoEquipeItem[];
  atividades?: RdoAtividadeItem[];
};

export async function POST(request: NextRequest) {
  return withAuth(request, async () => {
    try {
      const body = (await request.json()) as RdoCreateBody;

      const rdo = await prisma.rDO.create({
        data: {
          obraId: body.obraId,
          data: body.data ? new Date(body.data) : new Date(),
          clima: body.clima || "ensolarado",
          tempMax: body.tempMax ? Number(body.tempMax) : null,
          tempMin: body.tempMin ? Number(body.tempMin) : null,
          anotacoes: body.anotacoes || null,
          ocorrencias: body.ocorrencias || null,
          equipe: {
            create: (body.equipe || []).map((e) => ({
              nome: e.nome,
              funcao: e.funcao,
              presente: e.presente ?? true,
              horas: Number(e.horas || 8),
            })),
          },
          atividades: {
            create: (body.atividades || []).map((a) => ({
              descricao: a.descricao,
              etapa: a.etapa || null,
              percentual: Number(a.percentual || 0),
              status: a.status || "executado",
            })),
          },
        },
        include: {
          obra: { include: { cliente: true } },
          equipe: true,
          atividades: true,
          fotos: true,
        },
      });

      return NextResponse.json(rdo, { status: 201 });
    } catch (error) {
      console.error("Erro ao criar RDO:", error);
      return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
  });
}
