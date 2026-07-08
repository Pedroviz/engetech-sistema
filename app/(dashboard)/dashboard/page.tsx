"use client";

import { useEffect, useState } from "react";
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

const CORES = [
  "#185FA5",
  "#1D9E75",
  "#E24B4A",
  "#BA7517",
  "#8B5CF6",
  "#6B7280",
];

function formatMoney(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

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
    <div
      style={{
        background: "#fff",
        border: "1px solid #e0e0e0",
        borderRadius: "10px",
        padding: "16px 18px",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          color: "#888",
          marginBottom: "6px",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </div>
      <div
        style={{ fontSize: "22px", fontWeight: 700, color: color || "#1a1a1a" }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: "11px", color: "#aaa", marginTop: "3px" }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function CardGrafico({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e0e0e0",
        borderRadius: "10px",
        padding: "18px 20px",
      }}
    >
      <h3
        style={{
          fontSize: "11px",
          fontWeight: 600,
          color: "#888",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: "16px",
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

const customTooltipStyle = {
  background: "#fff",
  border: "1px solid #e0e0e0",
  borderRadius: "8px",
  fontSize: "12px",
  padding: "8px 12px",
};

export default function DashboardPage() {
  const [obras, setObras] = useState<Obra[]>([]);
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [oRes, orcRes, lancRes] = await Promise.all([
          fetch("/api/obras"),
          fetch("/api/orcamentos"),
          fetch("/api/lancamentos"),
        ]);
        const oData = await oRes.json();
        const orcData = await orcRes.json();
        const lData = await lancRes.json();
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

  if (loading)
    return (
      <div style={{ color: "#888", fontSize: "14px" }}>Carregando dados...</div>
    );

  // ── Métricas gerais ──────────────────────────────────────
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

  // ── Gráfico 1: Orçado vs Realizado por obra ──────────────
  const dadosObras = obras.map((o) => ({
    name: o.centroCusto,
    Orçado: o.orcamentoMat + o.orcamentoMO,
    Realizado: o.gastoMat + o.gastoMO + o.gastoEsporadico,
  }));

  // ── Gráfico 2: Pizza — distribuição de gastos ────────────
  const totalMat = obras.reduce((a, o) => a + o.gastoMat, 0);
  const totalMO = obras.reduce((a, o) => a + o.gastoMO, 0);
  const totalEsp = obras.reduce((a, o) => a + o.gastoEsporadico, 0);
  const dadosPizza = [
    { name: "Materiais", value: totalMat },
    { name: "Mão de obra", value: totalMO },
    { name: "Esporádicos", value: totalEsp },
  ].filter((d) => d.value > 0);

  // ── Gráfico 3: Pipeline de orçamentos ───────────────────
  const STATUS_LABELS: Record<string, string> = {
    enviado: "Enviado",
    negociacao: "Negociação",
    aprovado: "Aprovado",
    recusado: "Recusado",
    expirado: "Expirado",
  };
  const STATUS_CORES: Record<string, string> = {
    enviado: "#185FA5",
    negociacao: "#BA7517",
    aprovado: "#1D9E75",
    recusado: "#E24B4A",
    expirado: "#888",
  };
  const dadosPipeline = Object.entries(STATUS_LABELS).map(([key, label]) => ({
    name: label,
    Quantidade: orcamentos.filter((o) => o.status === key).length,
    fill: STATUS_CORES[key],
  }));

  // ── Gráfico 4: Fluxo de caixa ────────────────────────────
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

  const formatMoneyShort = (v: number) =>
    v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`;

  return (
    <div>
      {/* Métricas */}
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
          color="#185FA5"
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
          color="#E24B4A"
        />
        <MetricCard
          label="Margem média"
          value={`${margemMedia}%`}
          sub={`Conversão: ${taxaConversao}%`}
          color={Number(margemMedia) >= 30 ? "#1D9E75" : "#BA7517"}
        />
      </div>

      {/* Linha 1: Orçado vs Realizado + Pizza */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr",
          gap: "14px",
          marginBottom: "14px",
        }}
      >
        <CardGrafico title="Orçado vs Realizado por obra">
          {dadosObras.length === 0 ? (
            <p style={{ fontSize: "13px", color: "#aaa" }}>
              Nenhuma obra cadastrada.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dadosObras} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis
                  tickFormatter={formatMoneyShort}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={customTooltipStyle}
                  formatter={(v: number) => formatMoney(v)}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Orçado" fill="#185FA5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Realizado" fill="#E24B4A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardGrafico>

        <CardGrafico title="Distribuição de gastos">
          {dadosPizza.length === 0 ? (
            <p style={{ fontSize: "13px", color: "#aaa" }}>
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
                    contentStyle={customTooltipStyle}
                    formatter={(v: number) => formatMoney(v)}
                  />
                </PieChart>
              </ResponsiveContainer>
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
                      <span style={{ color: "#666" }}>{d.name}</span>
                    </div>
                    <span style={{ fontWeight: 600 }}>
                      {formatMoney(d.value)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardGrafico>
      </div>

      {/* Linha 2: Fluxo de caixa + Pipeline orçamentos */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr",
          gap: "14px",
          marginBottom: "14px",
        }}
      >
        <CardGrafico title="Fluxo de caixa — últimos 6 meses">
          {lancamentos.length === 0 ? (
            <p style={{ fontSize: "13px", color: "#aaa" }}>
              Nenhum lançamento registrado.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={dadosFluxo}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis
                  tickFormatter={formatMoneyShort}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={customTooltipStyle}
                  formatter={(v: number) => formatMoney(v)}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="Entradas"
                  stroke="#1D9E75"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Saídas"
                  stroke="#E24B4A"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardGrafico>

        <CardGrafico title="Pipeline de orçamentos">
          {orcamentos.length === 0 ? (
            <p style={{ fontSize: "13px", color: "#aaa" }}>
              Nenhum orçamento cadastrado.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dadosPipeline} layout="vertical" barSize={18}>
                <XAxis
                  type="number"
                  tick={{ fontSize: 11 }}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={80}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={customTooltipStyle}
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
        </CardGrafico>
      </div>

      {/* Tabela de obras */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e0e0e0",
          borderRadius: "10px",
          padding: "18px 20px",
        }}
      >
        <h3
          style={{
            fontSize: "11px",
            fontWeight: 600,
            color: "#888",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "14px",
          }}
        >
          Obras em andamento
        </h3>
        {obras.length === 0 ? (
          <p style={{ fontSize: "13px", color: "#aaa" }}>
            Nenhuma obra cadastrada ainda.
          </p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "13px",
            }}
          >
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
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "0 0 10px 0",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#888",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
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
                const mgColor =
                  mg >= 35 ? "#1D9E75" : mg >= 20 ? "#BA7517" : "#E24B4A";
                return (
                  <tr key={obra.id}>
                    <td
                      style={{
                        padding: "10px 0",
                        borderBottom: "1px solid #f0f0f0",
                        fontWeight: 600,
                      }}
                    >
                      {obra.centroCusto}
                    </td>
                    <td
                      style={{
                        padding: "10px 0",
                        borderBottom: "1px solid #f0f0f0",
                        color: "#555",
                      }}
                    >
                      {obra.cliente?.nome}
                    </td>
                    <td
                      style={{
                        padding: "10px 0",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      <span
                        style={{
                          background: "#E6F1FB",
                          color: "#0C447C",
                          padding: "2px 8px",
                          borderRadius: "10px",
                          fontSize: "11px",
                          fontWeight: 600,
                        }}
                      >
                        {obra.tipo}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "10px 0",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      {formatMoney(obra.contrato)}
                    </td>
                    <td
                      style={{
                        padding: "10px 0",
                        borderBottom: "1px solid #f0f0f0",
                        color: "#E24B4A",
                      }}
                    >
                      {formatMoney(gasto)}
                    </td>
                    <td
                      style={{
                        padding: "10px 0",
                        borderBottom: "1px solid #f0f0f0",
                        fontWeight: 700,
                        color: mgColor,
                      }}
                    >
                      {mg}%
                    </td>
                    <td
                      style={{
                        padding: "10px 0",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      <span
                        style={{
                          background:
                            obra.status === "finalizada"
                              ? "#EAF3DE"
                              : "#FAEEDA",
                          color:
                            obra.status === "finalizada"
                              ? "#27500A"
                              : "#633806",
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
