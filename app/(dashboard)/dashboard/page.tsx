"use client";

import { useEffect, useState } from "react";
import * as S from "@/lib/styles";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";

// ============================================================================
// TIPAGENS (INTERFACES)
// ============================================================================
interface Obra {
  id: string;
  centroCusto: string;
  tipo: string;
  status: string;
  contrato: number;
  orcamentoMat: number;
  orcamentoMO: number;
  gastoMat: number;
  gastoMO: number;
  gastoEsporadico: number;
  cliente: { nome: string };
}

interface Orcamento {
  status: string;
  valor: number;
  createdAt: string;
}

interface Lancamento {
  tipo: string;
  valor: number;
  data: string;
}

// ============================================================================
// CONSTANTES E CONFIGURAÇÕES DE GRÁFICOS
// ============================================================================
const CORES = [
  "#3B82F6", // Azul suave
  "#10B981", // Verde esmeralda
  "#EF4444", // Vermelho coral (menos agressivo)
  "#F59E0B", // Laranja/Âmbar
  "#8B5CF6", // Roxo moderno
  "#64748B", // Cinza slate
];

const STATUS_LABELS: Record<string, string> = {
  enviado: "Enviado",
  negociacao: "Negociação",
  aprovado: "Aprovado",
  recusado: "Recusado",
  expirado: "Expirado",
};

const STATUS_CORES: Record<string, string> = {
  enviado: "#3B82F6",
  negociacao: "#F59E0B",
  aprovado: "#10B981",
  recusado: "#EF4444",
  expirado: "#94A3B8",
};

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================
function formatMoney(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatMoneyShort(v: number) {
  return v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`;
}

// ============================================================================
// COMPONENTES MENORES
// ============================================================================
function MetricCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div style={S.metricCard}>
      <div
        style={{
          fontSize: "11px",
          color: "var(--text-secondary)",
          marginBottom: "6px",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "22px",
          fontWeight: 700,
          color: color || "var(--text-primary)",
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          style={{
            fontSize: "11px",
            color: "var(--text-muted)",
            marginTop: "3px",
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL: DASHBOARD
// ============================================================================
export default function DashboardPage() {
  // Estados da aplicação
  const [obras, setObras] = useState<Obra[]>([]);
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [loading, setLoading] = useState(true);

  // Busca inicial de dados da API
  useEffect(() => {
    async function loadData() {
      try {
        const [oRes, orcRes, lancRes] = await Promise.all([
          fetch("/api/obras"),
          fetch("/api/orcamentos"),
          fetch("/api/lancamentos"),
        ]);

        const [oData, orcData, lData] = await Promise.all([
          oRes.json().catch(() => []),
          orcRes.json().catch(() => []),
          lancRes.json().catch(() => []),
        ]);

        setObras(Array.isArray(oData) ? oData : []);
        setOrcamentos(Array.isArray(orcData) ? orcData : []);
        setLancamentos(Array.isArray(lData) ? lData : []);
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div style={{ color: "var(--text-muted)", fontSize: "14px" }}>
        Carregando dados...
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // CÁLCULOS DE MÉTRICAS GERAIS
  // --------------------------------------------------------------------------
  const receitaTotal = obras.reduce((a, o) => a + o.contrato, 0);
  const gastoTotal = obras.reduce(
    (a, o) => a + o.gastoMat + o.gastoMO + o.gastoEsporadico,
    0,
  );
  const margemMedia =
    receitaTotal > 0
      ? (((receitaTotal - gastoTotal) / receitaTotal) * 100).toFixed(0)
      : "0";
  const orcAprovados = orcamentos.filter((o) => o.status === "aprovado").length;
  const taxaConversao =
    orcamentos.length > 0
      ? Math.round((orcAprovados / orcamentos.length) * 100)
      : 0;

  // --------------------------------------------------------------------------
  // PREPARAÇÃO DE DADOS PARA OS GRÁFICOS
  // --------------------------------------------------------------------------

  // Gráfico de Barras: Orçado vs Realizado
  const dadosObras = obras.map((o) => ({
    name: o.centroCusto,
    Orçado: o.orcamentoMat + o.orcamentoMO,
    Realizado: o.gastoMat + o.gastoMO + o.gastoEsporadico,
  }));

  // Gráfico de Pizza: Distribuição de Gastos
  const totalMat = obras.reduce((a, o) => a + o.gastoMat, 0);
  const totalMO = obras.reduce((a, o) => a + o.gastoMO, 0);
  const totalEsp = obras.reduce((a, o) => a + o.gastoEsporadico, 0);
  const dadosPizza = [
    { name: "Materiais", value: totalMat },
    { name: "Mão de obra", value: totalMO },
    { name: "Esporádicos", value: totalEsp },
  ].filter((d) => d.value > 0);

  // Gráfico de Pipeline: Conversão de Orçamentos
  const dadosPipeline = Object.entries(STATUS_LABELS).map(([key, label]) => ({
    name: label,
    Quantidade: orcamentos.filter((o) => o.status === key).length,
    fill: STATUS_CORES[key],
  }));

  // Gráfico de Linha: Fluxo de Caixa Mensal (Últimos 6 meses)
  const hoje = new Date();
  const meses = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - 5 + i, 1);
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
    };
  });

  const dadosFluxo = meses.map((m) => {
    const doMes = lancamentos.filter((l) => l.data?.startsWith(m.key));
    return {
      name: m.label,
      Entradas: doMes
        .filter((l) => l.tipo === "entrada")
        .reduce((a, l) => a + l.valor, 0),
      Saídas: doMes
        .filter((l) => l.tipo === "saida")
        .reduce((a, l) => a + l.valor, 0),
    };
  });

  // Estilo compartilhado para os tooltips dos gráficos
  const tooltipStyle = {
    background: "var(--bg-primary)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    fontSize: "12px",
    color: "var(--text-primary)",
  };

  // ============================================================================
  // RENDERIZAÇÃO DA INTERFACE
  // ============================================================================
  return (
    <div>
      {/* 1. CARDS DE MÉTRICAS SUPERIORES */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <MetricCard
          label="Obras ativas"
          value={String(obras.length)}
          sub="No momento"
          color="var(--blue)"
        />
        <MetricCard
          label="Receita contratada"
          value={formatMoney(receitaTotal)}
          sub="Total contratos"
        />
        <MetricCard
          label="Total gasto"
          value={formatMoney(gastoTotal)}
          sub="Todas as obras"
          color="var(--red)"
        />
        <MetricCard
          label="Margem média"
          value={`${margemMedia}%`}
          sub={`Conversão: ${taxaConversao}%`}
          color={Number(margemMedia) >= 30 ? "var(--green)" : "var(--amber)"}
        />
      </div>

      {/* 2. LINHA DE GRÁFICOS 1: BARRAS E PIZZA */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr",
          gap: "14px",
          marginBottom: "14px",
        }}
      >
        {/* Gráfico: Orçado vs Realizado */}
        <div style={S.card}>
          <h3 style={S.cardTitle}>Orçado vs Realizado por obra</h3>
          {dadosObras.length === 0 ? (
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              Nenhuma obra cadastrada.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dadosObras} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
                />
                <YAxis
                  tickFormatter={formatMoneyShort}
                  tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v: number) => formatMoney(v)}
                />
                <Legend
                  wrapperStyle={{
                    fontSize: 12,
                    color: "var(--text-secondary)",
                  }}
                />
                <Bar
                  dataKey="Orçado"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={45}
                />
                <Bar
                  dataKey="Realizado"
                  fill="#EF4444"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={45}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Gráfico: Distribuição de Gastos */}
        <div style={S.card}>
          <h3 style={S.cardTitle}>Distribuição de gastos</h3>
          {dadosPizza.length === 0 ? (
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              Sem gastos registrados.
            </p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={dadosPizza}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    outerRadius={65}
                    innerRadius={38}
                  >
                    {dadosPizza.map((_, i) => (
                      <Cell key={i} fill={CORES[i % CORES.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(v: number) => formatMoney(v)}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Legenda customizada da Pizza */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  marginTop: "8px",
                }}
              >
                {dadosPizza.map((d, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: "12px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <div
                        style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "2px",
                          background: CORES[i],
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ color: "var(--text-secondary)" }}>
                        {d.name}
                      </span>
                    </div>
                    <span
                      style={{ fontWeight: 600, color: "var(--text-primary)" }}
                    >
                      {formatMoney(d.value)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 3. LINHA DE GRÁFICOS 2: FLUXO E PIPELINE */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr",
          gap: "14px",
          marginBottom: "14px",
        }}
      >
        {/* Gráfico: Fluxo de Caixa */}
        <div style={S.card}>
          <h3 style={S.cardTitle}>Fluxo de caixa — últimos 6 meses</h3>
          {lancamentos.length === 0 ? (
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              Nenhum lançamento registrado.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={dadosFluxo}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
                />
                <YAxis
                  tickFormatter={formatMoneyShort}
                  tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v: number) => formatMoney(v)}
                />
                <Legend
                  wrapperStyle={{
                    fontSize: 12,
                    color: "var(--text-secondary)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="Entradas"
                  stroke="var(--green)"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Saídas"
                  stroke="var(--red)"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Gráfico: Pipeline de Orçamentos */}
        <div style={S.card}>
          <h3 style={S.cardTitle}>Pipeline de orçamentos</h3>
          {orcamentos.length === 0 ? (
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              Nenhum orçamento cadastrado.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dadosPipeline} layout="vertical" barSize={18}>
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={80}
                  tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v: number) => [`${v} orçamento(s)`, "Quantidade"]}
                />
                <Bar dataKey="Quantidade" radius={[0, 4, 4, 0]}>
                  {dadosPipeline.map((d, i) => (
                    <Cell key={i} fill={d.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 4. TABELA: OBRAS EM ANDAMENTO */}
      <div style={S.card}>
        <h3 style={S.cardTitle}>Obras em andamento</h3>
        {obras.length === 0 ? (
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Nenhuma obra cadastrada.
          </p>
        ) : (
          <table style={S.table}>
            <thead>
              <tr>
                {[
                  "Centro Custo",
                  "Cliente",
                  "Tipo",
                  "Contrato",
                  "Gasto",
                  "Margem",
                  "Status",
                ].map((h) => (
                  <th key={h} style={S.th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {obras.map((obra) => {
                const gasto =
                  obra.gastoMat + obra.gastoMO + obra.gastoEsporadico;
                const mg =
                  obra.contrato > 0
                    ? Number(
                        (
                          ((obra.contrato - gasto) / obra.contrato) *
                          100
                        ).toFixed(0),
                      )
                    : 0;

                // Definição de cores de acordo com a saúde financeira (Margem)
                const mgColor =
                  mg >= 35
                    ? "var(--green)"
                    : mg >= 20
                      ? "var(--amber)"
                      : "var(--red)";

                return (
                  <tr key={obra.id}>
                    <td style={{ ...S.td, fontWeight: 600 }}>
                      {obra.centroCusto}
                    </td>
                    <td style={S.td}>{obra.cliente?.nome}</td>
                    <td style={S.td}>
                      <span
                        style={{
                          background: "var(--bg-tertiary)",
                          color: "var(--blue)",
                          padding: "2px 8px",
                          borderRadius: "10px",
                          fontSize: "11px",
                          fontWeight: 600,
                        }}
                      >
                        {obra.tipo}
                      </span>
                    </td>
                    <td style={S.td}>{formatMoney(obra.contrato)}</td>
                    <td style={{ ...S.td, color: "var(--red)" }}>
                      {formatMoney(gasto)}
                    </td>
                    <td style={{ ...S.td, fontWeight: 700, color: mgColor }}>
                      {mg}%
                    </td>
                    <td style={S.td}>
                      <span
                        style={{
                          background:
                            obra.status === "finalizada"
                              ? "#EAF3DE"
                              : "var(--bg-tertiary)",
                          color:
                            obra.status === "finalizada"
                              ? "#27500A"
                              : "var(--amber)",
                          padding: "2px 8px",
                          borderRadius: "10px",
                          fontSize: "11px",
                          fontWeight: 600,
                        }}
                      >
                        {obra.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
