"use client";

import { useEffect, useState, useCallback } from "react";
import * as S from "@/lib/styles";

interface Obra {
  id: string;
  centroCusto: string;
  cliente: { nome: string };
}
interface Lancamento {
  id: string;
  descricao: string;
  tipo: string;
  categoria: string;
  valor: number;
  data: string;
  obra: Obra;
}

const CATEGORIAS = [
  "recebimento",
  "material",
  "mao_obra",
  "esporadico",
  "outro",
];

function formatMoney(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function FinanceiroPage() {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [form, setForm] = useState({
    descricao: "",
    obraId: "",
    tipo: "entrada",
    categoria: "recebimento",
    valor: "",
    data: "",
  });

  const loadData = useCallback(async () => {
    const [l, o] = await Promise.all([
      fetch("/api/lancamentos").then((r) => r.json()),
      fetch("/api/obras").then((r) => r.json()),
    ]);
    setLancamentos(Array.isArray(l) ? l : []);
    setObras(Array.isArray(o) ? o : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    async function fetchInitialData() {
      await loadData();
    }
    fetchInitialData();
  }, [loadData]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/lancamentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, valor: Number(form.valor) }),
    });
    setForm({
      descricao: "",
      obraId: "",
      tipo: "entrada",
      categoria: "recebimento",
      valor: "",
      data: "",
    });
    setShowForm(false);
    setSaving(false);
    loadData();
  }

  async function excluir(id: string) {
    await fetch(`/api/lancamentos/${id}`, { method: "DELETE" });
    setConfirmDelete(null);
    loadData();
  }

  const entradas = lancamentos
    .filter((l) => l.tipo === "entrada")
    .reduce((a, l) => a + l.valor, 0);
  const saidas = lancamentos
    .filter((l) => l.tipo === "saida")
    .reduce((a, l) => a + l.valor, 0);
  const saldo = entradas - saidas;

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
              🗑️ Excluir lançamento?
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
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        {[
          {
            label: "Total entradas",
            value: formatMoney(entradas),
            color: "var(--green)",
          },
          {
            label: "Total saídas",
            value: formatMoney(saidas),
            color: "var(--red)",
          },
          {
            label: "Saldo",
            value: formatMoney(saldo),
            color: saldo >= 0 ? "var(--blue)" : "var(--red)",
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
            <div style={{ fontSize: "22px", fontWeight: 700, color: m.color }}>
              {m.value}
            </div>
          </div>
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
          {showForm ? "Cancelar" : "+ Novo Lançamento"}
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
            Novo Lançamento
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
                  placeholder="Descreva o lançamento"
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
              <div>
                <label style={S.label}>Tipo</label>
                <select
                  value={form.tipo}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, tipo: e.target.value }))
                  }
                  style={S.input}
                >
                  <option value="entrada">Entrada</option>
                  <option value="saida">Saída</option>
                </select>
              </div>
              <div>
                <label style={S.label}>Categoria</label>
                <select
                  value={form.categoria}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, categoria: e.target.value }))
                  }
                  style={S.input}
                >
                  {CATEGORIAS.map((c) => (
                    <option key={c} value={c}>
                      {c.replace("_", " ")}
                    </option>
                  ))}
                </select>
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
              {saving ? "Salvando..." : "Salvar Lançamento"}
            </button>
          </form>
        </div>
      )}

      <div style={S.card}>
        <h3 style={S.cardTitle}>Lançamentos</h3>
        {lancamentos.length === 0 ? (
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Nenhum lançamento registrado.
          </p>
        ) : (
          <table style={S.table}>
            <thead>
              <tr>
                {[
                  "Data",
                  "Descrição",
                  "Obra",
                  "Categoria",
                  "Tipo",
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
              {lancamentos.map((l) => (
                <tr key={l.id}>
                  <td style={{ ...S.td, color: "var(--text-secondary)" }}>
                    {new Date(l.data).toLocaleDateString("pt-BR")}
                  </td>
                  <td style={{ ...S.td, fontWeight: 600 }}>{l.descricao}</td>
                  <td style={S.td}>{l.obra?.centroCusto}</td>
                  <td style={{ ...S.td, color: "var(--text-secondary)" }}>
                    {l.categoria.replace("_", " ")}
                  </td>
                  <td style={S.td}>
                    <span
                      style={{
                        background:
                          l.tipo === "entrada" ? "#EAF3DE" : "#FCEBEB",
                        color: l.tipo === "entrada" ? "#27500A" : "#791F1F",
                        padding: "2px 8px",
                        borderRadius: "10px",
                        fontSize: "11px",
                        fontWeight: 600,
                      }}
                    >
                      {l.tipo}
                    </span>
                  </td>
                  <td
                    style={{
                      ...S.td,
                      fontWeight: 600,
                      color:
                        l.tipo === "entrada" ? "var(--green)" : "var(--red)",
                    }}
                  >
                    {l.tipo === "entrada" ? "+" : "-"}
                    {formatMoney(l.valor)}
                  </td>
                  <td style={S.td}>
                    <button
                      onClick={() => setConfirmDelete(l.id)}
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
