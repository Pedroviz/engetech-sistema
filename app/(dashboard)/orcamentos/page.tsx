"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Cliente {
  id: string;
  nome: string;
}
interface Orcamento {
  id: string;
  numero: string;
  valor: number;
  status: string;
  linkArquivo?: string;
  observacoes?: string;
  cliente: Cliente;
  createdAt: string;
}

const STATUS_LIST = [
  "enviado",
  "negociacao",
  "aprovado",
  "recusado",
  "expirado",
];

const STATUS_STYLE: Record<
  string,
  { bg: string; color: string; label: string }
> = {
  enviado: { bg: "#E6F1FB", color: "#0C447C", label: "Enviado" },
  negociacao: { bg: "#FAEEDA", color: "#633806", label: "Negociação" },
  aprovado: { bg: "#EAF3DE", color: "#27500A", label: "Aprovado" },
  recusado: { bg: "#FCEBEB", color: "#791F1F", label: "Recusado" },
  expirado: { bg: "#F1EFE8", color: "#555", label: "Expirado" },
};

const TIPOS = ["residencial", "comercial", "industrial"];

function formatMoney(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

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

export default function OrcamentosPage() {
  const router = useRouter();
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [convertendo, setConvertendo] = useState<Orcamento | null>(null);
  const [erroConversao, setErroConversao] = useState("");

  const [form, setForm] = useState({
    numero: "",
    clienteId: "",
    valor: "",
    status: "enviado",
    linkArquivo: "",
    observacoes: "",
  });

  const [formConversao, setFormConversao] = useState({
    centroCusto: "",
    tipo: "residencial",
    inicio: "",
    previsaoFim: "",
    orcamentoMat: "",
    orcamentoMO: "",
  });

  async function fetchData() {
    const [oRes, cRes] = await Promise.all([
      fetch("/api/orcamentos"),
      fetch("/api/clientes"),
    ]);
    const oData = await oRes.json();
    const cData = await cRes.json();
    return {
      orcamentos: Array.isArray(oData) ? oData : [],
      clientes: Array.isArray(cData) ? cData : [],
    };
  }

  async function loadData() {
    const { orcamentos: loadedOrcamentos, clientes: loadedClientes } =
      await fetchData();
    setOrcamentos(loadedOrcamentos);
    setClientes(loadedClientes);
    setLoading(false);
  }

  useEffect(() => {
    fetchData().then(
      ({ orcamentos: loadedOrcamentos, clientes: loadedClientes }) => {
        setOrcamentos(loadedOrcamentos);
        setClientes(loadedClientes);
        setLoading(false);
      },
    );
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/orcamentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, valor: Number(form.valor) }),
    });
    setForm({
      numero: "",
      clienteId: "",
      valor: "",
      status: "enviado",
      linkArquivo: "",
      observacoes: "",
    });
    setShowForm(false);
    setSaving(false);
    loadData();
  }

  async function atualizarStatus(id: string, status: string) {
    await fetch(`/api/orcamentos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadData();
  }

  function abrirConversao(orc: Orcamento) {
    setErroConversao("");
    setFormConversao({
      centroCusto: "",
      tipo: "residencial",
      inicio: "",
      previsaoFim: "",
      orcamentoMat: "",
      orcamentoMO: "",
    });
    setConvertendo(orc);
  }

  async function handleConverter(e: React.FormEvent) {
    e.preventDefault();
    if (!convertendo) return;
    setSaving(true);
    setErroConversao("");

    const res = await fetch(`/api/orcamentos/${convertendo.id}/converter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formConversao),
    });

    const data = await res.json();

    if (!res.ok) {
      setErroConversao(data.error || "Erro ao converter");
      setSaving(false);
      return;
    }

    setConvertendo(null);
    setSaving(false);
    loadData();
    router.push("/obras");
  }

  const porStatus = STATUS_LIST.reduce(
    (acc, s) => {
      acc[s] = orcamentos.filter((o) => o.status === s);
      return acc;
    },
    {} as Record<string, Orcamento[]>,
  );

  const taxaConversao =
    orcamentos.length > 0
      ? Math.round(
          ((porStatus.aprovado?.length || 0) / orcamentos.length) * 100,
        )
      : 0;

  const filtrados =
    filtroStatus === "todos"
      ? orcamentos
      : orcamentos.filter((o) => o.status === filtroStatus);

  if (loading) return <div style={{ color: "#888" }}>Carregando...</div>;

  return (
    <div>
      {/* Modal de conversão */}
      {convertendo && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "28px 32px",
              width: "480px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
            }}
          >
            <h3
              style={{ fontSize: "16px", fontWeight: 700, marginBottom: "4px" }}
            >
              🏗️ Converter em Obra
            </h3>
            <p
              style={{ fontSize: "13px", color: "#888", marginBottom: "20px" }}
            >
              Orçamento <strong>{convertendo.numero}</strong> —{" "}
              {convertendo.cliente?.nome} —{" "}
              <strong style={{ color: "#185FA5" }}>
                {formatMoney(convertendo.valor)}
              </strong>
            </p>

            {erroConversao && (
              <div
                style={{
                  background: "#FCEBEB",
                  border: "1px solid #f5c6c6",
                  borderRadius: "8px",
                  padding: "9px 12px",
                  fontSize: "12px",
                  color: "#791F1F",
                  marginBottom: "14px",
                }}
              >
                ⚠ {erroConversao}
              </div>
            )}

            <form onSubmit={handleConverter}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div>
                  <label style={lbl}>Centro de Custo</label>
                  <input
                    value={formConversao.centroCusto}
                    onChange={(e) =>
                      setFormConversao((p) => ({
                        ...p,
                        centroCusto: e.target.value,
                      }))
                    }
                    required
                    placeholder="Ex: CC-002"
                    style={inp}
                  />
                </div>
                <div>
                  <label style={lbl}>Tipo</label>
                  <select
                    value={formConversao.tipo}
                    onChange={(e) =>
                      setFormConversao((p) => ({ ...p, tipo: e.target.value }))
                    }
                    style={inp}
                  >
                    {TIPOS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Data de início</label>
                  <input
                    type="date"
                    value={formConversao.inicio}
                    onChange={(e) =>
                      setFormConversao((p) => ({
                        ...p,
                        inicio: e.target.value,
                      }))
                    }
                    required
                    style={inp}
                  />
                </div>
                <div>
                  <label style={lbl}>Previsão de entrega</label>
                  <input
                    type="date"
                    value={formConversao.previsaoFim}
                    onChange={(e) =>
                      setFormConversao((p) => ({
                        ...p,
                        previsaoFim: e.target.value,
                      }))
                    }
                    required
                    style={inp}
                  />
                </div>
                <div>
                  <label style={lbl}>Orçamento Materiais (R$)</label>
                  <input
                    type="number"
                    value={formConversao.orcamentoMat}
                    onChange={(e) =>
                      setFormConversao((p) => ({
                        ...p,
                        orcamentoMat: e.target.value,
                      }))
                    }
                    required
                    placeholder="0,00"
                    style={inp}
                  />
                </div>
                <div>
                  <label style={lbl}>Orçamento Mão de Obra (R$)</label>
                  <input
                    type="number"
                    value={formConversao.orcamentoMO}
                    onChange={(e) =>
                      setFormConversao((p) => ({
                        ...p,
                        orcamentoMO: e.target.value,
                      }))
                    }
                    required
                    placeholder="0,00"
                    style={inp}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "18px" }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
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
                  {saving ? "Criando obra..." : "✅ Criar obra"}
                </button>
                <button
                  type="button"
                  onClick={() => setConvertendo(null)}
                  style={{
                    background: "#f5f5f3",
                    color: "#666",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    padding: "10px 20px",
                    fontSize: "13px",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Métricas */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5,1fr)",
          gap: "10px",
          marginBottom: "16px",
        }}
      >
        {STATUS_LIST.map((s) => {
          const st = STATUS_STYLE[s];
          const itens = porStatus[s] || [];
          return (
            <div
              key={s}
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
                {st.label}
              </div>
              <div
                style={{ fontSize: "20px", fontWeight: 700, color: st.color }}
              >
                {itens.length}
              </div>
              <div
                style={{ fontSize: "11px", color: "#aaa", marginTop: "2px" }}
              >
                {formatMoney(itens.reduce((a, o) => a + o.valor, 0))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pipeline visual */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e0e0e0",
          borderRadius: "10px",
          padding: "16px 20px",
          marginBottom: "14px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px",
          }}
        >
          <h3
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "#888",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Pipeline de orçamentos
          </h3>
          <span style={{ fontSize: "12px", color: "#888" }}>
            Taxa de conversão:{" "}
            <strong style={{ color: "#1D9E75" }}>{taxaConversao}%</strong>
          </span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5,1fr)",
            gap: "8px",
          }}
        >
          {STATUS_LIST.map((s) => {
            const st = STATUS_STYLE[s];
            const itens = porStatus[s] || [];
            return (
              <div
                key={s}
                style={{
                  background: "#f8f8f6",
                  borderRadius: "8px",
                  padding: "10px",
                }}
              >
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    color: "#888",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    marginBottom: "8px",
                  }}
                >
                  {st.label}
                </div>
                {itens.length === 0 ? (
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#ccc",
                      textAlign: "center",
                      padding: "10px 0",
                    }}
                  >
                    vazio
                  </div>
                ) : (
                  itens.map((o) => (
                    <div
                      key={o.id}
                      style={{
                        background: "#fff",
                        border: "1px solid #e0e0e0",
                        borderRadius: "6px",
                        padding: "8px",
                        marginBottom: "6px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          marginBottom: "2px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {o.cliente?.nome}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#185FA5",
                          fontWeight: 600,
                        }}
                      >
                        {formatMoney(o.valor)}
                      </div>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#aaa",
                          marginTop: "2px",
                        }}
                      >
                        {o.numero}
                      </div>
                      {/* Botão converter — só aparece em aprovados */}
                      {o.status === "aprovado" && (
                        <button
                          onClick={() => abrirConversao(o)}
                          style={{
                            marginTop: "6px",
                            width: "100%",
                            background: "#185FA5",
                            color: "#fff",
                            border: "none",
                            borderRadius: "5px",
                            padding: "4px 0",
                            fontSize: "10px",
                            fontWeight: 600,
                            cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          🏗️ Converter em Obra
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Filtros + botão */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {["todos", ...STATUS_LIST].map((s) => (
            <button
              key={s}
              onClick={() => setFiltroStatus(s)}
              style={{
                border: "1px solid #e0e0e0",
                borderRadius: "20px",
                padding: "4px 12px",
                fontSize: "12px",
                cursor: "pointer",
                fontFamily: "inherit",
                background: filtroStatus === s ? "#185FA5" : "#fff",
                color: filtroStatus === s ? "#fff" : "#555",
                fontWeight: filtroStatus === s ? 600 : 400,
              }}
            >
              {s === "todos" ? "Todos" : STATUS_STYLE[s].label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
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
          {showForm ? "Cancelar" : "+ Novo Orçamento"}
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
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
            style={{ fontSize: "14px", fontWeight: 600, marginBottom: "16px" }}
          >
            Cadastrar Orçamento
          </h3>
          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <div>
                <label style={lbl}>Número do orçamento</label>
                <input
                  name="numero"
                  value={form.numero}
                  onChange={handleChange}
                  required
                  placeholder="Ex: 0180/2025"
                  style={inp}
                />
              </div>
              <div>
                <label style={lbl}>Cliente</label>
                <select
                  name="clienteId"
                  value={form.clienteId}
                  onChange={handleChange}
                  required
                  style={inp}
                >
                  <option value="">Selecione...</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={lbl}>Valor (R$)</label>
                <input
                  name="valor"
                  type="number"
                  value={form.valor}
                  onChange={handleChange}
                  required
                  placeholder="0,00"
                  style={inp}
                />
              </div>
              <div>
                <label style={lbl}>Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  style={inp}
                >
                  {STATUS_LIST.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_STYLE[s].label}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={lbl}>
                  Link do arquivo (OneDrive / Google Drive)
                </label>
                <input
                  name="linkArquivo"
                  value={form.linkArquivo}
                  onChange={handleChange}
                  placeholder="https://onedrive.live.com/..."
                  style={inp}
                />
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={lbl}>Observações</label>
                <input
                  name="observacoes"
                  value={form.observacoes}
                  onChange={handleChange}
                  placeholder="Ex: Cliente pediu desconto de 10%..."
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
              {saving ? "Salvando..." : "Salvar Orçamento"}
            </button>
          </form>
        </div>
      )}

      {/* Tabela */}
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
          Todos os orçamentos{" "}
          {filtroStatus !== "todos" && `— ${STATUS_STYLE[filtroStatus]?.label}`}
        </h3>
        {filtrados.length === 0 ? (
          <p style={{ fontSize: "13px", color: "#aaa" }}>
            Nenhum orçamento encontrado.
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
                  "Número",
                  "Cliente",
                  "Valor",
                  "Status",
                  "Observações",
                  "Arquivo",
                  "Ação",
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
              {filtrados.map((o) => {
                const st = STATUS_STYLE[o.status] || STATUS_STYLE.enviado;
                return (
                  <tr key={o.id}>
                    <td
                      style={{
                        padding: "10px 0",
                        borderBottom: "1px solid #f0f0f0",
                        fontWeight: 600,
                      }}
                    >
                      {o.numero}
                    </td>
                    <td
                      style={{
                        padding: "10px 0",
                        borderBottom: "1px solid #f0f0f0",
                        color: "#555",
                      }}
                    >
                      {o.cliente?.nome}
                    </td>
                    <td
                      style={{
                        padding: "10px 0",
                        borderBottom: "1px solid #f0f0f0",
                        fontWeight: 600,
                        color: "#185FA5",
                      }}
                    >
                      {formatMoney(o.valor)}
                    </td>
                    <td
                      style={{
                        padding: "10px 0",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      <span
                        style={{
                          background: st.bg,
                          color: st.color,
                          padding: "2px 8px",
                          borderRadius: "10px",
                          fontSize: "11px",
                          fontWeight: 600,
                        }}
                      >
                        {st.label}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "10px 0",
                        borderBottom: "1px solid #f0f0f0",
                        color: "#888",
                        fontSize: "12px",
                        maxWidth: "160px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {o.observacoes || "—"}
                    </td>
                    <td
                      style={{
                        padding: "10px 0",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      {o.linkArquivo ? (
                        <a
                          href={o.linkArquivo}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontSize: "11px",
                            color: "#185FA5",
                            background: "#E6F1FB",
                            padding: "2px 8px",
                            borderRadius: "10px",
                            textDecoration: "none",
                            fontWeight: 600,
                          }}
                        >
                          Abrir ↗
                        </a>
                      ) : (
                        <span style={{ color: "#ccc", fontSize: "12px" }}>
                          —
                        </span>
                      )}
                    </td>
                    <td
                      style={{
                        padding: "10px 0",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "6px",
                          alignItems: "center",
                        }}
                      >
                        <select
                          defaultValue={o.status}
                          onChange={(e) =>
                            atualizarStatus(o.id, e.target.value)
                          }
                          style={{
                            border: "1px solid #e0e0e0",
                            borderRadius: "6px",
                            padding: "4px 8px",
                            fontSize: "11px",
                            fontFamily: "inherit",
                            cursor: "pointer",
                            background: "#fff",
                          }}
                        >
                          {STATUS_LIST.map((s) => (
                            <option key={s} value={s}>
                              {STATUS_STYLE[s].label}
                            </option>
                          ))}
                        </select>
                        {o.status === "aprovado" && (
                          <button
                            onClick={() => abrirConversao(o)}
                            style={{
                              background: "#185FA5",
                              color: "#fff",
                              border: "none",
                              borderRadius: "6px",
                              padding: "4px 10px",
                              fontSize: "11px",
                              fontWeight: 600,
                              cursor: "pointer",
                              fontFamily: "inherit",
                              whiteSpace: "nowrap",
                            }}
                          >
                            🏗️ Converter
                          </button>
                        )}
                      </div>
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
