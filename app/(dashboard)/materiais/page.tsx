"use client";

import { useEffect, useState } from "react";
import * as S from "@/lib/styles";

interface Obra {
  id: string;
  centroCusto: string;
  cliente: { nome: string };
}
interface Fornecedor {
  id: string;
  razaoSocial: string;
}
interface Material {
  id: string;
  nome: string;
  orcado: number;
  utilizado: number;
  obra: Obra;
  fornecedor: Fornecedor | null;
}

function formatMoney(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function statusMat(mat: Material) {
  const saldo = mat.orcado - mat.utilizado;
  if (saldo < 0) return { label: "Estourado", bg: "#FCEBEB", color: "#791F1F" };
  if (saldo < mat.orcado * 0.15)
    return { label: "Atenção", bg: "#FAEEDA", color: "#633806" };
  return { label: "Ok", bg: "#EAF3DE", color: "#27500A" };
}

export default function MateriaisPage() {
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [obras, setObras] = useState<Obra[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [form, setForm] = useState({
    nome: "",
    obraId: "",
    fornecedorId: "",
    orcado: "",
    utilizado: "",
  });

  async function loadData() {
    const [m, o, f] = await Promise.all([
      fetch("/api/materiais").then((r) => r.json()),
      fetch("/api/obras").then((r) => r.json()),
      fetch("/api/fornecedores").then((r) => r.json()),
    ]);

    setMateriais(Array.isArray(m) ? m : []);
    setObras(Array.isArray(o) ? o : []);
    setFornecedores(Array.isArray(f) ? f : []);
    setLoading(false);
  }

  useEffect(() => {
    async function init() {
      await loadData();
    }
    void init();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/materiais", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        orcado: Number(form.orcado),
        utilizado: Number(form.utilizado || 0),
      }),
    });
    setForm({
      nome: "",
      obraId: "",
      fornecedorId: "",
      orcado: "",
      utilizado: "",
    });
    setShowForm(false);
    setSaving(false);
    loadData();
  }

  async function excluir(id: string) {
    await fetch(`/api/materiais/${id}`, { method: "DELETE" });
    setConfirmDelete(null);
    loadData();
  }

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
              🗑️ Excluir material?
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
        <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
          {materiais.length} material(is) cadastrado(s)
        </p>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            ...S.btnPrimary,
            background: showForm ? "var(--text-muted)" : "var(--blue)",
          }}
        >
          {showForm ? "Cancelar" : "+ Novo Material"}
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
            Registrar Material
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
                <label style={S.label}>Nome do material</label>
                <input
                  value={form.nome}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, nome: e.target.value }))
                  }
                  required
                  placeholder="Ex: Gesso, Cimento..."
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
                <label style={S.label}>Fornecedor (opcional)</label>
                <select
                  value={form.fornecedorId}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, fornecedorId: e.target.value }))
                  }
                  style={S.input}
                >
                  <option value="">Selecione...</option>
                  {fornecedores.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.razaoSocial}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={S.label}>Valor orçado (R$)</label>
                <input
                  type="number"
                  value={form.orcado}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, orcado: e.target.value }))
                  }
                  required
                  placeholder="0,00"
                  style={S.input}
                />
              </div>
              <div>
                <label style={S.label}>Valor utilizado (R$)</label>
                <input
                  type="number"
                  value={form.utilizado}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, utilizado: e.target.value }))
                  }
                  placeholder="0,00"
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
              {saving ? "Salvando..." : "Salvar Material"}
            </button>
          </form>
        </div>
      )}

      <div style={S.card}>
        <h3 style={S.cardTitle}>Controle de Materiais</h3>
        {materiais.length === 0 ? (
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Nenhum material cadastrado.
          </p>
        ) : (
          <table style={S.table}>
            <thead>
              <tr>
                {[
                  "Material",
                  "Obra",
                  "Fornecedor",
                  "Orçado",
                  "Utilizado",
                  "Saldo",
                  "Status",
                  "",
                ].map((h) => (
                  <th key={h} style={S.th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {materiais.map((m) => {
                const saldo = m.orcado - m.utilizado;
                const st = statusMat(m);
                return (
                  <tr key={m.id}>
                    <td style={{ ...S.td, fontWeight: 600 }}>{m.nome}</td>
                    <td style={S.td}>{m.obra?.centroCusto}</td>
                    <td style={S.td}>{m.fornecedor?.razaoSocial || "—"}</td>
                    <td style={S.td}>{formatMoney(m.orcado)}</td>
                    <td style={{ ...S.td, color: "var(--red)" }}>
                      {formatMoney(m.utilizado)}
                    </td>
                    <td
                      style={{
                        ...S.td,
                        color: saldo < 0 ? "var(--red)" : "var(--green)",
                        fontWeight: 600,
                      }}
                    >
                      {formatMoney(saldo)}
                    </td>
                    <td style={S.td}>
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
                    <td style={S.td}>
                      <button
                        onClick={() => setConfirmDelete(m.id)}
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
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
