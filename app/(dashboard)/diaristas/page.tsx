"use client";

import { useEffect, useState } from "react";

interface Obra {
  id: string;
  centroCusto: string;
  cliente: { nome: string };
}
interface Diarista {
  id: string;
  nome: string;
  funcao: string;
  telefone: string;
  obra: Obra;
}
interface Pagamento {
  id: string;
  diarista: Diarista;
  obra: Obra;
  diasTrab: number;
  valorDia: number;
  total: number;
  status: string;
  createdAt: string;
}

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

export default function DiaristasPage() {
  const [diaristas, setDiaristas] = useState<Diarista[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"diaristas" | "pagamentos">("diaristas");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formD, setFormD] = useState({
    nome: "",
    funcao: "",
    telefone: "",
    obraId: "",
  });
  const [formP, setFormP] = useState({
    diaristaId: "",
    obraId: "",
    diasTrab: "",
    valorDia: "",
    status: "pendente",
  });

  async function loadData() {
    const [dRes, pRes, oRes] = await Promise.all([
      fetch("/api/diaristas"),
      fetch("/api/pagamentos"),
      fetch("/api/obras"),
    ]);
    setDiaristas(await dRes.json());
    setPagamentos(await pRes.json());
    setObras(await oRes.json());
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmitDiarista(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/diaristas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formD),
    });
    setFormD({ nome: "", funcao: "", telefone: "", obraId: "" });
    setShowForm(false);
    setSaving(false);
    loadData();
  }

  async function handleSubmitPagamento(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const d = diaristas.find((d) => d.id === formP.diaristaId);
    await fetch("/api/pagamentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formP, obraId: d?.obra?.id || formP.obraId }),
    });
    setFormP({
      diaristaId: "",
      obraId: "",
      diasTrab: "",
      valorDia: "",
      status: "pendente",
    });
    setShowForm(false);
    setSaving(false);
    loadData();
  }

  const totalPago = pagamentos
    .filter((p) => p.status === "pago")
    .reduce((a, p) => a + p.total, 0);
  const totalPendente = pagamentos
    .filter((p) => p.status === "pendente")
    .reduce((a, p) => a + p.total, 0);

  if (loading) return <div style={{ color: "#888" }}>Carregando...</div>;

  return (
    <div>
      {/* Métricas */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        {[
          {
            label: "Diaristas cadastrados",
            value: String(diaristas.length),
            color: "#185FA5",
          },
          {
            label: "Total pago",
            value: formatMoney(totalPago),
            color: "#1D9E75",
          },
          {
            label: "Pendente pagar",
            value: formatMoney(totalPendente),
            color: "#BA7517",
          },
        ].map((m) => (
          <div
            key={m.label}
            style={{
              background: "#fff",
              border: "1px solid #e0e0e0",
              borderRadius: "10px",
              padding: "14px 16px",
            }}
          >
            <div
              style={{
                fontSize: "11px",
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
        {(["diaristas", "pagamentos"] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setShowForm(false);
            }}
            style={{
              border: "none",
              background: tab === t ? "#fff" : "transparent",
              padding: "6px 16px",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: tab === t ? 600 : 400,
              color: tab === t ? "#1a1a1a" : "#888",
              cursor: "pointer",
              fontFamily: "inherit",
              textTransform: "capitalize",
            }}
          >
            {t === "diaristas" ? "👷 Diaristas" : "💰 Pagamentos"}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "12px",
        }}
      >
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
          {showForm
            ? "Cancelar"
            : tab === "diaristas"
              ? "+ Novo Diarista"
              : "+ Registrar Pagamento"}
        </button>
      </div>

      {/* Formulário diarista */}
      {showForm && tab === "diaristas" && (
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
            Cadastrar Diarista
          </h3>
          <form onSubmit={handleSubmitDiarista}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <div>
                <label style={lbl}>Nome</label>
                <input
                  name="nome"
                  value={formD.nome}
                  onChange={(e) =>
                    setFormD((p) => ({ ...p, nome: e.target.value }))
                  }
                  required
                  placeholder="Nome completo"
                  style={inp}
                />
              </div>
              <div>
                <label style={lbl}>Função</label>
                <select
                  name="funcao"
                  value={formD.funcao}
                  onChange={(e) =>
                    setFormD((p) => ({ ...p, funcao: e.target.value }))
                  }
                  required
                  style={inp}
                >
                  <option value="">Selecione...</option>
                  {[
                    "Pedreiro",
                    "Pintor",
                    "Eletricista",
                    "Encanador",
                    "Servente",
                    "Gesseiro",
                    "Azulejista",
                    "Outro",
                  ].map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={lbl}>Telefone</label>
                <input
                  value={formD.telefone}
                  onChange={(e) =>
                    setFormD((p) => ({ ...p, telefone: e.target.value }))
                  }
                  placeholder="(85) 99999-0000"
                  style={inp}
                />
              </div>
              <div>
                <label style={lbl}>Obra</label>
                <select
                  value={formD.obraId}
                  onChange={(e) =>
                    setFormD((p) => ({ ...p, obraId: e.target.value }))
                  }
                  required
                  style={inp}
                >
                  <option value="">Selecione...</option>
                  {obras.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.centroCusto} — {o.cliente?.nome}
                    </option>
                  ))}
                </select>
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
              {saving ? "Salvando..." : "Salvar Diarista"}
            </button>
          </form>
        </div>
      )}

      {/* Formulário pagamento */}
      {showForm && tab === "pagamentos" && (
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
            Registrar Pagamento
          </h3>
          <form onSubmit={handleSubmitPagamento}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <div>
                <label style={lbl}>Diarista</label>
                <select
                  value={formP.diaristaId}
                  onChange={(e) =>
                    setFormP((p) => ({ ...p, diaristaId: e.target.value }))
                  }
                  required
                  style={inp}
                >
                  <option value="">Selecione...</option>
                  {diaristas.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nome} — {d.funcao}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={lbl}>Dias trabalhados</label>
                <input
                  type="number"
                  value={formP.diasTrab}
                  onChange={(e) =>
                    setFormP((p) => ({ ...p, diasTrab: e.target.value }))
                  }
                  required
                  placeholder="Ex: 5"
                  style={inp}
                />
              </div>
              <div>
                <label style={lbl}>Valor por dia (R$)</label>
                <input
                  type="number"
                  value={formP.valorDia}
                  onChange={(e) =>
                    setFormP((p) => ({ ...p, valorDia: e.target.value }))
                  }
                  required
                  placeholder="Ex: 180"
                  style={inp}
                />
              </div>
              <div>
                <label style={lbl}>Status</label>
                <select
                  value={formP.status}
                  onChange={(e) =>
                    setFormP((p) => ({ ...p, status: e.target.value }))
                  }
                  style={inp}
                >
                  <option value="pendente">Pendente</option>
                  <option value="pago">Pago</option>
                </select>
              </div>
            </div>
            {formP.diasTrab && formP.valorDia && (
              <div
                style={{
                  marginTop: "10px",
                  background: "#E6F1FB",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  fontSize: "13px",
                  color: "#0C447C",
                  fontWeight: 600,
                }}
              >
                Total:{" "}
                {formatMoney(Number(formP.diasTrab) * Number(formP.valorDia))}
              </div>
            )}
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
              {saving ? "Salvando..." : "Salvar Pagamento"}
            </button>
          </form>
        </div>
      )}

      {/* Tabela diaristas */}
      {tab === "diaristas" && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e0e0e0",
            borderRadius: "10px",
            padding: "18px 20px",
          }}
        >
          {diaristas.length === 0 ? (
            <p style={{ fontSize: "13px", color: "#aaa" }}>
              Nenhum diarista cadastrado.
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
                  {["Nome", "Função", "Telefone", "Obra"].map((h) => (
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
                {diaristas.map((d) => (
                  <tr key={d.id}>
                    <td
                      style={{
                        padding: "10px 0",
                        borderBottom: "1px solid #f0f0f0",
                        fontWeight: 600,
                      }}
                    >
                      {d.nome}
                    </td>
                    <td
                      style={{
                        padding: "10px 0",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      {d.funcao}
                    </td>
                    <td
                      style={{
                        padding: "10px 0",
                        borderBottom: "1px solid #f0f0f0",
                        color: "#555",
                      }}
                    >
                      {d.telefone || "—"}
                    </td>
                    <td
                      style={{
                        padding: "10px 0",
                        borderBottom: "1px solid #f0f0f0",
                        color: "#555",
                      }}
                    >
                      {d.obra?.centroCusto}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tabela pagamentos */}
      {tab === "pagamentos" && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e0e0e0",
            borderRadius: "10px",
            padding: "18px 20px",
          }}
        >
          {pagamentos.length === 0 ? (
            <p style={{ fontSize: "13px", color: "#aaa" }}>
              Nenhum pagamento registrado.
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
                    "Diarista",
                    "Função",
                    "Obra",
                    "Dias",
                    "Valor/dia",
                    "Total",
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
                {pagamentos.map((p) => (
                  <tr key={p.id}>
                    <td
                      style={{
                        padding: "10px 0",
                        borderBottom: "1px solid #f0f0f0",
                        fontWeight: 600,
                      }}
                    >
                      {p.diarista?.nome}
                    </td>
                    <td
                      style={{
                        padding: "10px 0",
                        borderBottom: "1px solid #f0f0f0",
                        color: "#555",
                      }}
                    >
                      {p.diarista?.funcao}
                    </td>
                    <td
                      style={{
                        padding: "10px 0",
                        borderBottom: "1px solid #f0f0f0",
                        color: "#555",
                      }}
                    >
                      {p.obra?.centroCusto}
                    </td>
                    <td
                      style={{
                        padding: "10px 0",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      {p.diasTrab}
                    </td>
                    <td
                      style={{
                        padding: "10px 0",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      {formatMoney(p.valorDia)}
                    </td>
                    <td
                      style={{
                        padding: "10px 0",
                        borderBottom: "1px solid #f0f0f0",
                        fontWeight: 600,
                      }}
                    >
                      {formatMoney(p.total)}
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
                            p.status === "pago" ? "#EAF3DE" : "#FAEEDA",
                          color: p.status === "pago" ? "#27500A" : "#633806",
                          padding: "2px 8px",
                          borderRadius: "10px",
                          fontSize: "11px",
                          fontWeight: 600,
                        }}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
