// lib/dashboard/queries.ts
// Todas as consultas recebem tenantId. Etapa, Material, Pagamento e GastoEsporadico não têm
// tenantId próprio, então são filtradas pelos ids das obras do tenant.
import { prisma } from "@/lib/prisma";
import {
  ORCAMENTO_STATUS,
  STATUS_ATIVAS,
  STATUS_OBRA,
  type StatusObra,
  type StatusOrcamento,
} from "@/lib/dashboard/status";

// Fortaleza é UTC-3 o ano todo (sem horário de verão)
const TZ_OFFSET_MS = 3 * 3600_000;

export type PontoMensal = {
  chave: string; // "2026-10"
  rotulo: string; // "out"
  entradas: number;
  saidas: number;
};

export type ObraResumo = {
  id: string;
  nome: string; // centroCusto
  cliente: string;
  local: string | null;
  status: StatusObra | string;
  progresso: number; // média das etapas, 0-100
  contrato: number;
  orcado: number; // orcamentoMat + orcamentoMO
  gasto: number; // materiais + mão de obra + esporádicos
  previsaoFim: string; // ISO
};

export type OrcamentoResumo = {
  id: string;
  numero: string;
  cliente: string;
  valor: number;
  status: StatusOrcamento | string;
};

export type DashboardData = {
  kpis: {
    obrasAtivas: number;
    obrasTotal: number;
    receitaContratada: number; // soma dos contratos
    totalGasto: number;
    margemMedia: number; // média de (contrato - gasto) / contrato, em %
    conversao: number; // orçamentos aprovados / total, em %
    recebidoMes: number;
    saidasMes: number;
    caixaMes: number;
    pagamentosPendentes: number;
  };
  obras: ObraResumo[];
  serie: PontoMensal[]; // últimos 12 meses, do mais antigo ao atual
  gastosPorTipo: { materiais: number; maoDeObra: number; esporadicos: number };
  statusContagem: Record<StatusObra, number>;
  pipeline: { status: StatusOrcamento; quantidade: number; valor: number }[];
  orcamentosRecentes: OrcamentoResumo[];
};

const chaveDoMes = (d: Date) => {
  const local = new Date(d.getTime() - TZ_OFFSET_MS);
  return `${local.getUTCFullYear()}-${String(local.getUTCMonth() + 1).padStart(2, "0")}`;
};

export async function getDashboardData(tenantId: string): Promise<DashboardData> {
  const agora = new Date(Date.now() - TZ_OFFSET_MS);
  const ano = agora.getUTCFullYear();
  const mes = agora.getUTCMonth();

  // Primeiro dia do mês, 11 meses atrás, à meia-noite de Fortaleza (03:00 UTC)
  const inicioSerie = new Date(Date.UTC(ano, mes - 11, 1, 3));

  // Sem take: todas as obras do tenant entram nos KPIs
  const obras = await prisma.obra.findMany({
    where: { tenantId },
    select: {
      id: true,
      centroCusto: true,
      endereco: true,
      status: true,
      contrato: true,
      orcamentoMat: true,
      orcamentoMO: true,
      previsaoFim: true,
      cliente: { select: { nome: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const ids = obras.map((o) => o.id);

  // Com ids vazios o Prisma retorna listas vazias, então não precisa de ramificação
  const [
    lancamentos,
    materiais,
    pagamentos,
    esporadicos,
    etapas,
    pendentes,
    orcGrupos,
    orcRecentes,
  ] = await Promise.all([
    prisma.lancamento.findMany({
      where: { tenantId, data: { gte: inicioSerie } },
      select: { tipo: true, valor: true, data: true },
    }),
    prisma.material.groupBy({
      by: ["obraId"],
      where: { obraId: { in: ids } },
      _sum: { utilizado: true },
    }),
    prisma.pagamento.groupBy({
      by: ["obraId"],
      where: { obraId: { in: ids } },
      _sum: { total: true },
    }),
    prisma.gastoEsporadico.groupBy({
      by: ["obraId"],
      where: { obraId: { in: ids } },
      _sum: { valor: true },
    }),
    prisma.etapa.groupBy({
      by: ["obraId"],
      where: { obraId: { in: ids } },
      _avg: { percentual: true },
    }),
    prisma.pagamento.aggregate({
      where: { obraId: { in: ids }, status: "pendente" },
      _sum: { total: true },
    }),
    prisma.orcamento.groupBy({
      by: ["status"],
      where: { tenantId },
      _count: { _all: true },
      _sum: { valor: true },
    }),
    prisma.orcamento.findMany({
      where: { tenantId },
      select: {
        id: true,
        numero: true,
        valor: true,
        status: true,
        cliente: { select: { nome: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  const mapMat = new Map(materiais.map((r) => [r.obraId, r._sum.utilizado ?? 0]));
  const mapMO = new Map(pagamentos.map((r) => [r.obraId, r._sum.total ?? 0]));
  const mapEsp = new Map(esporadicos.map((r) => [r.obraId, r._sum.valor ?? 0]));
  const mapProg = new Map(etapas.map((r) => [r.obraId, Math.round(r._avg.percentual ?? 0)]));

  const obrasResumo: ObraResumo[] = obras.map((o) => ({
    id: o.id,
    nome: o.centroCusto,
    cliente: o.cliente.nome,
    local: o.endereco,
    status: o.status,
    progresso: mapProg.get(o.id) ?? 0,
    contrato: o.contrato,
    orcado: o.orcamentoMat + o.orcamentoMO,
    gasto: (mapMat.get(o.id) ?? 0) + (mapMO.get(o.id) ?? 0) + (mapEsp.get(o.id) ?? 0),
    previsaoFim: o.previsaoFim.toISOString(),
  }));

  // Série mensal: 12 meses, mesmo com meses sem lançamento
  const baldes = new Map<string, { entradas: number; saidas: number }>();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(Date.UTC(ano, mes - i, 1, 3));
    baldes.set(chaveDoMes(d), { entradas: 0, saidas: 0 });
  }
  for (const l of lancamentos) {
    const balde = baldes.get(chaveDoMes(l.data));
    if (!balde) continue;
    if (l.tipo === "entrada") balde.entradas += l.valor;
    if (l.tipo === "saida") balde.saidas += l.valor;
  }
  const serie: PontoMensal[] = [...baldes].map(([chave, v]) => {
    const [a, m] = chave.split("-").map(Number);
    const rotulo = new Date(Date.UTC(a, m - 1, 1)).toLocaleDateString("pt-BR", {
      month: "short",
      timeZone: "UTC",
    });
    return { chave, rotulo, entradas: v.entradas, saidas: v.saidas };
  });
  const atual = serie[serie.length - 1];

  const statusContagem = Object.fromEntries(STATUS_OBRA.map((s) => [s, 0])) as Record<StatusObra, number>;
  for (const o of obras) {
    if (o.status in statusContagem) statusContagem[o.status as StatusObra]++;
  }

  // Pipeline de orçamentos, na ordem do funil (estados sem registro entram com zero)
  const pipeline = ORCAMENTO_STATUS.map((s) => {
    const g = orcGrupos.find((x) => x.status === s);
    return { status: s, quantidade: g?._count._all ?? 0, valor: g?._sum.valor ?? 0 };
  });
  const totalOrcamentos = orcGrupos.reduce((a, g) => a + g._count._all, 0);
  const aprovados = pipeline.find((p) => p.status === "aprovado")?.quantidade ?? 0;

  const contratoTotal = obrasResumo.reduce((a, o) => a + o.contrato, 0);
  const comContrato = obrasResumo.filter((o) => o.contrato > 0);
  const margemMedia = comContrato.length
    ? comContrato.reduce((a, o) => a + ((o.contrato - o.gasto) / o.contrato) * 100, 0) / comContrato.length
    : 0;

  const gastosPorTipo = {
    materiais: [...mapMat.values()].reduce((a, v) => a + v, 0),
    maoDeObra: [...mapMO.values()].reduce((a, v) => a + v, 0),
    esporadicos: [...mapEsp.values()].reduce((a, v) => a + v, 0),
  };

  return {
    kpis: {
      obrasAtivas: obras.filter((o) => STATUS_ATIVAS.includes(o.status as StatusObra)).length,
      obrasTotal: obras.length,
      receitaContratada: contratoTotal,
      totalGasto: obrasResumo.reduce((a, o) => a + o.gasto, 0),
      margemMedia: Math.round(margemMedia),
      conversao: totalOrcamentos ? Math.round((aprovados / totalOrcamentos) * 100) : 0,
      recebidoMes: atual.entradas,
      saidasMes: atual.saidas,
      caixaMes: atual.entradas - atual.saidas,
      pagamentosPendentes: pendentes._sum.total ?? 0,
    },
    obras: obrasResumo,
    serie,
    gastosPorTipo,
    statusContagem,
    pipeline,
    orcamentosRecentes: orcRecentes.map((o) => ({
      id: o.id,
      numero: o.numero,
      cliente: o.cliente.nome,
      valor: o.valor,
      status: o.status,
    })),
  };
}

/* ── Acessos de usuários (somente admin) ─────────────────── */

export type UsuarioAcesso = {
  id: string;
  nome: string;
  email: string;
  empresa: string | null;
  role: string;
  cadastro: string; // ISO
};

export type AcessosData = {
  total: number;
  admins: number;
  usuarios: number;
  recentes: UsuarioAcesso[];
};

// User não tem tenantId: a lista é global. Quem chama deve checar role === "admin".
export async function getAcessos(): Promise<AcessosData> {
  const [grupos, recentes] = await Promise.all([
    prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
    prisma.user.findMany({
      select: { id: true, name: true, email: true, empresa: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);
  const contar = (r: string) => grupos.find((g) => g.role === r)?._count._all ?? 0;
  return {
    total: grupos.reduce((a, g) => a + g._count._all, 0),
    admins: contar("admin"),
    usuarios: contar("user"),
    recentes: recentes.map((u) => ({
      id: u.id,
      nome: u.name,
      email: u.email,
      empresa: u.empresa,
      role: u.role,
      cadastro: u.createdAt.toISOString(),
    })),
  };
}
