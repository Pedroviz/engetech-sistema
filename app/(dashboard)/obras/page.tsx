"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { gerarRelatorioPDF } from "@/lib/gerarRelatorioPDF";

interface Cliente {
  id: string;
  nome: string;
}
interface Obra {
  id: string;
  centroCusto: string;
  tipo: string;
  status: string;
  contrato: number;
  orcamentoMat: number;
  orcamentoMO: number;
  gastoMat: number;
  gastoMO: number;
  gastoEsporadico: number;
  inicio: string;
  previsaoFim: string;
  cliente: Cliente;
}

const TIPOS = ["residencial", "comercial", "industrial"];
const STATUS = ["andamento", "execucao", "finalizada", "pausada"];

function formatMoney(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function Badge({
  label,
  color,
  bg,
}: {
  label: string;
  color: string;
  bg: string;
}) {
  return (
    <span
      style={{
        background: bg,
        color,
        padding: "2px 9px",
        borderRadius: "10px",
        fontSize: "11px",
        fontWeight: 600,
      }}
    >
      {label}
    </span>
  );
}

function tipoBadge(tipo: string) {
  const map: Record<string, { bg: string; color: string }> = {
    residencial: { bg: "#E6F1FB", color: "#0C447C" },
    comercial: { bg: "#EAF3DE", color: "#27500A" },
    industrial: { bg: "#FAEEDA", color: "#633806" },
  };
  const s = map[tipo] || { bg: "#f0f0f0", color: "#555" };
  return <Badge label={tipo} {...s} />;
}

function statusBadge(status: string) {
  const map: Record<string, { bg: string; color: string }> = {
    andamento: { bg: "#E6F1FB", color: "#0C447C" },
    execucao: { bg: "#FAEEDA", color: "#633806" },
    finalizada: { bg: "#EAF3DE", color: "#27500A" },
    pausada: { bg: "#FCEBEB", color: "#791F1F" },
  };
  const s = map[status] || { bg: "#f0f0f0", color: "#555" };
  return <Badge label={status} {...s} />;
}

const labelStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#666",
  display: "block",
  marginBottom: "5px",
};
const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #e0e0e0",
  borderRadius: "8px",
  padding: "8px 10px",
  fontSize: "13px",
  fontFamily: "inherit",
  background: "#fff",
  color: "#1a1a1a",
  outline: "none",
};
const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "0 8px 10px 0",
  fontSize: "11px",
  fontWeight: 600,
  color: "#888",
  borderBottom: "1px solid #e0e0e0",
};
const tdStyle: React.CSSProperties = {
  padding: "10px 8px 10px 0",
  borderBottom: "1px solid #f0f0f0",
  verticalAlign: "middle",
};

export default function ObrasPage() {
  const router = useRouter();
  const [obras, setObras] = useState<Obra[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [gerandoPDF, setGerandoPDF] = useState<string | null>(null);

  const [form, setForm] = useState({
    centroCusto: "",
    clienteId: "",
    tipo: "residencial",
    status: "andamento",
    inicio: "",
    previsaoFim: "",
    contrato: "",
    orcamentoMat: "",
    orcamentoMO: "",
  });

  async function loadData() {
    const [obrasRes, clientesRes] = await Promise.all([
      fetch("/api/obras"),
      fetch("/api/clientes"),
    ]);
    const oData = await obrasRes.json();
    const cData = await clientesRes.json();
    setObras(Array.isArray(oData) ? oData : []);
    setClientes(Array.isArray(cData) ? cData : []);
    setLoading(false);
  }

  useEffect(() => {
    async function initData() {
      await loadData();
    }

    initData();
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function abrirEdicao(obra: Obra) {
    setEditandoId(obra.id);
    setForm({
      centroCusto: obra.centroCusto,
      clienteId: obra.cliente?.id || "",
      tipo: obra.tipo,
      status: obra.status,
      inicio: obra.inicio?.slice(0, 10) || "",
      previsaoFim: obra.previsaoFim?.slice(0, 10) || "",
      contrato: String(obra.contrato),
      orcamentoMat: String(obra.orcamentoMat),
      orcamentoMO: String(obra.orcamentoMO),
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelarForm() {
    setShowForm(false);
    setEditandoId(null);
    setForm({
      centroCusto: "",
      clienteId: "",
      tipo: "residencial",
      status: "andamento",
      inicio: "",
      previsaoFim: "",
      contrato: "",
      orcamentoMat: "",
      orcamentoMO: "",
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const body = {
      ...form,
      contrato: Number(form.contrato),
      orcamentoMat: Number(form.orcamentoMat),
      orcamentoMO: Number(form.orcamentoMO),
    };

    if (editandoId) {
      await fetch(`/api/obras/${editandoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      await fetch("/api/obras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }

    cancelarForm();
    setSaving(false);
    loadData();
  }

  async function excluirObra(id: string) {
    await fetch(`/api/obras/${id}`, { method: "DELETE" });
    setConfirmDelete(null);
    loadData();
  }

  async function gerarPDF(obra: Obra) {
    setGerandoPDF(obra.id);
    try {
      const [matRes, pagRes, gastosRes, lancRes] = await Promise.all([
        fetch(`/api/materiais?obraId=${obra.id}`),
        fetch(`/api/pagamentos?obraId=${obra.id}`),
        fetch(`/api/gastos?obraId=${obra.id}`),
        fetch(`/api/lancamentos?obraId=${obra.id}`),
      ]);
      const materiais = await matRes.json();
      const pagamentos = await pagRes.json();
      const gastos = await gastosRes.json();
      const lancamentos = await lancRes.json();

      await gerarRelatorioPDF(
        obra,
        Array.isArray(materiais) ? materiais : [],
        Array.isArray(pagamentos) ? pagamentos : [],
        Array.isArray(gastos) ? gastos : [],
        Array.isArray(lancamentos) ? lancamentos : [],
      );
    } finally {
      setGerandoPDF(null);
    }
  }

  function margem(obra: Obra) {
    const gasto = obra.gastoMat + obra.gastoMO + obra.gastoEsporadico;
    return obra.contrato > 0
      ? Number((((obra.contrato - gasto) / obra.contrato) * 100).toFixed(0))
      : 0;
  }

  if (loading) return <div style={{ color: "#888" }}>Carregando...</div>;

  return (
    <div>
      {/* Topo */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <p style={{ fontSize: "13px", color: "#888" }}>
          {obras.length} obra(s) cadastrada(s)
        </p>
        <button
          onClick={() => {
            cancelarForm();
            setShowForm(!showForm);
          }}
          style={{
            background: showForm ? "#888" : "#185FA5",
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
          {showForm ? "Cancelar" : "+ Nova Obra"}
        </button>
      </div>

      {/* Formulário */}
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
            {editandoId ? "✏️ Editar Obra" : "Cadastrar Nova Obra"}
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
                <label style={labelStyle}>Centro de Custo</label>
                <input
                  name="centroCusto"
                  value={form.centroCusto}
                  onChange={handleChange}
                  required
                  placeholder="Ex: CC-002"
                  disabled={!!editandoId}
                  style={{
                    ...inputStyle,
                    background: editandoId ? "#f5f5f3" : "#fff",
                  }}
                />
              </div>

              <div>
                <label style={labelStyle}>Cliente</label>
                <select
                  name="clienteId"
                  value={form.clienteId}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                >
                  <option value="">Selecione...</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Tipo</label>
                <select
                  name="tipo"
                  value={form.tipo}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  {TIPOS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  {STATUS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Data de Início</label>
                <input
                  name="inicio"
                  type="date"
                  value={form.inicio}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Previsão de Entrega</label>
                <input
                  name="previsaoFim"
                  type="date"
                  value={form.previsaoFim}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Valor do Contrato (R$)</label>
                <input
                  name="contrato"
                  type="number"
                  value={form.contrato}
                  onChange={handleChange}
                  required
                  placeholder="0,00"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Orçamento Materiais (R$)</label>
                <input
                  name="orcamentoMat"
                  type="number"
                  value={form.orcamentoMat}
                  onChange={handleChange}
                  required
                  placeholder="0,00"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Orçamento Mão de Obra (R$)</label>
                <input
                  name="orcamentoMO"
                  type="number"
                  value={form.orcamentoMO}
                  onChange={handleChange}
                  required
                  placeholder="0,00"
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  background: saving ? "#93c0e8" : "#185FA5",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 20px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: saving ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                }}
              >
                {saving
                  ? "Salvando..."
                  : editandoId
                    ? "Salvar alterações"
                    : "Salvar Obra"}
              </button>
              <button
                type="button"
                onClick={cancelarForm}
                style={{
                  background: "#f5f5f3",
                  color: "#666",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  padding: "10px 20px",
                  fontSize: "13px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      {confirmDelete && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "28px 32px",
              width: "360px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            }}
          >
            <div style={{ fontSize: "20px", marginBottom: "8px" }}>🗑️</div>
            <h3
              style={{ fontSize: "15px", fontWeight: 600, marginBottom: "8px" }}
            >
              Excluir obra?
            </h3>
            <p
              style={{ fontSize: "13px", color: "#888", marginBottom: "20px" }}
            >
              Esta ação não pode ser desfeita. Todos os dados vinculados à obra
              serão removidos.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => excluirObra(confirmDelete)}
                style={{
                  background: "#E24B4A",
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
                style={{
                  background: "#f5f5f3",
                  color: "#666",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  padding: "9px 20px",
                  fontSize: "13px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabela */}
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
          Todas as Obras
        </h3>
        {obras.length === 0 ? (
          <p style={{ fontSize: "13px", color: "#aaa" }}>
            Nenhuma obra cadastrada.
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
                  "CC",
                  "Cliente",
                  "Tipo",
                  "Contrato",
                  "Gasto",
                  "Margem",
                  "Status",
                  "Entrega",
                  "Ações",
                ].map((h) => (
                  <th key={h} style={thStyle}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {obras.map((obra) => {
                const mg = margem(obra);
                const mgColor =
                  mg >= 35 ? "#1D9E75" : mg >= 20 ? "#BA7517" : "#E24B4A";
                const gasto =
                  obra.gastoMat + obra.gastoMO + obra.gastoEsporadico;
                return (
                  <tr key={obra.id}>
                    <td style={tdStyle}>
                      <strong>{obra.centroCusto}</strong>
                    </td>
                    <td style={tdStyle}>{obra.cliente?.nome}</td>
                    <td style={tdStyle}>{tipoBadge(obra.tipo)}</td>
                    <td style={tdStyle}>{formatMoney(obra.contrato)}</td>
                    <td style={{ ...tdStyle, color: "#E24B4A" }}>
                      {formatMoney(gasto)}
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: mgColor }}>
                      {mg}%
                    </td>
                    <td style={tdStyle}>{statusBadge(obra.status)}</td>
                    <td style={{ ...tdStyle, color: "#888" }}>
                      {new Date(obra.previsaoFim).toLocaleDateString("pt-BR")}
                    </td>
                    <td style={tdStyle}>
                      <div
                        style={{
                          display: "flex",
                          gap: "6px",
                          flexWrap: "wrap",
                        }}
                      >
                        {/* Cronograma */}
                        <button
                          onClick={() =>
                            router.push(`/obras/${obra.id}/cronograma`)
                          }
                          style={{
                            background: "#E6F1FB",
                            color: "#0C447C",
                            border: "none",
                            borderRadius: "6px",
                            padding: "4px 9px",
                            fontSize: "11px",
                            fontWeight: 600,
                            cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          📊 Gantt
                        </button>

                        {/* Editar */}
                        <button
                          onClick={() => abrirEdicao(obra)}
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
                          ✏️ Editar
                        </button>

                        {/* PDF */}
                        <button
                          onClick={() => gerarPDF(obra)}
                          disabled={gerandoPDF === obra.id}
                          style={{
                            background: "#EAF3DE",
                            color: "#27500A",
                            border: "none",
                            borderRadius: "6px",
                            padding: "4px 9px",
                            fontSize: "11px",
                            fontWeight: 600,
                            cursor: "pointer",
                            fontFamily: "inherit",
                            opacity: gerandoPDF === obra.id ? 0.6 : 1,
                          }}
                        >
                          {gerandoPDF === obra.id ? "⏳" : "📄 PDF"}
                        </button>

                        {/* Excluir */}
                        <button
                          onClick={() => setConfirmDelete(obra.id)}
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
