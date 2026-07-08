"use client";

import { useEffect, useState } from "react";

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

export default function GastosPage() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    descricao: "",
    justificativa: "",
    obraId: "",
    valor: "",
    data: "",
  });

  async function loadData() {
    const [gRes, oRes] = await Promise.all([
      fetch("/api/gastos"),
      fetch("/api/obras"),
    ]);
    setGastos(await gRes.json());
    setObras(await oRes.json());
    setLoading(false);
  }

  useEffect(() => {
    async function initialize() {
      await loadData();
    }

    initialize();
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

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

  const total = gastos.reduce((a, g) => a + g.valor, 0);

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
        <div
          style={{
            background: "#FAEEDA",
            border: "1px solid #FAC775",
            borderRadius: "8px",
            padding: "10px 14px",
            fontSize: "13px",
            color: "#633806",
            display: "flex",
            gap: "8px",
            alignItems: "center",
          }}
        >
          ⚠ {gastos.length} gasto(s) esporádico(s) — total fora do orçamento:{" "}
          <strong>{formatMoney(total)}</strong>
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
          {showForm ? "Cancelar" : "+ Registrar Gasto"}
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
                <label style={lbl}>Descrição</label>
                <input
                  name="descricao"
                  value={form.descricao}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Gesso extra, locação andaime..."
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
              <div style={{ gridColumn: "1/-1" }}>
                <label style={lbl}>Justificativa (obrigatório)</label>
                <input
                  name="justificativa"
                  value={form.justificativa}
                  onChange={handleChange}
                  required
                  placeholder="Por que esse gasto não estava previsto?"
                  style={inp}
                />
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
              {saving ? "Salvando..." : "Salvar Gasto"}
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
          Gastos Registrados
        </h3>
        {gastos.length === 0 ? (
          <p style={{ fontSize: "13px", color: "#aaa" }}>
            Nenhum gasto esporádico registrado.
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
                {["Data", "Descrição", "Justificativa", "Obra", "Valor"].map(
                  (h) => (
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
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {gastos.map((g) => (
                <tr key={g.id}>
                  <td
                    style={{
                      padding: "10px 0",
                      borderBottom: "1px solid #f0f0f0",
                      color: "#888",
                    }}
                  >
                    {new Date(g.data).toLocaleDateString("pt-BR")}
                  </td>
                  <td
                    style={{
                      padding: "10px 0",
                      borderBottom: "1px solid #f0f0f0",
                      fontWeight: 600,
                    }}
                  >
                    {g.descricao}
                  </td>
                  <td
                    style={{
                      padding: "10px 0",
                      borderBottom: "1px solid #f0f0f0",
                      color: "#555",
                      fontSize: "12px",
                    }}
                  >
                    {g.justificativa}
                  </td>
                  <td
                    style={{
                      padding: "10px 0",
                      borderBottom: "1px solid #f0f0f0",
                      color: "#555",
                    }}
                  >
                    {g.obra?.centroCusto}
                  </td>
                  <td
                    style={{
                      padding: "10px 0",
                      borderBottom: "1px solid #f0f0f0",
                      color: "#E24B4A",
                      fontWeight: 600,
                    }}
                  >
                    {formatMoney(g.valor)}
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
