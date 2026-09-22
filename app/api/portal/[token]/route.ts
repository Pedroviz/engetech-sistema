import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;

    const obra = await prisma.obra.findUnique({
      where: { portalToken: token },
      include: {
        cliente: { select: { nome: true } },
        etapas: {
          orderBy: { ordem: "asc" },
          include: { subtarefas: true },
        },
        rdos: {
          orderBy: { data: "desc" },
          take: 5,
          select: {
            id: true,
            data: true,
            clima: true,
            anotacoes: true,
            atividades: {
              select: { descricao: true, percentual: true, status: true },
            },
          },
        },
      },
    });

    if (!obra || !obra.portalAtivo) {
      return NextResponse.json(
        { error: "Portal não encontrado" },
        { status: 404 },
      );
    }

    // IMPORTANTE: nunca expor custos, margem, fornecedores ou pagamentos
    const dadosPublicos = {
      titulo: obra.portalTitulo || `Obra ${obra.centroCusto}`,
      cliente: obra.cliente?.nome,
      tipo: obra.tipo,
      status: obra.status,
      endereco: obra.endereco,
      inicio: obra.inicio,
      previsaoFim: obra.previsaoFim,
      etapas: obra.etapas.map((e) => ({
        nome: e.nome,
        status: e.status,
        percentual: e.percentual,
        inicioPlano: e.inicioPlano,
        fimPlano: e.fimPlano,
        subtarefas: e.subtarefas.map((s) => ({
          nome: s.nome,
          status: s.status,
          percentual: s.percentual,
        })),
      })),
      diario: obra.rdos.map((r) => ({
        data: r.data,
        clima: r.clima,
        resumo: r.anotacoes,
        atividades: r.atividades,
      })),
    };

    return NextResponse.json(dadosPublicos);
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
