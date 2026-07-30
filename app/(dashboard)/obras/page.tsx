"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { gerarRelatorioPDF } from "@/lib/gerarRelatorioPDF";
import * as S from "@/lib/styles";

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

const TIPO_COLORS: Record<string, { bg: string; color: string }> = {
  residencial: { bg: "#E6F1FB", color: "#0C447C" },
  comercial: { bg: "#EAF3DE", color: "#27500A" },
  industrial: { bg: "#FAEEDA", color: "#633806" },
};
const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  andamento: { bg: "#E6F1FB", color: "#0C447C" },
  execucao: { bg: "#FAEEDA", color: "#633806" },
  finalizada: { bg: "#EAF3DE", color: "#27500A" },
  pausada: { bg: "#FCEBEB", color: "#791F1F" },
};

function formatMoney(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function Badge({
  label,
  bg,
  color,
}: {
  label: string;
  bg: string;
  color: string;
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

  async function fetchObrasEClientes() {
    const [obrasRes, clientesRes] = await Promise.all([
      fetch("/api/obras"),
      fetch("/api/clientes"),
    ]);
    const oData = await obrasRes.json();
    const cData = await clientesRes.json();
    return {
      obras: Array.isArray(oData) ? oData : [],
      clientes: Array.isArray(cData) ? cData : [],
    };
  }

  async function loadData() {
    const { obras: obrasData, clientes: clientesData } =
      await fetchObrasEClientes();
    setObras(obrasData);
    setClientes(clientesData);
    setLoading(false);
  }

  useEffect(() => {
    async function init() {
      const { obras: obrasData, clientes: clientesData } =
        await fetchObrasEClientes();
      setObras(obrasData);
      setClientes(clientesData);
      setLoading(false);
    }
    init();
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
      await gerarRelatorioPDF(
        obra,
        Array.isArray(await matRes.json())
          ? await (await fetch(`/api/materiais?obraId=${obra.id}`)).json()
          : [],
        Array.isArray(await pagRes.json())
          ? await (await fetch(`/api/pagamentos?obraId=${obra.id}`)).json()
          : [],
        Array.isArray(await gastosRes.json())
          ? await (await fetch(`/api/gastos?obraId=${obra.id}`)).json()
          : [],
        Array.isArray(await lancRes.json())
          ? await (await fetch(`/api/lancamentos?obraId=${obra.id}`)).json()
          : [],
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
              Excluir obra?
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
                onClick={() => excluirObra(confirmDelete)}
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

      {/* Topo */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
          {obras.length} obra(s) cadastrada(s)
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
          {showForm ? "Cancelar" : "+ Nova Obra"}
        </button>
      </div>

      {/* Formulário */}
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
                <label style={S.label}>Centro de Custo</label>
                <input
                  name="centroCusto"
                  value={form.centroCusto}
                  onChange={handleChange}
                  required
                  placeholder="Ex: CC-002"
                  disabled={!!editandoId}
                  style={{
                    ...S.input,
                    background: editandoId
                      ? "var(--bg-tertiary)"
                      : "var(--bg-primary)",
                    opacity: editandoId ? 0.7 : 1,
                  }}
                />
              </div>
              <div>
                <label style={S.label}>Cliente</label>
                <select
                  name="clienteId"
                  value={form.clienteId}
                  onChange={handleChange}
                  required
                  style={S.input}
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
                <label style={S.label}>Tipo</label>
                <select
                  name="tipo"
                  value={form.tipo}
                  onChange={handleChange}
                  style={S.input}
                >
                  {TIPOS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={S.label}>Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  style={S.input}
                >
                  {STATUS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={S.label}>Data de Início</label>
                <input
                  name="inicio"
                  type="date"
                  value={form.inicio}
                  onChange={handleChange}
                  required
                  style={S.input}
                />
              </div>
              <div>
                <label style={S.label}>Previsão de Entrega</label>
                <input
                  name="previsaoFim"
                  type="date"
                  value={form.previsaoFim}
                  onChange={handleChange}
                  required
                  style={S.input}
                />
              </div>
              <div>
                <label style={S.label}>Valor do Contrato (R$)</label>
                <input
                  name="contrato"
                  type="number"
                  value={form.contrato}
                  onChange={handleChange}
                  required
                  placeholder="0,00"
                  style={S.input}
                />
              </div>
              <div>
                <label style={S.label}>Orçamento Materiais (R$)</label>
                <input
                  name="orcamentoMat"
                  type="number"
                  value={form.orcamentoMat}
                  onChange={handleChange}
                  required
                  placeholder="0,00"
                  style={S.input}
                />
              </div>
              <div>
                <label style={S.label}>Orçamento Mão de Obra (R$)</label>
                <input
                  name="orcamentoMO"
                  type="number"
                  value={form.orcamentoMO}
                  onChange={handleChange}
                  required
                  placeholder="0,00"
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
                    : "Salvar Obra"}
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

      {/* Tabela */}
      <div style={S.card}>
        <h3 style={S.cardTitle}>Todas as Obras</h3>
        {obras.length === 0 ? (
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Nenhuma obra cadastrada.
          </p>
        ) : (
          <table style={S.table}>
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
                  <th key={h} style={S.th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {obras.map((obra) => {
                const mg = margem(obra);
                const mgColor =
                  mg >= 35
                    ? "var(--green)"
                    : mg >= 20
                      ? "var(--amber)"
                      : "var(--red)";
                const gasto =
                  obra.gastoMat + obra.gastoMO + obra.gastoEsporadico;
                const tipoStyle = TIPO_COLORS[obra.tipo] || {
                  bg: "var(--bg-tertiary)",
                  color: "var(--text-secondary)",
                };
                const statusStyle = STATUS_COLORS[obra.status] || {
                  bg: "var(--bg-tertiary)",
                  color: "var(--text-secondary)",
                };
                return (
                  <tr key={obra.id}>
                    <td style={{ ...S.td, fontWeight: 600 }}>
                      {obra.centroCusto}
                    </td>
                    <td style={S.td}>{obra.cliente?.nome}</td>
                    <td style={S.td}>
                      <Badge label={obra.tipo} {...tipoStyle} />
                    </td>
                    <td style={S.td}>{formatMoney(obra.contrato)}</td>
                    <td style={{ ...S.td, color: "var(--red)" }}>
                      {formatMoney(gasto)}
                    </td>
                    <td style={{ ...S.td, fontWeight: 700, color: mgColor }}>
                      {mg}%
                    </td>
                    <td style={S.td}>
                      <Badge label={obra.status} {...statusStyle} />
                    </td>
                    <td style={{ ...S.td, color: "var(--text-secondary)" }}>
                      {new Date(obra.previsaoFim).toLocaleDateString("pt-BR")}
                    </td>
                    <td style={S.td}>
                      <div
                        style={{
                          display: "flex",
                          gap: "5px",
                          flexWrap: "wrap",
                        }}
                      >
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
