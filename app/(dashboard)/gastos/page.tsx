"use client";

import { useEffect, useState } from "react";
import * as S from "@/lib/styles";

interface Obra {
  id: string;
  centroCusto: string;
  cliente: { nome: string };
}
interface Gasto {
  id: string;
  descricao: string;
  justificativa: string;
  valor: number;
  data: string;
  obra: Obra;
}

function formatMoney(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function GastosPage() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [form, setForm] = useState({
    descricao: "",
    justificativa: "",
    obraId: "",
    valor: "",
    data: "",
  });

  async function loadData() {
    const [g, o] = await Promise.all([
      fetch("/api/gastos").then((r) => r.json()),
      fetch("/api/obras").then((r) => r.json()),
    ]);
    setGastos(Array.isArray(g) ? g : []);
    setObras(Array.isArray(o) ? o : []);
    setLoading(false);
  }

  useEffect(() => {
    const fetchData = async () => {
      await loadData();
    };
    fetchData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/gastos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, valor: Number(form.valor) }),
    });
    setForm({
      descricao: "",
      justificativa: "",
      obraId: "",
      valor: "",
      data: "",
    });
    setShowForm(false);
    setSaving(false);
    loadData();
  }

  async function excluir(id: string) {
    await fetch(`/api/gastos/${id}`, { method: "DELETE" });
    setConfirmDelete(null);
    loadData();
  }

  const total = gastos.reduce((a, g) => a + g.valor, 0);

  if (loading)
    return <div style={{ color: "var(--text-muted)" }}>Carregando...</div>;

  return (
    <div>
      {confirmDelete && (
        <div style={S.modal}>
          <div style={{ ...S.modalBox, width: "360px" }}>
            <h3
              style={{
                fontSize: "15px",
                fontWeight: 600,
                marginBottom: "8px",
                color: "var(--text-primary)",
              }}
            >
              🗑️ Excluir gasto?
            </h3>
            <p
              style={{
                fontSize: "13px",
                color: "var(--text-secondary)",
                marginBottom: "20px",
              }}
            >
              Esta ação não pode ser desfeita.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => excluir(confirmDelete)}
                style={{
                  background: "var(--red)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "9px 20px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Sim, excluir
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                style={S.btnSecondary}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <div style={{ ...S.alertWarning, margin: 0 }}>
          ⚠ {gastos.length} gasto(s) esporádico(s) — total:{" "}
          <strong>{formatMoney(total)}</strong>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            ...S.btnPrimary,
            background: showForm ? "var(--text-muted)" : "var(--blue)",
          }}
        >
          {showForm ? "Cancelar" : "+ Registrar Gasto"}
        </button>
      </div>

      {showForm && (
        <div style={{ ...S.card, marginBottom: "16px" }}>
          <h3
            style={{
              fontSize: "14px",
              fontWeight: 600,
              marginBottom: "16px",
              color: "var(--text-primary)",
            }}
          >
            Registrar Gasto Esporádico
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
                <label style={S.label}>Descrição</label>
                <input
                  value={form.descricao}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, descricao: e.target.value }))
                  }
                  required
                  placeholder="Ex: Gesso extra..."
                  style={S.input}
                />
              </div>
              <div>
                <label style={S.label}>Obra</label>
                <select
                  value={form.obraId}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, obraId: e.target.value }))
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
              <div style={{ gridColumn: "1/-1" }}>
                <label style={S.label}>Justificativa (obrigatório)</label>
                <input
                  value={form.justificativa}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, justificativa: e.target.value }))
                  }
                  required
                  placeholder="Por que esse gasto não estava previsto?"
                  style={S.input}
                />
              </div>
              <div>
                <label style={S.label}>Valor (R$)</label>
                <input
                  type="number"
                  value={form.valor}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, valor: e.target.value }))
                  }
                  required
                  placeholder="0,00"
                  style={S.input}
                />
              </div>
              <div>
                <label style={S.label}>Data</label>
                <input
                  type="date"
                  value={form.data}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, data: e.target.value }))
                  }
                  style={S.input}
                />
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
              {saving ? "Salvando..." : "Salvar Gasto"}
            </button>
          </form>
        </div>
      )}

      <div style={S.card}>
        <h3 style={S.cardTitle}>Gastos Registrados</h3>
        {gastos.length === 0 ? (
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Nenhum gasto esporádico registrado.
          </p>
        ) : (
          <table style={S.table}>
            <thead>
              <tr>
                {[
                  "Data",
                  "Descrição",
                  "Justificativa",
                  "Obra",
                  "Valor",
                  "",
                ].map((h) => (
                  <th key={h} style={S.th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {gastos.map((g) => (
                <tr key={g.id}>
                  <td style={{ ...S.td, color: "var(--text-secondary)" }}>
                    {new Date(g.data).toLocaleDateString("pt-BR")}
                  </td>
                  <td style={{ ...S.td, fontWeight: 600 }}>{g.descricao}</td>
                  <td
                    style={{
                      ...S.td,
                      color: "var(--text-secondary)",
                      fontSize: "12px",
                    }}
                  >
                    {g.justificativa}
                  </td>
                  <td style={S.td}>{g.obra?.centroCusto}</td>
                  <td style={{ ...S.td, color: "var(--red)", fontWeight: 600 }}>
                    {formatMoney(g.valor)}
                  </td>
                  <td style={S.td}>
                    <button
                      onClick={() => setConfirmDelete(g.id)}
                      style={{
                        background: "#FCEBEB",
                        color: "#791F1F",
                        border: "none",
                        borderRadius: "6px",
                        padding: "4px 8px",
                        fontSize: "11px",
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
