"use client";

import { useEffect, useState } from "react";

interface Cliente {
  id: string;
  nome: string;
  segmento: string;
  classificacao: string;
  whatsapp: string;
  email: string;
  clienteDesde: string;
  observacoes: string;
  obras: { id: string }[];
}

const SEGMENTOS = ["residencial", "comercial", "industrial"];
const CLASSIFICACOES = ["novo", "recorrente", "fidelizado"];

const classColors: Record<string, { bg: string; color: string }> = {
  fidelizado: { bg: "#EEEDFE", color: "#3C3489" },
  recorrente: { bg: "#E6F1FB", color: "#0C447C" },
  novo: { bg: "#E1F5EE", color: "#085041" },
};

const INITIAL_FORM = {
  nome: "",
  segmento: "residencial",
  classificacao: "novo",
  whatsapp: "",
  email: "",
  clienteDesde: "",
  observacoes: "",
};

function formatarWhatsApp(value: string) {
  if (!value) return "";

  // Remove tudo o que não for número
  const apenasNumeros = value.replace(/\D/g, "");

  // Limita em 11 dígitos (DDD + 9 dígitos)
  const numerosLimitados = apenasNumeros.slice(0, 11);

  // Aplica a formatação por etapas baseado na quantidade de números digitados
  if (numerosLimitados.length <= 2) {
    return `(${numerosLimitados}`;
  }
  if (numerosLimitados.length <= 6) {
    return `(${numerosLimitados.slice(0, 2)}) ${numerosLimitados.slice(2)}`;
  }
  return `(${numerosLimitados.slice(0, 2)}) ${numerosLimitados.slice(2, 7)}-${numerosLimitados.slice(7)}`;
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);

  async function loadData() {
    const res = await fetch("/api/clientes");
    const data = await res.json();
    setClientes(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/clientes");
        if (!mounted) return;
        const data = await res.json();
        setClientes(data);
        setLoading(false);
      } catch {
        if (!mounted) return;
        // keep loading false on error as well
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "whatsapp" ? formatarWhatsApp(value) : value,
    }));
  }

  // Ativa o modo de edição e joga os dados no formulário
  function handleEdit(cliente: Cliente) {
    setEditingId(cliente.id);
    setForm({
      nome: cliente.nome,
      segmento: cliente.segmento,
      classificacao: cliente.classificacao,
      whatsapp: cliente.whatsapp || "",
      email: cliente.email || "",
      clienteDesde: cliente.clienteDesde || "",
      observacoes: cliente.observacoes || "",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Função para deletar cliente com confirmação nativa
  async function handleDelete(id: string, nome: string) {
    if (confirm(`Tem certeza que deseja excluir o cliente ${nome}?`)) {
      await fetch(`/api/clientes?id=${id}`, { method: "DELETE" });
      loadData();
    }
  }

  // Cancela a operação e limpa os estados
  function handleCancel() {
    setForm(INITIAL_FORM);
    setEditingId(null);
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    // Se tiver editingId, faz um PUT, caso contrário faz um POST
    const url = "/api/clientes";
    const method = editingId ? "PUT" : "POST";
    const bodyData = editingId ? { id: editingId, ...form } : form;

    await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyData),
    });

    handleCancel();
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
          {clientes.length} cliente(s) na base
        </p>
        <button
          onClick={() => {
            if (showForm) handleCancel();
            else setShowForm(true);
          }}
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
          {showForm ? "Cancelar" : "+ Novo Cliente"}
        </button>
      </div>

      {/* Formulário (Cadastrar / Editar) */}
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
            {editingId ? "Editar Cliente" : "Cadastrar Cliente"}
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
                <label style={lbl}>Nome / Empresa</label>
                <input
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  required
                  placeholder="Nome completo ou razão social"
                  style={inp}
                />
              </div>
              <div>
                <label style={lbl}>Segmento</label>
                <select
                  name="segmento"
                  value={form.segmento}
                  onChange={handleChange}
                  style={inp}
                >
                  {SEGMENTOS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={lbl}>Classificação</label>
                <select
                  name="classificacao"
                  value={form.classificacao}
                  onChange={handleChange}
                  style={inp}
                >
                  {CLASSIFICACOES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={lbl}>Cliente desde (ano)</label>
                <input
                  name="clienteDesde"
                  value={form.clienteDesde}
                  onChange={handleChange}
                  placeholder="Ex: 2020"
                  style={inp}
                />
              </div>
              <div>
                <label style={lbl}>WhatsApp</label>
                <input
                  name="whatsapp"
                  value={form.whatsapp}
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
                  placeholder="email@exemplo.com"
                  style={inp}
                />
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={lbl}>Observações</label>
                <input
                  name="observacoes"
                  value={form.observacoes}
                  onChange={handleChange}
                  placeholder="Informações relevantes..."
                  style={inp}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
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
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {saving
                  ? "Salvando..."
                  : editingId
                    ? "Atualizar Cliente"
                    : "Salvar Cliente"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  style={{
                    background: "#f5f5f5",
                    color: "#555",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    padding: "10px 20px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Cancelar Edição
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Cards de clientes */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}
      >
        {clientes.map((c) => {
          const cls = classColors[c.classificacao] || {
            bg: "#f0f0f0",
            color: "#555",
          };
          const initials = c.nome
            .split(" ")
            .map((w: string) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
          return (
            <div
              key={c.id}
              style={{
                background: "#fff",
                border: "1px solid #e0e0e0",
                borderRadius: "10px",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
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
                      borderRadius: "50%",
                      background: "#E6F1FB",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "14px",
                      color: "#0C447C",
                      flexShrink: 0,
                    }}
                  >
                    {initials}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "14px" }}>
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
                          background: "#f0f0f0",
                          color: "#555",
                          padding: "2px 8px",
                          borderRadius: "10px",
                          fontSize: "11px",
                          fontWeight: 600,
                        }}
                      >
                        {c.segmento}
                      </span>
                      {c.clienteDesde && (
                        <span style={{ fontSize: "11px", color: "#aaa" }}>
                          desde {c.clienteDesde}
                        </span>
                      )}
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
                  {c.whatsapp && (
                    <div>
                      <span style={{ color: "#888" }}>WhatsApp: </span>
                      {c.whatsapp}
                    </div>
                  )}
                  {c.email && (
                    <div>
                      <span style={{ color: "#888" }}>Email: </span>
                      {c.email}
                    </div>
                  )}
                  {c.observacoes && (
                    <div
                      style={{
                        gridColumn: "1/-1",
                        color: "#888",
                        marginTop: "4px",
                      }}
                    >
                      📝 {c.observacoes}
                    </div>
                  )}
                </div>
              </div>

              {/* Botões de Ação */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  marginTop: "14px",
                  paddingTop: "8px",
                  borderTop: "1px dashed #f0f0f0",
                }}
              >
                <button
                  onClick={() => handleEdit(c)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#185FA5",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: 0,
                    fontFamily: "inherit",
                  }}
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => handleDelete(c.id, c.nome)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#A51818",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: 0,
                    fontFamily: "inherit",
                  }}
                >
                  🗑️ Excluir
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
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
