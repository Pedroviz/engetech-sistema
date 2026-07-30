"use client";

import { useEffect, useState } from "react";
import * as S from "@/lib/styles";

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
}

function formatMoney(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

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
    const [d, p, o] = await Promise.all([
      fetch("/api/diaristas").then((r) => r.json()),
      fetch("/api/pagamentos").then((r) => r.json()),
      fetch("/api/obras").then((r) => r.json()),
    ]);
    setDiaristas(Array.isArray(d) ? d : []);
    setPagamentos(Array.isArray(p) ? p : []);
    setObras(Array.isArray(o) ? o : []);
    setLoading(false);
  }

  useEffect(() => {
    async function init() {
      await loadData();
    }
    init();
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

  if (loading)
    return <div style={{ color: "var(--text-muted)" }}>Carregando...</div>;

  return (
    <div>
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
            color: "var(--blue)",
          },
          {
            label: "Total pago",
            value: formatMoney(totalPago),
            color: "var(--green)",
          },
          {
            label: "Pendente pagar",
            value: formatMoney(totalPendente),
            color: "var(--amber)",
          },
        ].map((m) => (
          <div key={m.label} style={S.metricCard}>
            <div
              style={{
                fontSize: "11px",
                color: "var(--text-secondary)",
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

      <div
        style={{
          display: "flex",
          gap: "4px",
          background: "var(--bg-tertiary)",
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
              background: tab === t ? "var(--bg-primary)" : "transparent",
              padding: "6px 16px",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: tab === t ? 600 : 400,
              color:
                tab === t ? "var(--text-primary)" : "var(--text-secondary)",
              cursor: "pointer",
              fontFamily: "inherit",
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
            ...S.btnPrimary,
            background: showForm ? "var(--text-muted)" : "var(--blue)",
          }}
        >
          {showForm
            ? "Cancelar"
            : tab === "diaristas"
              ? "+ Novo Diarista"
              : "+ Registrar Pagamento"}
        </button>
      </div>

      {showForm && tab === "diaristas" && (
        <div style={{ ...S.card, marginBottom: "16px" }}>
          <h3
            style={{
              fontSize: "14px",
              fontWeight: 600,
              marginBottom: "16px",
              color: "var(--text-primary)",
            }}
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
                <label style={S.label}>Nome</label>
                <input
                  value={formD.nome}
                  onChange={(e) =>
                    setFormD((p) => ({ ...p, nome: e.target.value }))
                  }
                  required
                  placeholder="Nome completo"
                  style={S.input}
                />
              </div>
              <div>
                <label style={S.label}>Função</label>
                <select
                  value={formD.funcao}
                  onChange={(e) =>
                    setFormD((p) => ({ ...p, funcao: e.target.value }))
                  }
                  required
                  style={S.input}
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
                <label style={S.label}>Telefone</label>
                <input
                  value={formD.telefone}
                  onChange={(e) =>
                    setFormD((p) => ({ ...p, telefone: e.target.value }))
                  }
                  placeholder="(85) 99999-0000"
                  style={S.input}
                />
              </div>
              <div>
                <label style={S.label}>Obra</label>
                <select
                  value={formD.obraId}
                  onChange={(e) =>
                    setFormD((p) => ({ ...p, obraId: e.target.value }))
                  }
                  required
                  style={S.input}
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
                ...S.btnPrimary,
                marginTop: "16px",
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? "Salvando..." : "Salvar Diarista"}
            </button>
          </form>
        </div>
      )}

      {showForm && tab === "pagamentos" && (
        <div style={{ ...S.card, marginBottom: "16px" }}>
          <h3
            style={{
              fontSize: "14px",
              fontWeight: 600,
              marginBottom: "16px",
              color: "var(--text-primary)",
            }}
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
                <label style={S.label}>Diarista</label>
                <select
                  value={formP.diaristaId}
                  onChange={(e) =>
                    setFormP((p) => ({ ...p, diaristaId: e.target.value }))
                  }
                  required
                  style={S.input}
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
                <label style={S.label}>Dias trabalhados</label>
                <input
                  type="number"
                  value={formP.diasTrab}
                  onChange={(e) =>
                    setFormP((p) => ({ ...p, diasTrab: e.target.value }))
                  }
                  required
                  placeholder="Ex: 5"
                  style={S.input}
                />
              </div>
              <div>
                <label style={S.label}>Valor por dia (R$)</label>
                <input
                  type="number"
                  value={formP.valorDia}
                  onChange={(e) =>
                    setFormP((p) => ({ ...p, valorDia: e.target.value }))
                  }
                  required
                  placeholder="Ex: 180"
                  style={S.input}
                />
              </div>
              <div>
                <label style={S.label}>Status</label>
                <select
                  value={formP.status}
                  onChange={(e) =>
                    setFormP((p) => ({ ...p, status: e.target.value }))
                  }
                  style={S.input}
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
                  background: "var(--bg-tertiary)",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  fontSize: "13px",
                  color: "var(--blue)",
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
                ...S.btnPrimary,
                marginTop: "16px",
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? "Salvando..." : "Salvar Pagamento"}
            </button>
          </form>
        </div>
      )}

      {tab === "diaristas" && (
        <div style={S.card}>
          {diaristas.length === 0 ? (
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              Nenhum diarista cadastrado.
            </p>
          ) : (
            <table style={S.table}>
              <thead>
                <tr>
                  {["Nome", "Função", "Telefone", "Obra"].map((h) => (
                    <th key={h} style={S.th}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {diaristas.map((d) => (
                  <tr key={d.id}>
                    <td style={{ ...S.td, fontWeight: 600 }}>{d.nome}</td>
                    <td style={S.td}>{d.funcao}</td>
                    <td style={S.td}>{d.telefone || "—"}</td>
                    <td style={S.td}>{d.obra?.centroCusto}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "pagamentos" && (
        <div style={S.card}>
          {pagamentos.length === 0 ? (
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              Nenhum pagamento registrado.
            </p>
          ) : (
            <table style={S.table}>
              <thead>
                <tr>
                  {[
                    "Diarista",
                    "Função",
                    "Obra",
                    "Dias",
                    "Valor/d",
                    "Total",
                    "Status",
                  ].map((h) => (
                    <th key={h} style={S.th}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagamentos.map((p) => (
                  <tr key={p.id}>
                    <td style={{ ...S.td, fontWeight: 600 }}>
                      {p.diarista?.nome}
                    </td>
                    <td style={S.td}>{p.diarista?.funcao}</td>
                    <td style={S.td}>{p.obra?.centroCusto}</td>
                    <td style={S.td}>{p.diasTrab}</td>
                    <td style={S.td}>{formatMoney(p.valorDia)}</td>
                    <td style={{ ...S.td, fontWeight: 600 }}>
                      {formatMoney(p.total)}
                    </td>
                    <td style={S.td}>
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
