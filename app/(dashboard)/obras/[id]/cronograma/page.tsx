"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface Subtarefa {
  id: string;
  nome: string;
  status: string;
  percentual: number;
  motivo?: string;
}
interface Etapa {
  id: string;
  nome: string;
  ordem: number;
  status: string;
  percentual: number;
  inicioPlano: string;
  fimPlano: string;
  inicioReal?: string;
  fimReal?: string;
  subtarefas: Subtarefa[];
}
interface Ocorrencia {
  id: string;
  causa: string;
  descricao: string;
  diasAtraso: number;
  data: string;
}
interface Obra {
  id: string;
  centroCusto: string;
  inicio: string;
  previsaoFim: string;
  cliente: { nome: string };
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  concluido: { bg: "#EAF3DE", color: "#27500A" },
  andamento: { bg: "#E6F1FB", color: "#0C447C" },
  atraso: { bg: "#FCEBEB", color: "#791F1F" },
  pendente: { bg: "#F1EFE8", color: "#555" },
};

const CAUSAS = [
  "Chuva / clima",
  "Falta de material",
  "Diarista faltou",
  "Liberação do cliente",
  "Autorização prédio/condomínio",
  "Problema no projeto",
  "Outro imprevisto",
];

const lbl: React.CSSProperties = {
  fontSize: "12px",
  color: "#666",
  display: "block",
  marginBottom: "5px",
};
const inp: React.CSSProperties = {
  width: "100%",
  border: "1px solid #e0e0e0",
  borderRadius: "8px",
  padding: "8px 10px",
  fontSize: "13px",
  fontFamily: "inherit",
  background: "#fff",
  outline: "none",
};

function daysBetween(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

export default function CronogramaPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [obra, setObra] = useState<Obra | null>(null);
  const [etapas, setEtapas] = useState<Etapa[]>([]);
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [abertos, setAbertos] = useState<Record<string, boolean>>({});
  const [tab, setTab] = useState<"gantt" | "etapas" | "ocorrencias">("gantt");

  // Forms
  const [showFormEtapa, setShowFormEtapa] = useState(false);
  const [showFormOcorrencia, setShowFormOcorrencia] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formEtapa, setFormEtapa] = useState({
    nome: "",
    ordem: "",
    status: "pendente",
    percentual: "0",
    inicioPlano: "",
    fimPlano: "",
    inicioReal: "",
    fimReal: "",
  });
  const [formOcorrencia, setFormOcorrencia] = useState({
    causa: CAUSAS[0],
    descricao: "",
    diasAtraso: "0",
    data: "",
  });

  async function loadData() {
    const [obraRes, etapasRes, ocorrRes] = await Promise.all([
      fetch(`/api/obras/${id}`),
      fetch(`/api/etapas?obraId=${id}`),
      fetch(`/api/ocorrencias?obraId=${id}`),
    ]);
    setObra(await obraRes.json());
    setEtapas(await etapasRes.json());
    setOcorrencias(await ocorrRes.json());
    setLoading(false);
  }

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  async function salvarEtapa(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/etapas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formEtapa, obraId: id }),
    });
    setFormEtapa({
      nome: "",
      ordem: "",
      status: "pendente",
      percentual: "0",
      inicioPlano: "",
      fimPlano: "",
      inicioReal: "",
      fimReal: "",
    });
    setShowFormEtapa(false);
    setSaving(false);
    loadData();
  }

  async function salvarOcorrencia(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/ocorrencias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formOcorrencia, obraId: id }),
    });
    setFormOcorrencia({
      causa: CAUSAS[0],
      descricao: "",
      diasAtraso: "0",
      data: "",
    });
    setShowFormOcorrencia(false);
    setSaving(false);
    loadData();
  }

  async function atualizarEtapa(etapaId: string, campo: string, valor: string) {
    const etapa = etapas.find((e) => e.id === etapaId);
    if (!etapa) return;
    await fetch(`/api/etapas/${etapaId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...etapa,
        [campo]: campo === "percentual" ? Number(valor) : valor,
      }),
    });
    loadData();
  }

  // Cálculos do Gantt
  function ganttData() {
    if (!obra || !etapas.length) return { items: [], totalDias: 0 };
    const inicio = new Date(obra.inicio);
    const fim = new Date(obra.previsaoFim);
    const totalDias = daysBetween(obra.inicio, obra.previsaoFim);
    const hoje = new Date();
    const diaHoje = Math.min(
      daysBetween(obra.inicio, hoje.toISOString()),
      totalDias,
    );

    const items = etapas.map((e) => {
      const startDia = daysBetween(obra.inicio, e.inicioPlano);
      const durDias = daysBetween(e.inicioPlano, e.fimPlano);
      const startPct = (startDia / totalDias) * 100;
      const widthPct = (durDias / totalDias) * 100;
      const realWidth = ((durDias * e.percentual) / 100 / totalDias) * 100;
      return { ...e, startPct, widthPct, realWidth, startDia, durDias };
    });

    return { items, totalDias, diaHoje, pctHoje: (diaHoje / totalDias) * 100 };
  }

  // Dados para gráfico de causas
  function causasData() {
    const map: Record<string, number> = {};
    ocorrencias.forEach((o) => {
      map[o.causa] = (map[o.causa] || 0) + 1;
    });
    return Object.entries(map).map(([causa, count]) => ({
      causa: causa.split("/")[0].trim(),
      count,
    }));
  }

  // Indicadores
  const concluidas = etapas.filter((e) => e.status === "concluido").length;
  const emAtraso = etapas.filter((e) => e.status === "atraso").length;
  const totalAtraso = ocorrencias.reduce((a, o) => a + o.diasAtraso, 0);
  const saude =
    etapas.length > 0
      ? Math.max(
          0,
          Math.round(100 - (emAtraso / etapas.length) * 40 - totalAtraso * 2),
        )
      : 100;
  const saudeColor =
    saude >= 85 ? "#1D9E75" : saude >= 65 ? "#BA7517" : "#E24B4A";

  const { items: ganttItems, totalDias, diaHoje, pctHoje } = ganttData();

  if (loading) return <div style={{ color: "#888" }}>Carregando...</div>;

  return (
    <div>
      {/* Voltar */}
      <button
        onClick={() => router.push("/obras")}
        style={{
          background: "none",
          border: "none",
          color: "#185FA5",
          fontSize: "13px",
          cursor: "pointer",
          marginBottom: "12px",
          padding: 0,
          fontFamily: "inherit",
        }}
      >
        ← Voltar para Obras
      </button>

      <div style={{ marginBottom: "16px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 700 }}>
          {obra?.centroCusto} — {obra?.cliente?.nome}
        </h2>
        <p style={{ fontSize: "13px", color: "#888", marginTop: "2px" }}>
          {obra?.inicio
            ? new Date(obra.inicio).toLocaleDateString("pt-BR")
            : ""}{" "}
          →{" "}
          {obra?.previsaoFim
            ? new Date(obra.previsaoFim).toLocaleDateString("pt-BR")
            : ""}
        </p>
      </div>

      {/* Métricas */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5,1fr)",
          gap: "10px",
          marginBottom: "16px",
        }}
      >
        {[
          { label: "Saúde da obra", value: `${saude}%`, color: saudeColor },
          {
            label: "Total de etapas",
            value: String(etapas.length),
            color: "#185FA5",
          },
          { label: "Concluídas", value: String(concluidas), color: "#1D9E75" },
          { label: "Com atraso", value: String(emAtraso), color: "#E24B4A" },
          {
            label: "Dias de atraso",
            value: String(totalAtraso),
            color: totalAtraso > 0 ? "#E24B4A" : "#1D9E75",
          },
        ].map((m) => (
          <div
            key={m.label}
            style={{
              background: "#fff",
              border: "1px solid #e0e0e0",
              borderRadius: "10px",
              padding: "12px 14px",
            }}
          >
            <div
              style={{
                fontSize: "10px",
                color: "#888",
                marginBottom: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              {m.label}
            </div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: m.color }}>
              {m.value}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "4px",
          background: "#f0f0ee",
          borderRadius: "8px",
          padding: "3px",
          width: "fit-content",
          marginBottom: "14px",
        }}
      >
        {[
          { key: "gantt", label: "📊 Gantt" },
          { key: "etapas", label: "📋 Etapas" },
          { key: "ocorrencias", label: "⚠️ Ocorrências" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            style={{
              border: "none",
              background: tab === t.key ? "#fff" : "transparent",
              padding: "6px 16px",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: tab === t.key ? 600 : 400,
              color: tab === t.key ? "#1a1a1a" : "#888",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ===== GANTT ===== */}
      {tab === "gantt" && (
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
            Cronograma previsto vs realizado
          </h3>

          {etapas.length === 0 ? (
            <p style={{ fontSize: "13px", color: "#aaa" }}>
              Nenhuma etapa cadastrada. Adicione etapas na aba "Etapas".
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <div style={{ minWidth: "600px" }}>
                {ganttItems.map((g) => {
                  const st = STATUS_COLORS[g.status] || STATUS_COLORS.pendente;
                  return (
                    <div
                      key={g.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "8px",
                        minHeight: "32px",
                      }}
                    >
                      {/* Label */}
                      <div
                        style={{
                          width: "160px",
                          flexShrink: 0,
                          paddingRight: "10px",
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#333",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {g.nome}
                      </div>
                      {/* Barra */}
                      <div
                        style={{
                          flex: 1,
                          position: "relative",
                          height: "24px",
                          background: "#f0f0ee",
                          borderRadius: "4px",
                          overflow: "hidden",
                        }}
                      >
                        {/* Previsto */}
                        <div
                          style={{
                            position: "absolute",
                            top: "4px",
                            left: `${g.startPct}%`,
                            width: `${g.widthPct}%`,
                            height: "16px",
                            background: "#185FA522",
                            border: `1px solid #185FA555`,
                            borderRadius: "3px",
                          }}
                        />
                        {/* Realizado */}
                        {g.percentual > 0 && (
                          <div
                            style={{
                              position: "absolute",
                              top: "4px",
                              left: `${g.startPct}%`,
                              width: `${g.realWidth}%`,
                              height: "16px",
                              background:
                                g.status === "atraso" ? "#E24B4A" : "#185FA5",
                              borderRadius: "3px",
                              display: "flex",
                              alignItems: "center",
                              paddingLeft: "6px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "10px",
                                fontWeight: 600,
                                color: "#fff",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {g.percentual}%
                            </span>
                          </div>
                        )}
                        {/* Linha de hoje */}
                        {pctHoje && (
                          <div
                            style={{
                              position: "absolute",
                              top: 0,
                              bottom: 0,
                              left: `${pctHoje}%`,
                              width: "2px",
                              background: "#E24B4A",
                              zIndex: 10,
                            }}
                          />
                        )}
                      </div>
                      {/* Badge status */}
                      <div style={{ marginLeft: "10px", flexShrink: 0 }}>
                        <span
                          style={{
                            ...st,
                            padding: "2px 7px",
                            borderRadius: "10px",
                            fontSize: "10px",
                            fontWeight: 600,
                          }}
                        >
                          {g.status}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Legenda */}
                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                    marginTop: "12px",
                    paddingLeft: "160px",
                    fontSize: "11px",
                    color: "#888",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span
                      style={{
                        width: "12px",
                        height: "6px",
                        background: "#185FA522",
                        border: "1px solid #185FA555",
                        borderRadius: "2px",
                        display: "inline-block",
                      }}
                    />
                    Previsto
                  </span>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span
                      style={{
                        width: "12px",
                        height: "6px",
                        background: "#185FA5",
                        borderRadius: "2px",
                        display: "inline-block",
                      }}
                    />
                    Realizado
                  </span>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span
                      style={{
                        width: "2px",
                        height: "12px",
                        background: "#E24B4A",
                        display: "inline-block",
                      }}
                    />
                    Hoje
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Gráfico de causas */}
          {ocorrencias.length > 0 && (
            <div
              style={{
                marginTop: "24px",
                borderTop: "1px solid #f0f0f0",
                paddingTop: "16px",
              }}
            >
              <h3
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#888",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "12px",
                }}
              >
                Causas de atraso
              </h3>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={causasData()} layout="vertical">
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="causa"
                    width={140}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip />
                  <Bar dataKey="count" name="Ocorrências" radius={[0, 4, 4, 0]}>
                    {causasData().map((_, i) => (
                      <Cell
                        key={i}
                        fill={
                          [
                            "#E24B4A",
                            "#F59E0B",
                            "#185FA5",
                            "#8B5CF6",
                            "#1D9E75",
                            "#6B7280",
                          ][i % 6]
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* ===== ETAPAS ===== */}
      {tab === "etapas" && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: "12px",
            }}
          >
            <button
              onClick={() => setShowFormEtapa(!showFormEtapa)}
              style={{
                background: "#185FA5",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "9px 16px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {showFormEtapa ? "Cancelar" : "+ Nova Etapa"}
            </button>
          </div>

          {showFormEtapa && (
            <div
              style={{
                background: "#fff",
                border: "1px solid #e0e0e0",
                borderRadius: "10px",
                padding: "20px",
                marginBottom: "16px",
              }}
            >
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  marginBottom: "16px",
                }}
              >
                Cadastrar Etapa
              </h3>
              <form onSubmit={salvarEtapa}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  <div>
                    <label style={lbl}>Nome da etapa</label>
                    <input
                      value={formEtapa.nome}
                      onChange={(e) =>
                        setFormEtapa((p) => ({ ...p, nome: e.target.value }))
                      }
                      required
                      placeholder="Ex: Demolição e Preparo"
                      style={inp}
                    />
                  </div>
                  <div>
                    <label style={lbl}>Ordem</label>
                    <input
                      type="number"
                      value={formEtapa.ordem}
                      onChange={(e) =>
                        setFormEtapa((p) => ({ ...p, ordem: e.target.value }))
                      }
                      required
                      placeholder="Ex: 1"
                      style={inp}
                    />
                  </div>
                  <div>
                    <label style={lbl}>Status</label>
                    <select
                      value={formEtapa.status}
                      onChange={(e) =>
                        setFormEtapa((p) => ({ ...p, status: e.target.value }))
                      }
                      style={inp}
                    >
                      <option value="pendente">Pendente</option>
                      <option value="andamento">Em andamento</option>
                      <option value="atraso">Com atraso</option>
                      <option value="concluido">Concluído</option>
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Percentual concluído (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formEtapa.percentual}
                      onChange={(e) =>
                        setFormEtapa((p) => ({
                          ...p,
                          percentual: e.target.value,
                        }))
                      }
                      style={inp}
                    />
                  </div>
                  <div>
                    <label style={lbl}>Início planejado</label>
                    <input
                      type="date"
                      value={formEtapa.inicioPlano}
                      onChange={(e) =>
                        setFormEtapa((p) => ({
                          ...p,
                          inicioPlano: e.target.value,
                        }))
                      }
                      required
                      style={inp}
                    />
                  </div>
                  <div>
                    <label style={lbl}>Fim planejado</label>
                    <input
                      type="date"
                      value={formEtapa.fimPlano}
                      onChange={(e) =>
                        setFormEtapa((p) => ({
                          ...p,
                          fimPlano: e.target.value,
                        }))
                      }
                      required
                      style={inp}
                    />
                  </div>
                  <div>
                    <label style={lbl}>Início real (opcional)</label>
                    <input
                      type="date"
                      value={formEtapa.inicioReal}
                      onChange={(e) =>
                        setFormEtapa((p) => ({
                          ...p,
                          inicioReal: e.target.value,
                        }))
                      }
                      style={inp}
                    />
                  </div>
                  <div>
                    <label style={lbl}>Fim real (opcional)</label>
                    <input
                      type="date"
                      value={formEtapa.fimReal}
                      onChange={(e) =>
                        setFormEtapa((p) => ({ ...p, fimReal: e.target.value }))
                      }
                      style={inp}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    marginTop: "16px",
                    background: saving ? "#93c0e8" : "#185FA5",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 20px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {saving ? "Salvando..." : "Salvar Etapa"}
                </button>
              </form>
            </div>
          )}

          {/* Lista de etapas */}
          {etapas.length === 0 ? (
            <div
              style={{
                background: "#fff",
                border: "1px solid #e0e0e0",
                borderRadius: "10px",
                padding: "30px",
                textAlign: "center",
                color: "#aaa",
                fontSize: "13px",
              }}
            >
              Nenhuma etapa cadastrada. Clique em "+ Nova Etapa" para começar.
            </div>
          ) : (
            etapas.map((etapa) => {
              const st = STATUS_COLORS[etapa.status] || STATUS_COLORS.pendente;
              const aberto = abertos[etapa.id];
              return (
                <div
                  key={etapa.id}
                  style={{
                    background: "#fff",
                    border: "1px solid #e0e0e0",
                    borderRadius: "10px",
                    marginBottom: "8px",
                    overflow: "hidden",
                  }}
                >
                  {/* Header da etapa */}
                  <div
                    onClick={() =>
                      setAbertos((p) => ({ ...p, [etapa.id]: !p[etapa.id] }))
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 16px",
                      cursor: "pointer",
                      background: "#f8f8f6",
                    }}
                  >
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: st.color,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, fontWeight: 600, fontSize: "13px" }}>
                      {etapa.nome}
                    </div>
                    <span
                      style={{
                        ...st,
                        padding: "2px 8px",
                        borderRadius: "10px",
                        fontSize: "11px",
                        fontWeight: 600,
                      }}
                    >
                      {etapa.status}
                    </span>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: st.color,
                        width: "40px",
                        textAlign: "right",
                      }}
                    >
                      {etapa.percentual}%
                    </div>
                    {/* Barra de progresso inline */}
                    <div
                      style={{
                        width: "80px",
                        background: "#e0e0e0",
                        borderRadius: "4px",
                        height: "6px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${etapa.percentual}%`,
                          height: "100%",
                          background:
                            etapa.status === "atraso" ? "#E24B4A" : "#185FA5",
                          borderRadius: "4px",
                        }}
                      />
                    </div>
                    <span style={{ fontSize: "12px", color: "#888" }}>
                      {aberto ? "▲" : "▼"}
                    </span>
                  </div>

                  {/* Detalhes expandidos */}
                  {aberto && (
                    <div
                      style={{
                        padding: "14px 16px",
                        borderTop: "1px solid #f0f0f0",
                      }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "10px",
                          marginBottom: "12px",
                          fontSize: "12px",
                        }}
                      >
                        <div>
                          <span style={{ color: "#888" }}>Início plan.: </span>
                          {new Date(etapa.inicioPlano).toLocaleDateString(
                            "pt-BR",
                          )}
                        </div>
                        <div>
                          <span style={{ color: "#888" }}>Fim plan.: </span>
                          {new Date(etapa.fimPlano).toLocaleDateString("pt-BR")}
                        </div>
                        {etapa.inicioReal && (
                          <div>
                            <span style={{ color: "#888" }}>Início real: </span>
                            {new Date(etapa.inicioReal).toLocaleDateString(
                              "pt-BR",
                            )}
                          </div>
                        )}
                        {etapa.fimReal && (
                          <div>
                            <span style={{ color: "#888" }}>Fim real: </span>
                            {new Date(etapa.fimReal).toLocaleDateString(
                              "pt-BR",
                            )}
                          </div>
                        )}
                      </div>

                      {/* Atualizar status e percentual */}
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          alignItems: "center",
                          marginBottom: "12px",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <label style={lbl}>Atualizar status</label>
                          <select
                            defaultValue={etapa.status}
                            onChange={(e) =>
                              atualizarEtapa(etapa.id, "status", e.target.value)
                            }
                            style={inp}
                          >
                            <option value="pendente">Pendente</option>
                            <option value="andamento">Em andamento</option>
                            <option value="atraso">Com atraso</option>
                            <option value="concluido">Concluído</option>
                          </select>
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={lbl}>Atualizar % concluído</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            defaultValue={etapa.percentual}
                            onBlur={(e) =>
                              atualizarEtapa(
                                etapa.id,
                                "percentual",
                                e.target.value,
                              )
                            }
                            style={inp}
                          />
                        </div>
                      </div>

                      {/* Subtarefas */}
                      {etapa.subtarefas.length > 0 && (
                        <div>
                          <p
                            style={{
                              fontSize: "11px",
                              fontWeight: 600,
                              color: "#888",
                              textTransform: "uppercase",
                              letterSpacing: "0.04em",
                              marginBottom: "8px",
                            }}
                          >
                            Subtarefas
                          </p>
                          {etapa.subtarefas.map((s) => {
                            const ss =
                              STATUS_COLORS[s.status] || STATUS_COLORS.pendente;
                            return (
                              <div
                                key={s.id}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                  padding: "6px 0",
                                  borderBottom: "1px solid #f5f5f3",
                                  fontSize: "12px",
                                }}
                              >
                                <div
                                  style={{
                                    width: "6px",
                                    height: "6px",
                                    borderRadius: "50%",
                                    background: ss.color,
                                    flexShrink: 0,
                                  }}
                                />
                                <div style={{ flex: 1 }}>{s.nome}</div>
                                <span
                                  style={{
                                    ...ss,
                                    padding: "1px 7px",
                                    borderRadius: "10px",
                                    fontSize: "10px",
                                    fontWeight: 600,
                                  }}
                                >
                                  {s.status}
                                </span>
                                <span
                                  style={{ fontWeight: 600, color: ss.color }}
                                >
                                  {s.percentual}%
                                </span>
                                {s.motivo && (
                                  <span
                                    style={{
                                      fontSize: "11px",
                                      color: "#E24B4A",
                                    }}
                                  >
                                    ⚠ {s.motivo}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ===== OCORRÊNCIAS ===== */}
      {tab === "ocorrencias" && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: "12px",
            }}
          >
            <button
              onClick={() => setShowFormOcorrencia(!showFormOcorrencia)}
              style={{
                background: "#E24B4A",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "9px 16px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {showFormOcorrencia ? "Cancelar" : "⚠ Registrar Ocorrência"}
            </button>
          </div>

          {showFormOcorrencia && (
            <div
              style={{
                background: "#fff",
                border: "1px solid #e0e0e0",
                borderRadius: "10px",
                padding: "20px",
                marginBottom: "16px",
              }}
            >
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  marginBottom: "16px",
                }}
              >
                Registrar Ocorrência de Atraso
              </h3>
              <form onSubmit={salvarOcorrencia}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  <div>
                    <label style={lbl}>Causa</label>
                    <select
                      value={formOcorrencia.causa}
                      onChange={(e) =>
                        setFormOcorrencia((p) => ({
                          ...p,
                          causa: e.target.value,
                        }))
                      }
                      style={inp}
                    >
                      {CAUSAS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Dias de atraso</label>
                    <input
                      type="number"
                      min="0"
                      value={formOcorrencia.diasAtraso}
                      onChange={(e) =>
                        setFormOcorrencia((p) => ({
                          ...p,
                          diasAtraso: e.target.value,
                        }))
                      }
                      placeholder="Ex: 3"
                      style={inp}
                    />
                  </div>
                  <div style={{ gridColumn: "1/-1" }}>
                    <label style={lbl}>Descrição do ocorrido</label>
                    <input
                      value={formOcorrencia.descricao}
                      onChange={(e) =>
                        setFormOcorrencia((p) => ({
                          ...p,
                          descricao: e.target.value,
                        }))
                      }
                      required
                      placeholder="Descreva o que aconteceu..."
                      style={inp}
                    />
                  </div>
                  <div>
                    <label style={lbl}>Data</label>
                    <input
                      type="date"
                      value={formOcorrencia.data}
                      onChange={(e) =>
                        setFormOcorrencia((p) => ({
                          ...p,
                          data: e.target.value,
                        }))
                      }
                      style={inp}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    marginTop: "16px",
                    background: saving ? "#e89393" : "#E24B4A",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 20px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {saving ? "Salvando..." : "Salvar Ocorrência"}
                </button>
              </form>
            </div>
          )}

          {ocorrencias.length === 0 ? (
            <div
              style={{
                background: "#fff",
                border: "1px solid #e0e0e0",
                borderRadius: "10px",
                padding: "30px",
                textAlign: "center",
                color: "#aaa",
                fontSize: "13px",
              }}
            >
              ✅ Nenhuma ocorrência registrada nesta obra.
            </div>
          ) : (
            <div
              style={{
                background: "#fff",
                border: "1px solid #e0e0e0",
                borderRadius: "10px",
                padding: "18px 20px",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "13px",
                }}
              >
                <thead>
                  <tr>
                    {["Data", "Causa", "Descrição", "Dias de atraso"].map(
                      (h) => (
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
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {ocorrencias.map((o) => (
                    <tr key={o.id}>
                      <td
                        style={{
                          padding: "10px 0",
                          borderBottom: "1px solid #f0f0f0",
                          color: "#888",
                        }}
                      >
                        {new Date(o.data).toLocaleDateString("pt-BR")}
                      </td>
                      <td
                        style={{
                          padding: "10px 0",
                          borderBottom: "1px solid #f0f0f0",
                        }}
                      >
                        <span
                          style={{
                            background: "#FCEBEB",
                            color: "#791F1F",
                            padding: "2px 8px",
                            borderRadius: "10px",
                            fontSize: "11px",
                            fontWeight: 600,
                          }}
                        >
                          {o.causa}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "10px 0",
                          borderBottom: "1px solid #f0f0f0",
                          color: "#555",
                        }}
                      >
                        {o.descricao}
                      </td>
                      <td
                        style={{
                          padding: "10px 0",
                          borderBottom: "1px solid #f0f0f0",
                          fontWeight: 700,
                          color: o.diasAtraso > 0 ? "#E24B4A" : "#888",
                        }}
                      >
                        {o.diasAtraso > 0 ? `+${o.diasAtraso} dias` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
