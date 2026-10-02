"use client";

import { useEffect, useState } from "react";
import * as S from "@/lib/styles";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, Legend,
} from "recharts";
import {
  Building2, TrendingUp, TrendingDown, Wallet,
  ArrowUpRight, ArrowDownRight, Minus,
} from "lucide-react";

// ============================================================================
// INTERFACES
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
interface Orcamento { status: string; valor: number; createdAt: string }
interface Lancamento { tipo: string; valor: number; data: string; categoria: string }

// ============================================================================
// CONSTANTES
// ============================================================================
const CORES_PIZZA = ["#1B5FA6", "#1A7A4A", "#C47A0A", "#C0392B", "#7C3AED"];

const STATUS_OBRA: Record<string, { label: string; bg: string; color: string }> = {
  andamento:  { label: "Em andamento", bg: "#E3EDF8", color: "#1B5FA6" },
  execucao:   { label: "Execução",     bg: "#FDF0D5", color: "#C47A0A" },
  finalizada: { label: "Finalizada",   bg: "#E2F2EB", color: "#1A7A4A" },
  pausada:    { label: "Pausada",      bg: "#FCEAE8", color: "#C0392B" },
};

const STATUS_ORC_CORES: Record<string, string> = {
  enviado: "#1B5FA6", negociacao: "#C47A0A",
  aprovado: "#1A7A4A", recusado: "#C0392B", expirado: "#94A3B8",
};

// ============================================================================
// HELPERS
// ============================================================================
function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function fmtShort(v: number) {
  if (v >= 1000000) return `R$${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000)    return `R$${(v / 1000).toFixed(0)}k`;
  return `R$${v}`;
}

// ============================================================================
// SUBCOMPONENTES
// ============================================================================

// Card de métrica superior — com ícone, tendência e cor de destaque
function MetricCard({
  label, value, sub, color, icon: Icon, trend,
}: {
  label: string; value: string; sub?: string; color?: string;
  icon: React.ElementType; trend?: "up" | "down" | "neutral";
}) {
  const TrendIcon =
    trend === "up" ? ArrowUpRight :
    trend === "down" ? ArrowDownRight : Minus;
  const trendColor =
    trend === "up" ? "var(--success)" :
    trend === "down" ? "var(--danger)" : "var(--text-muted)";

  return (
    <div style={{
      ...S.metricCard,
      display: "flex", flexDirection: "column", gap: "10px",
      transition: "box-shadow var(--transition)",
    }}>
      {/* Topo: label + ícone */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {label}
        </span>
        <div style={{ width: 32, height: 32, borderRadius: "var(--radius-sm)", background: color ? `${color}18` : "var(--bg-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={16} color={color || "var(--text-secondary)"} />
        </div>
      </div>
      {/* Valor principal */}
      <div style={{ fontSize: "22px", fontWeight: 700, color: color || "var(--text-primary)", letterSpacing: "-0.5px", lineHeight: 1 }}>
        {value}
      </div>
      {/* Sub-info + tendência */}
      {sub && (
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {trend && <TrendIcon size={13} color={trendColor} />}
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{sub}</span>
        </div>
      )}
    </div>
  );
}

// Tooltip customizado para os gráficos — respeita o tema
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-sm)", padding: "10px 14px",
      boxShadow: "var(--shadow-md)", fontSize: "12px",
    }}>
      <p style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
          <span style={{ color: "var(--text-secondary)" }}>{p.name}:</span>
          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
            {typeof p.value === "number" ? fmt(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// Saldo mensal do fluxo de caixa — linha separada embaixo do gráfico
function SaldoMensal({ dados }: { dados: { name: string; Entradas: number; Saídas: number }[] }) {
  const comSaldo = dados.map(d => ({ ...d, Saldo: d.Entradas - d.Saídas }));
  const mesesComDados = comSaldo.filter(d => d.Entradas > 0 || d.Saídas > 0);
  if (mesesComDados.length === 0) return null;
  return (
    <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
      {mesesComDados.map((d, i) => {
        const positivo = d.Saldo >= 0;
        return (
          <div key={i} style={{
            flex: "1 1 80px", minWidth: "80px",
            background: positivo ? "var(--success-light)" : "var(--danger-light)",
            borderRadius: "var(--radius-sm)", padding: "6px 8px", textAlign: "center",
          }}>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "2px" }}>{d.name}</div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: positivo ? "var(--success)" : "var(--danger)" }}>
              {positivo ? "+" : ""}{fmtShort(d.Saldo)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function DashboardPage() {
  const [obras, setObras]             = useState<Obra[]>([]);
  const [orcamentos, setOrcamentos]   = useState<Orcamento[]>([]);
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [oRes, orcRes, lRes] = await Promise.all([
          fetch("/api/obras"), fetch("/api/orcamentos"), fetch("/api/lancamentos"),
        ]);
        const [o, orc, l] = await Promise.all([oRes.json(), orcRes.json(), lRes.json()]);
        setObras(Array.isArray(o) ? o : []);
        setOrcamentos(Array.isArray(orc) ? orc : []);
        setLancamentos(Array.isArray(l) ? l : []);
      } catch (e) {
        console.error("Erro ao carregar dashboard:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-muted)", padding: "40px 0" }}>
      <div style={{ width: 16, height: 16, border: "2px solid var(--primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      Carregando dados...
    </div>
  );

  // ── Métricas gerais ──────────────────────────────────────────────────────
  const receitaTotal  = obras.reduce((a, o) => a + o.contrato, 0);
  const gastoTotal    = obras.reduce((a, o) => a + o.gastoMat + o.gastoMO + o.gastoEsporadico, 0);
  const margemMedia   = receitaTotal > 0 ? (((receitaTotal - gastoTotal) / receitaTotal) * 100).toFixed(0) : "0";
  const orcAprovados  = orcamentos.filter(o => o.status === "aprovado").length;
  const taxaConversao = orcamentos.length > 0 ? Math.round((orcAprovados / orcamentos.length) * 100) : 0;
  const totalEntradas = lancamentos.filter(l => l.tipo === "entrada").reduce((a, l) => a + l.valor, 0);
  const totalSaidas   = lancamentos.filter(l => l.tipo === "saida").reduce((a, l) => a + l.valor, 0);
  const saldoCaixa    = totalEntradas - totalSaidas;

  // ── Dados para gráficos ──────────────────────────────────────────────────

  // Barras: orçado vs realizado
  const dadosBarras = obras.map(o => ({
    name: o.centroCusto,
    Orçado:    o.orcamentoMat + o.orcamentoMO,
    Realizado: o.gastoMat + o.gastoMO + o.gastoEsporadico,
  }));

  // Pizza: distribuição de gastos
  const dadosPizza = [
    { name: "Materiais",   value: obras.reduce((a, o) => a + o.gastoMat, 0) },
    { name: "Mão de obra", value: obras.reduce((a, o) => a + o.gastoMO, 0) },
    { name: "Esporádicos", value: obras.reduce((a, o) => a + o.gastoEsporadico, 0) },
  ].filter(d => d.value > 0);

  // Área: fluxo de caixa — últimos 6 meses
  const hoje = new Date();
  const meses = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - 5 + i, 1);
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
    };
  });
  const dadosFluxo = meses.map(m => {
    const doMes = lancamentos.filter(l => l.data?.startsWith(m.key));
    return {
      name: m.label,
      Entradas: doMes.filter(l => l.tipo === "entrada").reduce((a, l) => a + l.valor, 0),
      Saídas:   doMes.filter(l => l.tipo === "saida").reduce((a, l) => a + l.valor, 0),
    };
  });

  // Pipeline de orçamentos
  const dadosPipeline = [
    { name: "Enviado",     key: "enviado" },
    { name: "Negociação",  key: "negociacao" },
    { name: "Aprovado",    key: "aprovado" },
    { name: "Recusado",    key: "recusado" },
    { name: "Expirado",    key: "expirado" },
  ].map(s => ({
    name: s.name,
    Qtd: orcamentos.filter(o => o.status === s.key).length,
    fill: STATUS_ORC_CORES[s.key],
  })).filter(d => d.Qtd > 0);

  const mg = Number(margemMedia);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

      {/* ── 1. CARDS DE MÉTRICAS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px" }}>
        <MetricCard
          label="Obras ativas" icon={Building2}
          value={String(obras.length)} sub="Em andamento agora"
          color="var(--primary)" trend="neutral"
        />
        <MetricCard
          label="Receita contratada" icon={Wallet}
          value={fmt(receitaTotal)} sub="Total de contratos"
          color="var(--text-primary)"
        />
        <MetricCard
          label="Saldo de caixa" icon={saldoCaixa >= 0 ? TrendingUp : TrendingDown}
          value={fmt(saldoCaixa)}
          sub={`${fmt(totalEntradas)} entradas · ${fmt(totalSaidas)} saídas`}
          color={saldoCaixa >= 0 ? "var(--success)" : "var(--danger)"}
          trend={saldoCaixa >= 0 ? "up" : "down"}
        />
        <MetricCard
          label="Margem média" icon={TrendingUp}
          value={`${mg}%`}
          sub={`Conversão de orçamentos: ${taxaConversao}%`}
          color={mg >= 30 ? "var(--success)" : mg >= 15 ? "var(--warning)" : "var(--danger)"}
          trend={mg >= 30 ? "up" : mg >= 15 ? "neutral" : "down"}
        />
      </div>

      {/* ── 2. ORÇADO VS REALIZADO + DISTRIBUIÇÃO ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "14px" }}>

        <div style={S.card}>
          <h3 style={S.cardTitle}>Orçado vs Realizado por obra</h3>
          {dadosBarras.length === 0 ? (
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Nenhuma obra cadastrada.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dadosBarras} barGap={4} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={fmtShort} tick={{ fontSize: 11, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} width={52} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: "var(--text-secondary)", paddingTop: 8 }} />
                <Bar dataKey="Orçado"    fill="var(--primary)"  radius={[4,4,0,0]} maxBarSize={40} />
                <Bar dataKey="Realizado" fill="var(--danger)"   radius={[4,4,0,0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={S.card}>
          <h3 style={S.cardTitle}>Distribuição de gastos</h3>
          {dadosPizza.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 0", color: "var(--text-muted)", fontSize: "13px" }}>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>💰</div>
              Sem gastos registrados ainda.
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={dadosPizza} dataKey="value" cx="50%" cy="50%" outerRadius={62} innerRadius={36} paddingAngle={3}>
                    {dadosPizza.map((_, i) => <Cell key={i} fill={CORES_PIZZA[i % CORES_PIZZA.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginTop: "6px" }}>
                {dadosPizza.map((d, i) => {
                  const pct = gastoTotal > 0 ? Math.round((d.value / gastoTotal) * 100) : 0;
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: CORES_PIZZA[i], flexShrink: 0 }} />
                        <span style={{ color: "var(--text-secondary)" }}>{d.name}</span>
                      </div>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <span style={{ fontSize: "10px", color: "var(--text-muted)", background: "var(--bg-muted)", padding: "1px 5px", borderRadius: "4px" }}>{pct}%</span>
                        <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{fmtShort(d.value)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── 3. FLUXO DE CAIXA + PIPELINE ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "14px" }}>

        <div style={S.card}>
          {/* Header com resumo inline */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
            <h3 style={{ ...S.cardTitle, margin: 0 }}>Fluxo de caixa — últimos 6 meses</h3>
            <div style={{ display: "flex", gap: "12px", fontSize: "11px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--success)" }} />
                <span style={{ color: "var(--text-muted)" }}>Entradas</span>
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--danger)" }} />
                <span style={{ color: "var(--text-muted)" }}>Saídas</span>
              </span>
            </div>
          </div>

          {lancamentos.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 0", color: "var(--text-muted)", fontSize: "13px" }}>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>📈</div>
              Registre lançamentos na aba Financeiro<br />para visualizar o fluxo aqui.
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={190}>
                <AreaChart data={dadosFluxo} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradEntradas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#1A7A4A" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#1A7A4A" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="gradSaidas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#C0392B" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#C0392B" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={fmtShort} tick={{ fontSize: 11, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} width={52} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="Entradas" stroke="#1A7A4A" strokeWidth={2.5} fill="url(#gradEntradas)" dot={{ r: 4, fill: "#1A7A4A", strokeWidth: 0 }} activeDot={{ r: 5 }} />
                  <Area type="monotone" dataKey="Saídas"   stroke="#C0392B" strokeWidth={2.5} fill="url(#gradSaidas)"   dot={{ r: 4, fill: "#C0392B", strokeWidth: 0 }} activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
              {/* Saldo por mês embaixo do gráfico */}
              <SaldoMensal dados={dadosFluxo} />
            </>
          )}
        </div>

        <div style={S.card}>
          <h3 style={S.cardTitle}>Pipeline de orçamentos</h3>
          {dadosPipeline.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 0", color: "var(--text-muted)", fontSize: "13px" }}>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>📋</div>
              Nenhum orçamento cadastrado.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dadosPipeline} layout="vertical" barSize={20} margin={{ left: 0 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={78} tick={{ fontSize: 11, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} formatter={(v: number) => [`${v} orçamento(s)`, "Qtd"]} />
                <Bar dataKey="Qtd" radius={[0, 6, 6, 0]}>
                  {dadosPipeline.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── 4. TABELA DE OBRAS ── */}
      <div style={S.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <h3 style={{ ...S.cardTitle, margin: 0 }}>Obras em andamento</h3>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{obras.length} obra(s)</span>
        </div>

        {obras.length === 0 ? (
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Nenhuma obra cadastrada.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={S.table}>
              <thead>
                <tr>
                  {["Centro Custo", "Cliente", "Tipo", "Contrato", "Gasto", "Margem", "Status"].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {obras.map(obra => {
                  const gasto = obra.gastoMat + obra.gastoMO + obra.gastoEsporadico;
                  const margem = obra.contrato > 0
                    ? Number(((( obra.contrato - gasto) / obra.contrato) * 100).toFixed(0))
                    : 0;
                  const mgColor = margem >= 30 ? "var(--success)" : margem >= 15 ? "var(--warning)" : "var(--danger)";
                  const stCfg = STATUS_OBRA[obra.status] || { label: obra.status, bg: "var(--bg-muted)", color: "var(--text-secondary)" };
                  // Barra de progresso do orçamento consumido
                  const pctGasto = obra.contrato > 0 ? Math.min(100, Math.round((gasto / obra.contrato) * 100)) : 0;

                  return (
                    <tr key={obra.id}>
                      <td style={{ ...S.td, fontWeight: 600 }}>{obra.centroCusto}</td>
                      <td style={{ ...S.td, color: "var(--text-secondary)" }}>{obra.cliente?.nome}</td>
                      <td style={S.td}>
                        <span style={{ background: "var(--primary-light)", color: "var(--primary)", padding: "2px 8px", borderRadius: "var(--radius-full)", fontSize: "11px", fontWeight: 600 }}>
                          {obra.tipo}
                        </span>
                      </td>
                      <td style={S.td}>{fmt(obra.contrato)}</td>
                      <td style={S.td}>
                        <div>
                          <span style={{ color: gasto > 0 ? "var(--danger)" : "var(--text-muted)", fontWeight: gasto > 0 ? 600 : 400 }}>
                            {fmt(gasto)}
                          </span>
                          {/* Barra de consumo do orçamento */}
                          <div style={{ marginTop: "4px", background: "var(--bg-muted)", borderRadius: "99px", height: "4px", width: "80px", overflow: "hidden" }}>
                            <div style={{ width: `${pctGasto}%`, height: "100%", background: pctGasto > 90 ? "var(--danger)" : pctGasto > 70 ? "var(--warning)" : "var(--success)", borderRadius: "99px" }} />
                          </div>
                        </div>
                      </td>
                      <td style={{ ...S.td, fontWeight: 700, color: mgColor }}>{margem}%</td>
                      <td style={S.td}>
                        <span style={{ background: stCfg.bg, color: stCfg.color, padding: "3px 9px", borderRadius: "var(--radius-full)", fontSize: "11px", fontWeight: 600 }}>
                          {stCfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
