import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await context.params;

    if (!token) {
      return NextResponse.json({ error: "Token inválido" }, { status: 400 });
    }

    // Busca a obra via token sem expor informações financeiras da construtora
    const obra = await prisma.obra.findFirst({
      where: {
        portalToken: token,
      },
      select: {
        id: true,
        nome: true,
        endereco: true,
        status: true,
        dataInicio: true,
        previsaoTermino: true,
        cliente: {
          select: {
            nome: true,
          },
        },
        etapas: {
          select: {
            id: true,
            nome: true,
            ordem: true,
            status: true,
            dataInicio: true,
            dataFim: true,
            subtarefas: {
              select: {
                id: true,
                titulo: true,
                concluida: true,
              },
            },
          },
          orderBy: {
            ordem: "asc",
          },
        },
        rdos: {
          select: {
            id: true,
            data: true,
            clima: true,
            atividades: true,
            fotos: true,
          },
          orderBy: {
            data: "desc",
          },
          take: 15, // Últimos 15 relatórios
        },
      },
    });

    if (!obra) {
      return NextResponse.json(
        { error: "Obra não localizada ou link expirado." },
        { status: 404 },
      );
    }

    // Calcula porcentagem global de conclusão baseada nas subtarefas/etapas
    const todasSubtarefas = obra.etapas.flatMap((e) => e.subtarefas);
    const concluidas = todasSubtarefas.filter((s) => s.concluida).length;
    const progresso =
      todasSubtarefas.length > 0
        ? Math.round((concluidas / todasSubtarefas.length) * 100)
        : obra.status === "CONCLUIDA"
          ? 100
          : 0;

    return NextResponse.json({
      obra: {
        ...obra,
        progresso,
      },
    });
  } catch (error) {
    console.error("Erro na rota pública do portal:", error);
    return NextResponse.json(
      { error: "Falha ao buscar dados da obra." },
      { status: 500 },
    );
  }
}
