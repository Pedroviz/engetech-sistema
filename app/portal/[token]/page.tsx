import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await context.params;

    if (!token) {
      return NextResponse.json(
        { error: "Token não fornecido" },
        { status: 400 },
      );
    }

    // Busca a obra através do portalToken único
    const obra = await prisma.obra.findUnique({
      where: { portalToken: token },
      include: {
        cliente: true,
        etapas: {
          include: {
            subtarefas: true,
          },
          orderBy: { ordem: "asc" },
        },
        rdos: {
          include: {
            atividades: true,
            fotos: true,
          },
          orderBy: { data: "desc" },
          take: 10,
        },
      },
    });

    if (!obra || !obra.portalAtivo) {
      return NextResponse.json(
        { error: "Portal inválido ou desativado" },
        { status: 404 },
      );
    }

    // Formata o objeto para coincidir com a interface `Portal` da página
    const dadosPortal = {
      titulo: obra.portalTitulo || `Obra — ${obra.centroCusto}`,
      cliente: obra.cliente?.nome || "Cliente Engetech",
      tipo: obra.tipo,
      status: obra.status,
      endereco: obra.endereco || "",
      inicio: obra.inicio.toISOString(),
      previsaoFim: obra.previsaoFim.toISOString(),
      etapas: obra.etapas.map((etapa) => ({
        nome: etapa.nome,
        status: etapa.status,
        percentual: etapa.percentual,
        inicioPlano: etapa.inicioPlano.toISOString(),
        fimPlano: etapa.fimPlano.toISOString(),
        subtarefas: etapa.subtarefas.map((sub) => ({
          nome: sub.nome,
          status: sub.status,
          percentual: sub.percentual,
        })),
      })),
      diario: obra.rdos.map((rdo) => ({
        data: rdo.data.toISOString(),
        clima: rdo.clima,
        resumo: rdo.anotacoes || "",
        atividades: rdo.atividades.map((ativ) => ({
          descricao: ativ.descricao,
          percentual: ativ.percentual,
          status: ativ.status,
        })),
      })),
    };

    return NextResponse.json(dadosPortal);
  } catch (error) {
    console.error("Erro ao carregar portal do cliente:", error);
    return NextResponse.json(
      { error: "Erro interno ao carregar portal" },
      { status: 500 },
    );
  }
}
