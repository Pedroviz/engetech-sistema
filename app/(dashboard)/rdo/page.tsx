"use client";

import { useEffect, useState } from "react";
import * as S from "@/lib/styles";

interface Obra {
  id: string;
  centroCusto: string;
  cliente: { nome: string };
}

interface MembroEquipe {
  nome: string;
  funcao: string;
  presente: boolean;
  horas: number;
}
interface Atividade {
  descricao: string;
  etapa: string;
  percentual: number;
  status: string;
}
interface RDOFoto {
  id: string;
  url: string;
  descricao?: string;
  etapa?: string;
}
interface RDO {
  id: string;
  data: string;
  clima: string;
  tempMax?: number;
  tempMin?: number;
  anotacoes?: string;
  ocorrencias?: string;
  obra: Obra;
  equipe: MembroEquipe[];
  atividades: Atividade[];
  fotos: RDOFoto[];
}

const CLIMAS = [
  { value: "ensolarado", label: "☀️ Ensolarado" },
  { value: "parcialmente_nublado", label: "⛅ Parcialmente nublado" },
  { value: "nublado", label: "☁️ Nublado" },
  { value: "chuvoso", label: "🌧️ Chuvoso" },
  { value: "tempestade", label: "⛈️ Tempestade" },
];

const FUNCOES = [
  "Pedreiro",
  "Pintor",
  "Eletricista",
  "Encanador",
  "Servente",
  "Gesseiro",
  "Azulejista",
  "Mestre de obras",
  "Engenheiro",
  "Outro",
];
const STATUS_ATIV = ["executado", "em_andamento", "pendente", "impedido"];
const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  executado: { bg: "#EAF3DE", color: "#27500A" },
  em_andamento: { bg: "#E6F1FB", color: "#0C447C" },
  pendente: { bg: "#FAEEDA", color: "#633806" },
  impedido: { bg: "#FCEBEB", color: "#791F1F" },
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function RDOPage() {
  const [rdos, setRdos] = useState<RDO[]>([]);
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rdoAberto, setRdoAberto] = useState<string | null>(null);
  const [filtroObra, setFiltroObra] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    obraId: "",
    data: new Date().toISOString().slice(0, 10),
    clima: "ensolarado",
    tempMax: "",
    tempMin: "",
    anotacoes: "",
    ocorrencias: "",
  });
  const [equipe, setEquipe] = useState<MembroEquipe[]>([
    { nome: "", funcao: "Pedreiro", presente: true, horas: 8 },
  ]);
  const [atividades, setAtividades] = useState<Atividade[]>([
    { descricao: "", etapa: "", percentual: 0, status: "executado" },
  ]);

  async function loadData() {
    const [rRes, oRes] = await Promise.all([
      fetch("/api/rdo").then((r) => r.json()),
      fetch("/api/obras").then((r) => r.json()),
    ]);
    setRdos(Array.isArray(rRes) ? rRes : []);
    setObras(Array.isArray(oRes) ? oRes : []);
    setLoading(false);
  }

  useEffect(() => {
    async function init() {
      await loadData();
    }
    init();
  }, []);

  function addMembro() {
    setEquipe((p) => [
      ...p,
      { nome: "", funcao: "Pedreiro", presente: true, horas: 8 },
    ]);
  }
  function removeMembro(i: number) {
    setEquipe((p) => p.filter((_, idx) => idx !== i));
  }
  function updateMembro(
    i: number,
    field: string,
    value: string | number | boolean,
  ) {
    setEquipe((p) =>
      p.map((m, idx) => (idx === i ? { ...m, [field]: value } : m)),
    );
  }

  function addAtividade() {
    setAtividades((p) => [
      ...p,
      { descricao: "", etapa: "", percentual: 0, status: "executado" },
    ]);
  }
  function removeAtividade(i: number) {
    setAtividades((p) => p.filter((_, idx) => idx !== i));
  }
  function updateAtividade(
    i: number,
    field: string,
    value: string | number | boolean,
  ) {
    setAtividades((p) =>
      p.map((a, idx) => (idx === i ? { ...a, [field]: value } : a)),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/rdo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tempMax: form.tempMax ? Number(form.tempMax) : null,
          tempMin: form.tempMin ? Number(form.tempMin) : null,
          equipe: equipe.filter((m) => m.nome.trim()),
          atividades: atividades.filter((a) => a.descricao.trim()),
        }),
      });
      setForm({
        obraId: "",
        data: new Date().toISOString().slice(0, 10),
        clima: "ensolarado",
        tempMax: "",
        tempMin: "",
        anotacoes: "",
        ocorrencias: "",
      });
      setEquipe([{ nome: "", funcao: "Pedreiro", presente: true, horas: 8 }]);
      setAtividades([
        { descricao: "", etapa: "", percentual: 0, status: "executado" },
      ]);
      setShowForm(false);
      loadData();
    } finally {
      setSaving(false);
    }
  }

  async function excluir(id: string) {
    await fetch(`/api/rdo/${id}`, { method: "DELETE" });
    setConfirmDelete(null);
    loadData();
  }

  const rdosFiltrados = filtroObra
    ? rdos.filter((r) => r.obra?.id === filtroObra)
    : rdos;

  if (loading)
    return <div style={{ color: "var(--text-muted)" }}>Carregando...</div>;

  return (
    <div>
      {/* Modal excluir */}
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
              🗑️ Excluir RDO?
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

      {/* Topo */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            {rdos.length} registro(s)
          </p>
          <select
            value={filtroObra}
            onChange={(e) => setFiltroObra(e.target.value)}
            style={{
              ...S.input,
              width: "auto",
              padding: "6px 10px",
              fontSize: "12px",
            }}
          >
            <option value="">Todas as obras</option>
            {obras.map((o) => (
              <option key={o.id} value={o.id}>
                {o.centroCusto} — {o.cliente?.nome}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            ...S.btnPrimary,
            background: showForm ? "var(--text-muted)" : "var(--blue)",
          }}
        >
          {showForm ? "Cancelar" : "📝 Novo RDO"}
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div style={{ ...S.card, marginBottom: "16px" }}>
          <h3
            style={{
              fontSize: "15px",
              fontWeight: 600,
              marginBottom: "20px",
              color: "var(--text-primary)",
            }}
          >
            📋 Registro Diário de Obra
          </h3>
          <form onSubmit={handleSubmit}>
            {/* Dados gerais */}
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "12px",
                }}
              >
                Dados gerais
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
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
                    <option value="">Selecione a obra...</option>
                    {obras.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.centroCusto} — {o.cliente?.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={S.label}>Data</label>
                  <input
                    type="date"
                    value={form.data}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, data: e.target.value }))
                    }
                    required
                    style={S.input}
                  />
                </div>
                <div>
                  <label style={S.label}>Clima</label>
                  <select
                    value={form.clima}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, clima: e.target.value }))
                    }
                    style={S.input}
                  >
                    {CLIMAS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px",
                  }}
                >
                  <div>
                    <label style={S.label}>Temp. máx (°C)</label>
                    <input
                      type="number"
                      value={form.tempMax}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, tempMax: e.target.value }))
                      }
                      placeholder="Ex: 34"
                      style={S.input}
                    />
                  </div>
                  <div>
                    <label style={S.label}>Temp. mín (°C)</label>
                    <input
                      type="number"
                      value={form.tempMin}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, tempMin: e.target.value }))
                      }
                      placeholder="Ex: 24"
                      style={S.input}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Equipe */}
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  👷 Equipe no canteiro
                </div>
                <button
                  type="button"
                  onClick={addMembro}
                  style={{
                    ...S.btnSecondary,
                    fontSize: "12px",
                    padding: "4px 10px",
                  }}
                >
                  + Adicionar
                </button>
              </div>
              {equipe.map((m, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 80px 80px 36px",
                    gap: "8px",
                    marginBottom: "8px",
                    alignItems: "center",
                  }}
                >
                  <input
                    value={m.nome}
                    onChange={(e) => updateMembro(i, "nome", e.target.value)}
                    placeholder="Nome do trabalhador"
                    style={{ ...S.input, margin: 0 }}
                  />
                  <select
                    value={m.funcao}
                    onChange={(e) => updateMembro(i, "funcao", e.target.value)}
                    style={{ ...S.input, margin: 0 }}
                  >
                    {FUNCOES.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={m.horas}
                    onChange={(e) =>
                      updateMembro(i, "horas", Number(e.target.value))
                    }
                    min="0"
                    max="24"
                    style={{ ...S.input, margin: 0 }}
                    title="Horas trabalhadas"
                  />
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "12px",
                      color: "var(--text-secondary)",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={m.presente}
                      onChange={(e) =>
                        updateMembro(i, "presente", e.target.checked)
                      }
                    />
                    Pres.
                  </label>
                  <button
                    type="button"
                    onClick={() => removeMembro(i)}
                    style={{
                      background: "#FCEBEB",
                      color: "#791F1F",
                      border: "none",
                      borderRadius: "6px",
                      width: "32px",
                      height: "32px",
                      cursor: "pointer",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Atividades */}
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  🔨 Atividades executadas
                </div>
                <button
                  type="button"
                  onClick={addAtividade}
                  style={{
                    ...S.btnSecondary,
                    fontSize: "12px",
                    padding: "4px 10px",
                  }}
                >
                  + Adicionar
                </button>
              </div>
              {atividades.map((a, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 80px 1fr 36px",
                    gap: "8px",
                    marginBottom: "8px",
                    alignItems: "center",
                  }}
                >
                  <input
                    value={a.descricao}
                    onChange={(e) =>
                      updateAtividade(i, "descricao", e.target.value)
                    }
                    placeholder="Descrição da atividade"
                    style={{ ...S.input, margin: 0 }}
                  />
                  <input
                    value={a.etapa}
                    onChange={(e) =>
                      updateAtividade(i, "etapa", e.target.value)
                    }
                    placeholder="Etapa"
                    style={{ ...S.input, margin: 0 }}
                  />
                  <input
                    type="number"
                    value={a.percentual}
                    onChange={(e) =>
                      updateAtividade(i, "percentual", Number(e.target.value))
                    }
                    min="0"
                    max="100"
                    style={{ ...S.input, margin: 0 }}
                    placeholder="%"
                    title="% concluído"
                  />
                  <select
                    value={a.status}
                    onChange={(e) =>
                      updateAtividade(i, "status", e.target.value)
                    }
                    style={{ ...S.input, margin: 0 }}
                  >
                    {STATUS_ATIV.map((s) => (
                      <option key={s} value={s}>
                        {s.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeAtividade(i)}
                    style={{
                      background: "#FCEBEB",
                      color: "#791F1F",
                      border: "none",
                      borderRadius: "6px",
                      width: "32px",
                      height: "32px",
                      cursor: "pointer",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Anotações e ocorrências */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              <div>
                <label style={S.label}>📝 Anotações gerais</label>
                <textarea
                  value={form.anotacoes}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, anotacoes: e.target.value }))
                  }
                  placeholder="Observações sobre o andamento da obra, decisões tomadas, materiais recebidos..."
                  rows={4}
                  style={{ ...S.input, resize: "vertical", lineHeight: "1.5" }}
                />
              </div>
              <div>
                <label style={S.label}>⚠️ Ocorrências / Imprevistos</label>
                <textarea
                  value={form.ocorrencias}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, ocorrencias: e.target.value }))
                  }
                  placeholder="Acidentes, paralisações, falta de material, problemas com equipe..."
                  rows={4}
                  style={{
                    ...S.input,
                    resize: "vertical",
                    lineHeight: "1.5",
                    borderColor: form.ocorrencias
                      ? "var(--amber)"
                      : "var(--border)",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="submit"
                disabled={saving}
                style={{ ...S.btnPrimary, opacity: saving ? 0.6 : 1 }}
              >
                {saving ? "Salvando..." : "✅ Salvar RDO"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={S.btnSecondary}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de RDOs */}
      {rdosFiltrados.length === 0 ? (
        <div
          style={{
            ...S.card,
            textAlign: "center",
            padding: "40px",
            color: "var(--text-muted)",
          }}
        >
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>📋</div>
          <div style={{ fontSize: "14px", fontWeight: 500 }}>
            Nenhum RDO registrado
          </div>
          <div style={{ fontSize: "13px", marginTop: "6px" }}>
            Clique em &quot;Novo RDO&quot; para registrar o primeiro diário de
            obra
          </div>
        </div>
      ) : (
        rdosFiltrados.map((rdo) => {
          const aberto = rdoAberto === rdo.id;
          const climaLabel =
            CLIMAS.find((c) => c.value === rdo.clima)?.label || rdo.clima;
          const presentes = rdo.equipe.filter((m) => m.presente).length;
          const totalHH = rdo.equipe
            .filter((m) => m.presente)
            .reduce((a, m) => a + m.horas, 0);
          const temOcorrencia =
            rdo.ocorrencias && rdo.ocorrencias.trim().length > 0;

          return (
            <div key={rdo.id} style={{ ...S.card, marginBottom: "10px" }}>
              {/* Header do RDO */}
              <div
                onClick={() => setRdoAberto(aberto ? null : rdo.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexWrap: "wrap",
                      marginBottom: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: "14px",
                        color: "var(--text-primary)",
                      }}
                    >
                      {formatDate(rdo.data)}
                    </span>
                    {temOcorrencia && (
                      <span
                        style={{
                          background: "#FAEEDA",
                          color: "#633806",
                          padding: "2px 7px",
                          borderRadius: "10px",
                          fontSize: "10px",
                          fontWeight: 600,
                        }}
                      >
                        ⚠️ Ocorrência
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      fontSize: "12px",
                      color: "var(--text-secondary)",
                      flexWrap: "wrap",
                    }}
                  >
                    <span>
                      {rdo.obra?.centroCusto} — {rdo.obra?.cliente?.nome}
                    </span>
                    <span>{climaLabel}</span>
                    {(rdo.tempMax || rdo.tempMin) && (
                      <span>
                        🌡️ {rdo.tempMin}°C / {rdo.tempMax}°C
                      </span>
                    )}
                    <span>
                      👷 {presentes} trabalhador(es) — {totalHH}h
                    </span>
                    <span>🔨 {rdo.atividades.length} atividade(s)</span>
                  </div>
                </div>
                <div
                  style={{ display: "flex", gap: "6px", alignItems: "center" }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDelete(rdo.id);
                    }}
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
                  <span
                    style={{ fontSize: "12px", color: "var(--text-muted)" }}
                  >
                    {aberto ? "▲" : "▼"}
                  </span>
                </div>
              </div>

              {/* Detalhe expandido */}
              {aberto && (
                <div
                  style={{
                    marginTop: "16px",
                    borderTop: "1px solid var(--border)",
                    paddingTop: "16px",
                  }}
                >
                  {/* Equipe */}
                  {rdo.equipe.length > 0 && (
                    <div style={{ marginBottom: "16px" }}>
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "var(--text-secondary)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          marginBottom: "10px",
                        }}
                      >
                        👷 Equipe
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fill, minmax(200px, 1fr))",
                          gap: "8px",
                        }}
                      >
                        {rdo.equipe.map((m, i) => (
                          <div
                            key={i}
                            style={{
                              background: m.presente
                                ? "var(--bg-secondary)"
                                : "var(--bg-tertiary)",
                              border: "1px solid var(--border)",
                              borderRadius: "8px",
                              padding: "8px 12px",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              opacity: m.presente ? 1 : 0.5,
                            }}
                          >
                            <span style={{ fontSize: "16px" }}>
                              {m.presente ? "✅" : "❌"}
                            </span>
                            <div>
                              <div
                                style={{
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  color: "var(--text-primary)",
                                }}
                              >
                                {m.nome}
                              </div>
                              <div
                                style={{
                                  fontSize: "11px",
                                  color: "var(--text-secondary)",
                                }}
                              >
                                {m.funcao} · {m.horas}h
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Atividades */}
                  {rdo.atividades.length > 0 && (
                    <div style={{ marginBottom: "16px" }}>
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "var(--text-secondary)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          marginBottom: "10px",
                        }}
                      >
                        🔨 Atividades
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                        }}
                      >
                        {rdo.atividades.map((a, i) => {
                          const st =
                            STATUS_STYLE[a.status] || STATUS_STYLE.executado;
                          return (
                            <div
                              key={i}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                background: "var(--bg-secondary)",
                                borderRadius: "8px",
                                padding: "8px 12px",
                              }}
                            >
                              <div
                                style={{
                                  flex: 1,
                                  fontSize: "13px",
                                  color: "var(--text-primary)",
                                }}
                              >
                                {a.descricao}
                              </div>
                              {a.etapa && (
                                <span
                                  style={{
                                    fontSize: "11px",
                                    color: "var(--text-secondary)",
                                  }}
                                >
                                  {a.etapa}
                                </span>
                              )}
                              <div
                                style={{
                                  width: "80px",
                                  background: "var(--border)",
                                  borderRadius: "4px",
                                  height: "6px",
                                  overflow: "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    width: `${a.percentual}%`,
                                    height: "100%",
                                    background: "var(--blue)",
                                    borderRadius: "4px",
                                  }}
                                />
                              </div>
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  color: "var(--blue)",
                                  width: "32px",
                                  textAlign: "right",
                                }}
                              >
                                {a.percentual}%
                              </span>
                              <span
                                style={{
                                  ...st,
                                  padding: "2px 7px",
                                  borderRadius: "10px",
                                  fontSize: "10px",
                                  fontWeight: 600,
                                }}
                              >
                                {a.status.replace("_", " ")}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Anotações e ocorrências */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                    }}
                  >
                    {rdo.anotacoes && (
                      <div>
                        <div
                          style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            color: "var(--text-secondary)",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            marginBottom: "6px",
                          }}
                        >
                          📝 Anotações
                        </div>
                        <div
                          style={{
                            fontSize: "13px",
                            color: "var(--text-primary)",
                            lineHeight: "1.6",
                            background: "var(--bg-secondary)",
                            borderRadius: "8px",
                            padding: "10px 12px",
                          }}
                        >
                          {rdo.anotacoes}
                        </div>
                      </div>
                    )}
                    {rdo.ocorrencias && (
                      <div>
                        <div
                          style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            color: "var(--amber)",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            marginBottom: "6px",
                          }}
                        >
                          ⚠️ Ocorrências
                        </div>
                        <div
                          style={{
                            fontSize: "13px",
                            color: "var(--text-primary)",
                            lineHeight: "1.6",
                            background: "#FFF8ED",
                            border: "1px solid var(--amber)",
                            borderRadius: "8px",
                            padding: "10px 12px",
                          }}
                        >
                          {rdo.ocorrencias}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
