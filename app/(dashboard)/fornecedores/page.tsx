"use client";

import { useEffect, useState } from "react";
import * as S from "@/lib/styles";

interface Fornecedor {
  id: string;
  razaoSocial: string;
  cnpj: string;
  categoria: string;
  pedidoMinimo: number;
  telefone: string;
  email: string;
  vendedor: string;
  condicaoPagto: string;
  cidade: string;
  materiais: string;
}

const CATEGORIAS = ["loja", "distribuidor", "representante"];
const PAGTOS = [
  "À vista / PIX",
  "30 dias",
  "30/60 dias",
  "30/60/90 dias",
  "Misto",
];

const catColors: Record<string, { bg: string; color: string }> = {
  loja: { bg: "#E1F5EE", color: "#085041" },
  distribuidor: { bg: "#EEEDFE", color: "#3C3489" },
  representante: { bg: "#FAEEDA", color: "#633806" },
};

function formatMoney(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ─── Máscaras ────────────────────────────────────────────────────────────────
function maskCNPJ(v: string) {
  return v
    .replace(/\D/g, "")
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function maskTelefone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) {
    return d.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  }
  return d
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{1})(\d{4})(\d)/, "$1 $2-$3");
}

function maskCEP(v: string) {
  return v
    .replace(/\D/g, "")
    .slice(0, 8)
    .replace(/^(\d{5})(\d)/, "$1-$2");
}

function rawCNPJ(v: string) {
  return v.replace(/\D/g, "");
}
function rawCEP(v: string) {
  return v.replace(/\D/g, "");
}

// ─── Página ──────────────────────────────────────────────────────────────────
export default function FornecedoresPage() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filtro, setFiltro] = useState("todos");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [buscandoCNPJ, setBuscandoCNPJ] = useState(false);
  const [buscandoCEP, setBuscandoCEP] = useState(false);

  const formVazio = {
    razaoSocial: "",
    cnpj: "",
    categoria: "loja",
    pedidoMinimo: "",
    telefone: "",
    email: "",
    vendedor: "",
    condicaoPagto: "À vista / PIX",
    cep: "",
    endereco: "",
    cidade: "",
    materiais: "",
  };
  const [form, setForm] = useState(formVazio);

  async function loadData() {
    const res = await fetch("/api/fornecedores");
    const data = await res.json();
    setFornecedores(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => {
    let ativo = true;
    async function buscar() {
      const res = await fetch("/api/fornecedores");
      const data = await res.json();
      if (ativo) {
        setFornecedores(Array.isArray(data) ? data : []);
        setLoading(false);
      }
    }
    buscar();
    return () => {
      ativo = false;
    };
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleCNPJ(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, cnpj: maskCNPJ(e.target.value) }));
  }

  function handleTelefone(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, telefone: maskTelefone(e.target.value) }));
  }

  function handleCEP(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, cep: maskCEP(e.target.value) }));
  }

  // Auto-complete CNPJ via ReceitaWS
  async function buscarCNPJ() {
    const cnpj = rawCNPJ(form.cnpj);
    if (cnpj.length !== 14) return;
    setBuscandoCNPJ(true);
    try {
      const res = await fetch(`https://receitaws.com.br/v1/cnpj/${cnpj}`);
      const data = await res.json();
      if (data.status === "OK") {
        setForm((prev) => ({
          ...prev,
          razaoSocial: data.nome || prev.razaoSocial,
          email: data.email || prev.email,
          telefone: data.telefone ? maskTelefone(data.telefone) : prev.telefone,
          cep: data.cep ? maskCEP(data.cep) : prev.cep,
          endereco: data.logradouro
            ? `${data.logradouro}${data.numero ? ", " + data.numero : ""}${data.bairro ? " - " + data.bairro : ""}`
            : prev.endereco,
          cidade:
            data.municipio && data.uf
              ? `${data.municipio} / ${data.uf}`
              : prev.cidade,
        }));
      }
    } catch {
      // silencia erro de rede
    } finally {
      setBuscandoCNPJ(false);
    }
  }

  // Auto-complete CEP via ViaCEP
  async function buscarCEP() {
    const cep = rawCEP(form.cep);
    if (cep.length !== 8) return;
    setBuscandoCEP(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setForm((prev) => ({
          ...prev,
          endereco: `${data.logradouro}${data.bairro ? " - " + data.bairro : ""}`,
          cidade:
            data.localidade && data.uf
              ? `${data.localidade} / ${data.uf}`
              : prev.cidade,
        }));
      }
    } catch {
      // silencia erro de rede
    } finally {
      setBuscandoCEP(false);
    }
  }

  function abrirEdicao(f: Fornecedor) {
    setEditandoId(f.id);
    setForm({
      razaoSocial: f.razaoSocial,
      cnpj: f.cnpj,
      categoria: f.categoria,
      pedidoMinimo: String(f.pedidoMinimo || ""),
      telefone: f.telefone || "",
      email: f.email || "",
      vendedor: f.vendedor || "",
      condicaoPagto: f.condicaoPagto || "À vista / PIX",
      cep: "",
      endereco: "",
      cidade: f.cidade || "",
      materiais: f.materiais || "",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelarForm() {
    setShowForm(false);
    setEditandoId(null);
    setForm(formVazio);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const body = { ...form, pedidoMinimo: Number(form.pedidoMinimo || 0) };
    if (editandoId) {
      await fetch(`/api/fornecedores/${editandoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      await fetch("/api/fornecedores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }
    cancelarForm();
    setSaving(false);
    loadData();
  }

  async function excluir(id: string) {
    await fetch(`/api/fornecedores/${id}`, { method: "DELETE" });
    setConfirmDelete(null);
    loadData();
  }

  const filtrados =
    filtro === "todos"
      ? fornecedores
      : fornecedores.filter((f) => f.categoria === filtro);

  if (loading)
    return <div style={{ color: "var(--text-muted)" }}>Carregando...</div>;

  return (
    <div>
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
              Excluir fornecedor?
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
        <div style={{ display: "flex", gap: "6px" }}>
          {["todos", ...CATEGORIAS].map((c) => (
            <button
              key={c}
              onClick={() => setFiltro(c)}
              style={{
                border: "1px solid var(--border)",
                borderRadius: "20px",
                padding: "4px 12px",
                fontSize: "12px",
                cursor: "pointer",
                fontFamily: "inherit",
                background: filtro === c ? "var(--blue)" : "var(--bg-primary)",
                color: filtro === c ? "#fff" : "var(--text-secondary)",
                fontWeight: filtro === c ? 600 : 400,
              }}
            >
              {c === "todos" ? "Todos" : c}
            </button>
          ))}
        </div>
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
          {showForm ? "Cancelar" : "+ Novo Fornecedor"}
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
            {editandoId ? "✏️ Editar Fornecedor" : "Cadastrar Fornecedor"}
          </h3>
          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              {/* CNPJ com auto-complete */}
              <div>
                <label style={S.label}>CNPJ</label>
                <div style={{ position: "relative" }}>
                  <input
                    name="cnpj"
                    value={form.cnpj}
                    onChange={handleCNPJ}
                    onBlur={buscarCNPJ}
                    required
                    placeholder="00.000.000/0001-00"
                    style={{
                      ...S.input,
                      paddingRight: buscandoCNPJ ? "36px" : undefined,
                    }}
                  />
                  {buscandoCNPJ && (
                    <span
                      style={{
                        position: "absolute",
                        right: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: 11,
                        color: "var(--text-muted)",
                      }}
                    >
                      ⏳
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  Preencha e saia do campo para auto-completar
                </span>
              </div>

              {/* Razão Social */}
              <div>
                <label style={S.label}>Razão Social</label>
                <input
                  name="razaoSocial"
                  value={form.razaoSocial}
                  onChange={handleChange}
                  required
                  placeholder="Nome ou razão social"
                  style={S.input}
                />
              </div>

              {/* Categoria */}
              <div>
                <label style={S.label}>Categoria</label>
                <select
                  name="categoria"
                  value={form.categoria}
                  onChange={handleChange}
                  style={S.input}
                >
                  {CATEGORIAS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pedido mínimo */}
              <div>
                <label style={S.label}>Pedido Mínimo (R$)</label>
                <input
                  name="pedidoMinimo"
                  type="number"
                  value={form.pedidoMinimo}
                  onChange={handleChange}
                  placeholder="0,00"
                  style={S.input}
                />
              </div>

              {/* Telefone com máscara */}
              <div>
                <label style={S.label}>Telefone / WhatsApp</label>
                <input
                  name="telefone"
                  value={form.telefone}
                  onChange={handleTelefone}
                  placeholder="(85) 9 9999-0000"
                  style={S.input}
                />
              </div>

              {/* E-mail */}
              <div>
                <label style={S.label}>E-mail</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="contato@fornecedor.com"
                  style={S.input}
                />
              </div>

              {/* Vendedor */}
              <div>
                <label style={S.label}>Vendedor responsável</label>
                <input
                  name="vendedor"
                  value={form.vendedor}
                  onChange={handleChange}
                  placeholder="Nome do vendedor"
                  style={S.input}
                />
              </div>

              {/* Condição pagamento */}
              <div>
                <label style={S.label}>Condição de pagamento</label>
                <select
                  name="condicaoPagto"
                  value={form.condicaoPagto}
                  onChange={handleChange}
                  style={S.input}
                >
                  {PAGTOS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* CEP com auto-complete */}
              <div>
                <label style={S.label}>CEP</label>
                <div style={{ position: "relative" }}>
                  <input
                    name="cep"
                    value={form.cep}
                    onChange={handleCEP}
                    onBlur={buscarCEP}
                    placeholder="00000-000"
                    style={{
                      ...S.input,
                      paddingRight: buscandoCEP ? "36px" : undefined,
                    }}
                  />
                  {buscandoCEP && (
                    <span
                      style={{
                        position: "absolute",
                        right: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: 11,
                        color: "var(--text-muted)",
                      }}
                    >
                      ⏳
                    </span>
                  )}
                </div>
              </div>

              {/* Endereço — preenchido pelo CEP */}
              <div>
                <label style={S.label}>Endereço</label>
                <input
                  name="endereco"
                  value={form.endereco}
                  onChange={handleChange}
                  placeholder="Preenchido pelo CEP"
                  style={S.input}
                />
              </div>

              {/* Cidade — preenchida pelo CEP ou CNPJ */}
              <div>
                <label style={S.label}>Cidade / UF</label>
                <input
                  name="cidade"
                  value={form.cidade}
                  onChange={handleChange}
                  placeholder="Fortaleza / CE"
                  style={S.input}
                />
              </div>

              {/* Materiais */}
              <div style={{ gridColumn: "1/-1" }}>
                <label style={S.label}>Materiais fornecidos</label>
                <input
                  name="materiais"
                  value={form.materiais}
                  onChange={handleChange}
                  placeholder="Ex: Gesso, cimento, tinta..."
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
                    : "Salvar Fornecedor"}
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
        {filtrados.length === 0 ? (
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Nenhum fornecedor encontrado.
          </p>
        ) : (
          filtrados.map((f) => {
            const cat = catColors[f.categoria] || {
              bg: "var(--bg-tertiary)",
              color: "var(--text-secondary)",
            };
            const initials = f.razaoSocial
              .split(" ")
              .map((w: string) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            return (
              <div key={f.id} style={S.card}>
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
                        borderRadius: "8px",
                        background: cat.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: "13px",
                        color: cat.color,
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
                        {f.razaoSocial}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "6px",
                          marginTop: "4px",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            ...cat,
                            padding: "2px 8px",
                            borderRadius: "10px",
                            fontSize: "11px",
                            fontWeight: 600,
                          }}
                        >
                          {f.categoria}
                        </span>
                        <span
                          style={{
                            fontSize: "11px",
                            color: "var(--text-muted)",
                          }}
                        >
                          {f.cnpj}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      onClick={() => abrirEdicao(f)}
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
                      onClick={() => setConfirmDelete(f.id)}
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
                  {f.telefone && (
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>Tel: </span>
                      <span style={{ color: "var(--text-primary)" }}>
                        {f.telefone}
                      </span>
                    </div>
                  )}
                  {f.email && (
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>
                        Email:{" "}
                      </span>
                      <span style={{ color: "var(--text-primary)" }}>
                        {f.email}
                      </span>
                    </div>
                  )}
                  {f.vendedor && (
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>
                        Vendedor:{" "}
                      </span>
                      <span style={{ color: "var(--text-primary)" }}>
                        {f.vendedor}
                      </span>
                    </div>
                  )}
                  {f.condicaoPagto && (
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>
                        Pagto:{" "}
                      </span>
                      <span style={{ color: "var(--text-primary)" }}>
                        {f.condicaoPagto}
                      </span>
                    </div>
                  )}
                  {f.cidade && (
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>
                        Cidade:{" "}
                      </span>
                      <span style={{ color: "var(--text-primary)" }}>
                        {f.cidade}
                      </span>
                    </div>
                  )}
                  {f.pedidoMinimo > 0 && (
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>
                        Ped. mín.:{" "}
                      </span>
                      <strong style={{ color: "var(--text-primary)" }}>
                        {formatMoney(f.pedidoMinimo)}
                      </strong>
                    </div>
                  )}
                  {f.materiais && (
                    <div style={{ gridColumn: "1/-1", marginTop: "6px" }}>
                      <span style={{ color: "var(--text-muted)" }}>
                        Materiais:{" "}
                      </span>
                      <span style={{ color: "var(--text-primary)" }}>
                        {f.materiais}
                      </span>
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
