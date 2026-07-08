"use client";

import { useEffect, useState } from "react";

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

function formatMoney(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const CATEGORIAS = [
  "recebimento",
  "material",
  "mao_obra",
  "esporadico",
  "outro",
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

export default function FinanceiroPage() {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    descricao: "",
    obraId: "",
    tipo: "entrada",
    categoria: "recebimento",
    valor: "",
    data: "",
  });

  async function fetchData() {
    const [lRes, oRes] = await Promise.all([
      fetch("/api/lancamentos"),
      fetch("/api/obras"),
    ]);
    return {
      lancamentos: await lRes.json(),
      obras: await oRes.json(),
    };
  }

  async function loadData() {
    const { lancamentos, obras } = await fetchData();
    setLancamentos(lancamentos);
    setObras(obras);
    setLoading(false);
  }

  useEffect(() => {
    let active = true;

    async function init() {
      const { lancamentos, obras } = await fetchData();
      if (!active) return;
      setLancamentos(lancamentos);
      setObras(obras);
      setLoading(false);
    }

    init();

    return () => {
      active = false;
    };
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

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

  const entradas = lancamentos
    .filter((l) => l.tipo === "entrada")
    .reduce((a, l) => a + l.valor, 0);
  const saidas = lancamentos
    .filter((l) => l.tipo === "saida")
    .reduce((a, l) => a + l.valor, 0);
  const saldo = entradas - saidas;

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
            label: "Total entradas",
            value: formatMoney(entradas),
            color: "#1D9E75",
          },
          {
            label: "Total saídas",
            value: formatMoney(saidas),
            color: "#E24B4A",
          },
          {
            label: "Saldo",
            value: formatMoney(saldo),
            color: saldo >= 0 ? "#185FA5" : "#E24B4A",
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
          {showForm ? "Cancelar" : "+ Novo Lançamento"}
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
                <label style={lbl}>Descrição</label>
                <input
                  name="descricao"
                  value={form.descricao}
                  onChange={handleChange}
                  required
                  placeholder="Descreva o lançamento"
                  style={inp}
                />
              </div>
              <div>
                <label style={lbl}>Obra</label>
                <select
                  name="obraId"
                  value={form.obraId}
                  onChange={handleChange}
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
              <div>
                <label style={lbl}>Tipo</label>
                <select
                  name="tipo"
                  value={form.tipo}
                  onChange={handleChange}
                  style={inp}
                >
                  <option value="entrada">Entrada</option>
                  <option value="saida">Saída</option>
                </select>
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
                      {c.replace("_", " ")}
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
                <label style={lbl}>Data</label>
                <input
                  name="data"
                  type="date"
                  value={form.data}
                  onChange={handleChange}
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
              {saving ? "Salvando..." : "Salvar Lançamento"}
            </button>
          </form>
        </div>
      )}

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
          Lançamentos
        </h3>
        {lancamentos.length === 0 ? (
          <p style={{ fontSize: "13px", color: "#aaa" }}>
            Nenhum lançamento registrado.
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
                  "Data",
                  "Descrição",
                  "Obra",
                  "Categoria",
                  "Tipo",
                  "Valor",
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
              {lancamentos.map((l) => (
                <tr key={l.id}>
                  <td
                    style={{
                      padding: "10px 0",
                      borderBottom: "1px solid #f0f0f0",
                      color: "#888",
                    }}
                  >
                    {new Date(l.data).toLocaleDateString("pt-BR")}
                  </td>
                  <td
                    style={{
                      padding: "10px 0",
                      borderBottom: "1px solid #f0f0f0",
                      fontWeight: 600,
                    }}
                  >
                    {l.descricao}
                  </td>
                  <td
                    style={{
                      padding: "10px 0",
                      borderBottom: "1px solid #f0f0f0",
                      color: "#555",
                    }}
                  >
                    {l.obra?.centroCusto}
                  </td>
                  <td
                    style={{
                      padding: "10px 0",
                      borderBottom: "1px solid #f0f0f0",
                      color: "#555",
                    }}
                  >
                    {l.categoria.replace("_", " ")}
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
                      padding: "10px 0",
                      borderBottom: "1px solid #f0f0f0",
                      fontWeight: 600,
                      color: l.tipo === "entrada" ? "#1D9E75" : "#E24B4A",
                    }}
                  >
                    {l.tipo === "entrada" ? "+" : "-"}
                    {formatMoney(l.valor)}
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
