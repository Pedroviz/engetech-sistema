"use client";

import { useEffect, useState } from "react";
import * as S from "@/lib/styles";

interface Cliente {
  id: string;
  nome: string;
  segmento: string;
  classificacao: string;
  whatsapp: string;
  email: string;
  clienteDesde: string;
  observacoes: string;
}

const SEGMENTOS = ["residencial", "comercial", "industrial"];
const CLASSIFICACOES = ["novo", "recorrente", "fidelizado"];

const classColors: Record<string, { bg: string; color: string }> = {
  fidelizado: { bg: "#EEEDFE", color: "#3C3489" },
  recorrente: { bg: "#E6F1FB", color: "#0C447C" },
  novo: { bg: "#E1F5EE", color: "#085041" },
};

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [form, setForm] = useState({
    nome: "",
    segmento: "residencial",
    classificacao: "novo",
    whatsapp: "",
    email: "",
    clienteDesde: "",
    observacoes: "",
  });

  async function loadData() {
    const res = await fetch("/api/clientes");
    const data = await res.json();
    setClientes(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => {
    async function init() {
      await loadData();
    }
    void init();
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function abrirEdicao(c: Cliente) {
    setEditandoId(c.id);
    setForm({
      nome: c.nome,
      segmento: c.segmento,
      classificacao: c.classificacao,
      whatsapp: c.whatsapp || "",
      email: c.email || "",
      clienteDesde: c.clienteDesde || "",
      observacoes: c.observacoes || "",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelarForm() {
    setShowForm(false);
    setEditandoId(null);
    setForm({
      nome: "",
      segmento: "residencial",
      classificacao: "novo",
      whatsapp: "",
      email: "",
      clienteDesde: "",
      observacoes: "",
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    if (editandoId) {
      await fetch(`/api/clientes/${editandoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    cancelarForm();
    setSaving(false);
    loadData();
  }

  async function excluir(id: string) {
    await fetch(`/api/clientes/${id}`, { method: "DELETE" });
    setConfirmDelete(null);
    loadData();
  }

  if (loading)
    return <div style={{ color: "var(--text-muted)" }}>Carregando...</div>;

  return (
    <div>
      {/* Modal excluir */}
      {confirmDelete && (
        <div style={S.modal}>
          <div style={{ ...S.modalBox, width: "360px" }}>
            <div style={{ fontSize: "20px", marginBottom: "8px" }}>🗑️</div>
            <h3
              style={{
                fontSize: "15px",
                fontWeight: 600,
                marginBottom: "8px",
                color: "var(--text-primary)",
              }}
            >
              Excluir cliente?
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
          {clientes.length} cliente(s) na base
        </p>
        <button
          onClick={() => {
            cancelarForm();
            setShowForm(!showForm);
          }}
          style={{
            ...S.btnPrimary,
            background: showForm ? "var(--text-muted)" : "var(--blue)",
          }}
        >
          {showForm ? "Cancelar" : "+ Novo Cliente"}
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
            {editandoId ? "✏️ Editar Cliente" : "Cadastrar Cliente"}
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
                <label style={S.label}>Nome / Empresa</label>
                <input
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  required
                  placeholder="Nome completo ou razão social"
                  style={S.input}
                />
              </div>
              <div>
                <label style={S.label}>Segmento</label>
                <select
                  name="segmento"
                  value={form.segmento}
                  onChange={handleChange}
                  style={S.input}
                >
                  {SEGMENTOS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={S.label}>Classificação</label>
                <select
                  name="classificacao"
                  value={form.classificacao}
                  onChange={handleChange}
                  style={S.input}
                >
                  {CLASSIFICACOES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={S.label}>Cliente desde (ano)</label>
                <input
                  name="clienteDesde"
                  value={form.clienteDesde}
                  onChange={handleChange}
                  placeholder="Ex: 2020"
                  style={S.input}
                />
              </div>
              <div>
                <label style={S.label}>WhatsApp</label>
                <input
                  name="whatsapp"
                  value={form.whatsapp}
                  onChange={handleChange}
                  placeholder="(85) 99999-0000"
                  style={S.input}
                />
              </div>
              <div>
                <label style={S.label}>E-mail</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="email@exemplo.com"
                  style={S.input}
                />
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={S.label}>Observações</label>
                <input
                  name="observacoes"
                  value={form.observacoes}
                  onChange={handleChange}
                  placeholder="Informações relevantes..."
                  style={S.input}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <button
                type="submit"
                disabled={saving}
                style={{ ...S.btnPrimary, opacity: saving ? 0.6 : 1 }}
              >
                {saving
                  ? "Salvando..."
                  : editandoId
                    ? "Salvar alterações"
                    : "Salvar Cliente"}
              </button>
              <button
                type="button"
                onClick={cancelarForm}
                style={S.btnSecondary}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}
      >
        {clientes.length === 0 ? (
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Nenhum cliente cadastrado.
          </p>
        ) : (
          clientes.map((c) => {
            const cls = classColors[c.classificacao] || {
              bg: "var(--bg-tertiary)",
              color: "var(--text-secondary)",
            };
            const initials = c.nome
              .split(" ")
              .map((w: string) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            return (
              <div key={c.id} style={S.card}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        background: cls.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: "14px",
                        color: cls.color,
                        flexShrink: 0,
                      }}
                    >
                      {initials}
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: "14px",
                          color: "var(--text-primary)",
                        }}
                      >
                        {c.nome}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "6px",
                          marginTop: "4px",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            ...cls,
                            padding: "2px 8px",
                            borderRadius: "10px",
                            fontSize: "11px",
                            fontWeight: 600,
                          }}
                        >
                          {c.classificacao}
                        </span>
                        <span
                          style={{
                            background: "var(--bg-tertiary)",
                            color: "var(--text-secondary)",
                            padding: "2px 8px",
                            borderRadius: "10px",
                            fontSize: "11px",
                            fontWeight: 600,
                          }}
                        >
                          {c.segmento}
                        </span>
                        {c.clienteDesde && (
                          <span
                            style={{
                              fontSize: "11px",
                              color: "var(--text-muted)",
                            }}
                          >
                            desde {c.clienteDesde}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      onClick={() => abrirEdicao(c)}
                      style={{
                        background: "#FAEEDA",
                        color: "#633806",
                        border: "none",
                        borderRadius: "6px",
                        padding: "4px 9px",
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => setConfirmDelete(c.id)}
                      style={{
                        background: "#FCEBEB",
                        color: "#791F1F",
                        border: "none",
                        borderRadius: "6px",
                        padding: "4px 9px",
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "4px",
                    fontSize: "12px",
                    borderTop: "1px solid var(--border)",
                    paddingTop: "10px",
                  }}
                >
                  {c.whatsapp && (
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>
                        WhatsApp:{" "}
                      </span>
                      <span style={{ color: "var(--text-primary)" }}>
                        {c.whatsapp}
                      </span>
                    </div>
                  )}
                  {c.email && (
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>
                        Email:{" "}
                      </span>
                      <span style={{ color: "var(--text-primary)" }}>
                        {c.email}
                      </span>
                    </div>
                  )}
                  {c.observacoes && (
                    <div
                      style={{
                        gridColumn: "1/-1",
                        color: "var(--text-secondary)",
                        marginTop: "4px",
                      }}
                    >
                      📝 {c.observacoes}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
