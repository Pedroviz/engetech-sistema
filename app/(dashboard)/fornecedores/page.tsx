"use client";

import { useEffect, useState } from "react";

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

export default function FornecedoresPage() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    razaoSocial: "",
    cnpj: "",
    categoria: "loja",
    pedidoMinimo: "",
    telefone: "",
    email: "",
    vendedor: "",
    condicaoPagto: "À vista / PIX",
    endereco: "",
    cidade: "",
    materiais: "",
  });

  async function loadData() {
    const res = await fetch("/api/fornecedores");
    const data = await res.json();
    setFornecedores(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => {
    // avoid calling setState synchronously inside the effect body
    async function fetchData() {
      await loadData();
    }
    void fetchData();
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/fornecedores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        pedidoMinimo: Number(form.pedidoMinimo || 0),
      }),
    });
    setForm({
      razaoSocial: "",
      cnpj: "",
      categoria: "loja",
      pedidoMinimo: "",
      telefone: "",
      email: "",
      vendedor: "",
      condicaoPagto: "À vista / PIX",
      endereco: "",
      cidade: "",
      materiais: "",
    });
    setShowForm(false);
    setSaving(false);
    loadData();
  }

  if (loading) return <div style={{ color: "#888" }}>Carregando...</div>;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <p style={{ fontSize: "13px", color: "#888" }}>
          {fornecedores.length} fornecedor(es) cadastrado(s)
        </p>
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
          {showForm ? "Cancelar" : "+ Novo Fornecedor"}
        </button>
      </div>

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
            Cadastrar Fornecedor
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
                <label style={lbl}>Razão Social</label>
                <input
                  name="razaoSocial"
                  value={form.razaoSocial}
                  onChange={handleChange}
                  required
                  placeholder="Nome ou razão social"
                  style={inp}
                />
              </div>
              <div>
                <label style={lbl}>CNPJ</label>
                <input
                  name="cnpj"
                  value={form.cnpj}
                  onChange={handleChange}
                  required
                  placeholder="00.000.000/0001-00"
                  style={inp}
                />
              </div>
              <div>
                <label style={lbl}>Categoria</label>
                <select
                  name="categoria"
                  value={form.categoria}
                  onChange={handleChange}
                  style={inp}
                >
                  {CATEGORIAS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={lbl}>Pedido Mínimo (R$)</label>
                <input
                  name="pedidoMinimo"
                  type="number"
                  value={form.pedidoMinimo}
                  onChange={handleChange}
                  placeholder="0,00 — deixe 0 para lojas"
                  style={inp}
                />
              </div>
              <div>
                <label style={lbl}>Telefone / WhatsApp</label>
                <input
                  name="telefone"
                  value={form.telefone}
                  onChange={handleChange}
                  placeholder="(85) 99999-0000"
                  style={inp}
                />
              </div>
              <div>
                <label style={lbl}>E-mail</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="contato@fornecedor.com"
                  style={inp}
                />
              </div>
              <div>
                <label style={lbl}>Vendedor responsável</label>
                <input
                  name="vendedor"
                  value={form.vendedor}
                  onChange={handleChange}
                  placeholder="Nome do vendedor"
                  style={inp}
                />
              </div>
              <div>
                <label style={lbl}>Condição de pagamento</label>
                <select
                  name="condicaoPagto"
                  value={form.condicaoPagto}
                  onChange={handleChange}
                  style={inp}
                >
                  {PAGTOS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={lbl}>Endereço</label>
                <input
                  name="endereco"
                  value={form.endereco}
                  onChange={handleChange}
                  placeholder="Rua, número, bairro"
                  style={inp}
                />
              </div>
              <div>
                <label style={lbl}>Cidade / UF</label>
                <input
                  name="cidade"
                  value={form.cidade}
                  onChange={handleChange}
                  placeholder="Fortaleza / CE"
                  style={inp}
                />
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={lbl}>Materiais fornecidos</label>
                <input
                  name="materiais"
                  value={form.materiais}
                  onChange={handleChange}
                  placeholder="Ex: Gesso, cimento, tinta, argamassa..."
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
              {saving ? "Salvando..." : "Salvar Fornecedor"}
            </button>
          </form>
        </div>
      )}

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}
      >
        {fornecedores.length === 0 ? (
          <p style={{ fontSize: "13px", color: "#aaa" }}>
            Nenhum fornecedor cadastrado.
          </p>
        ) : (
          fornecedores.map((f) => {
            const cat = catColors[f.categoria] || {
              bg: "#f0f0f0",
              color: "#555",
            };
            const initials = f.razaoSocial
              .split(" ")
              .map((w: string) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            return (
              <div
                key={f.id}
                style={{
                  background: "#fff",
                  border: "1px solid #e0e0e0",
                  borderRadius: "10px",
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "12px",
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
                    <div style={{ fontWeight: 600, fontSize: "14px" }}>
                      {f.razaoSocial}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "6px",
                        marginTop: "4px",
                        flexWrap: "wrap",
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
                      <span style={{ fontSize: "11px", color: "#aaa" }}>
                        {f.cnpj}
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "4px",
                    fontSize: "12px",
                    borderTop: "1px solid #f0f0f0",
                    paddingTop: "10px",
                  }}
                >
                  {f.telefone && (
                    <div>
                      <span style={{ color: "#888" }}>Tel: </span>
                      {f.telefone}
                    </div>
                  )}
                  {f.email && (
                    <div>
                      <span style={{ color: "#888" }}>Email: </span>
                      {f.email}
                    </div>
                  )}
                  {f.vendedor && (
                    <div>
                      <span style={{ color: "#888" }}>Vendedor: </span>
                      {f.vendedor}
                    </div>
                  )}
                  {f.condicaoPagto && (
                    <div>
                      <span style={{ color: "#888" }}>Pagto: </span>
                      {f.condicaoPagto}
                    </div>
                  )}
                  {f.cidade && (
                    <div>
                      <span style={{ color: "#888" }}>Cidade: </span>
                      {f.cidade}
                    </div>
                  )}
                  {f.pedidoMinimo > 0 && (
                    <div>
                      <span style={{ color: "#888" }}>Ped. mín.: </span>
                      <strong>{formatMoney(f.pedidoMinimo)}</strong>
                    </div>
                  )}
                  {f.materiais && (
                    <div style={{ gridColumn: "1/-1", marginTop: "6px" }}>
                      <span style={{ color: "#888" }}>Materiais: </span>
                      {f.materiais}
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
