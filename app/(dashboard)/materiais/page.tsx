"use client";

import { useEffect, useState } from "react";

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

export default function MateriaisPage() {
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [obras, setObras] = useState<Obra[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    obraId: "",
    fornecedorId: "",
    orcado: "",
    utilizado: "",
  });

  async function loadData() {
    const [matRes, obrasRes, fornRes] = await Promise.all([
      fetch("/api/materiais"),
      fetch("/api/obras"),
      fetch("/api/fornecedores"),
    ]);
    setMateriais(await matRes.json());
    setObras(await obrasRes.json());
    setFornecedores(await fornRes.json());
    setLoading(false);
  }

  useEffect(() => {
    async function fetchData() {
      const [matRes, obrasRes, fornRes] = await Promise.all([
        fetch("/api/materiais"),
        fetch("/api/obras"),
        fetch("/api/fornecedores"),
      ]);
      setMateriais(await matRes.json());
      setObras(await obrasRes.json());
      setFornecedores(await fornRes.json());
      setLoading(false);
    }

    fetchData();
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

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

  function statusMat(mat: Material) {
    const saldo = mat.orcado - mat.utilizado;
    if (saldo < 0)
      return { label: "Estourado", bg: "#FCEBEB", color: "#791F1F" };
    if (saldo < mat.orcado * 0.15)
      return { label: "Atenção", bg: "#FAEEDA", color: "#633806" };
    return { label: "Ok", bg: "#EAF3DE", color: "#27500A" };
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
          {materiais.length} material(is) cadastrado(s)
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
          {showForm ? "Cancelar" : "+ Novo Material"}
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
                <label style={lbl}>Nome do material</label>
                <input
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Gesso, Cimento..."
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
                <label style={lbl}>Fornecedor (opcional)</label>
                <select
                  name="fornecedorId"
                  value={form.fornecedorId}
                  onChange={handleChange}
                  style={inp}
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
                <label style={lbl}>Valor orçado (R$)</label>
                <input
                  name="orcado"
                  type="number"
                  value={form.orcado}
                  onChange={handleChange}
                  required
                  placeholder="0,00"
                  style={inp}
                />
              </div>
              <div>
                <label style={lbl}>Valor utilizado (R$)</label>
                <input
                  name="utilizado"
                  type="number"
                  value={form.utilizado}
                  onChange={handleChange}
                  placeholder="0,00"
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
              {saving ? "Salvando..." : "Salvar Material"}
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
          Controle de Materiais
        </h3>
        {materiais.length === 0 ? (
          <p style={{ fontSize: "13px", color: "#aaa" }}>
            Nenhum material cadastrado.
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
                  "Material",
                  "Obra",
                  "Fornecedor",
                  "Orçado",
                  "Utilizado",
                  "Saldo",
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
              {materiais.map((m) => {
                const saldo = m.orcado - m.utilizado;
                const st = statusMat(m);
                return (
                  <tr key={m.id}>
                    <td
                      style={{
                        padding: "10px 0",
                        borderBottom: "1px solid #f0f0f0",
                        fontWeight: 600,
                      }}
                    >
                      {m.nome}
                    </td>
                    <td
                      style={{
                        padding: "10px 0",
                        borderBottom: "1px solid #f0f0f0",
                        color: "#555",
                      }}
                    >
                      {m.obra?.centroCusto}
                    </td>
                    <td
                      style={{
                        padding: "10px 0",
                        borderBottom: "1px solid #f0f0f0",
                        color: "#555",
                      }}
                    >
                      {m.fornecedor?.razaoSocial || "—"}
                    </td>
                    <td
                      style={{
                        padding: "10px 0",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      {formatMoney(m.orcado)}
                    </td>
                    <td
                      style={{
                        padding: "10px 0",
                        borderBottom: "1px solid #f0f0f0",
                        color: "#E24B4A",
                      }}
                    >
                      {formatMoney(m.utilizado)}
                    </td>
                    <td
                      style={{
                        padding: "10px 0",
                        borderBottom: "1px solid #f0f0f0",
                        color: saldo < 0 ? "#E24B4A" : "#1D9E75",
                        fontWeight: 600,
                      }}
                    >
                      {formatMoney(saldo)}
                    </td>
                    <td
                      style={{
                        padding: "10px 0",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
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
