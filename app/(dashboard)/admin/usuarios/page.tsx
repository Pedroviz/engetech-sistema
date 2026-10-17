"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Users,
  Building2,
  Mail,
  Shield,
  ShieldOff,
  Trash2,
  RefreshCw,
  UserCheck,
  ChevronDown,
} from "lucide-react";

interface Usuario {
  id: string;
  name: string;
  email: string;
  empresa: string | null;
  role: string;
  createdAt: string;
  _count: { obras: number };
}

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroRole, setFiltroRole] = useState("todos");
  const [acao, setAcao] = useState<string | null>(null);

  async function recarregar() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/usuarios");
      if (!res.ok) throw new Error();
      setUsuarios(await res.json());
    } catch {
      alert("Acesso negado ou erro ao carregar.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ativo = true;
    async function buscar() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/usuarios");
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (ativo) setUsuarios(data);
      } catch {
        if (ativo) alert("Acesso negado ou erro ao carregar.");
      } finally {
        if (ativo) setLoading(false);
      }
    }
    buscar();
    return () => {
      ativo = false;
    };
  }, []);

  async function alterarRole(id: string, novoRole: string) {
    setAcao(id);
    try {
      await fetch(`/api/admin/usuarios/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: novoRole }),
      });
      await recarregar();
    } finally {
      setAcao(null);
    }
  }

  async function excluir(id: string, nome: string) {
    if (!confirm(`Excluir "${nome}"? Esta ação não pode ser desfeita.`)) return;
    setAcao(id);
    try {
      await fetch(`/api/admin/usuarios/${id}`, { method: "DELETE" });
      await recarregar();
    } finally {
      setAcao(null);
    }
  }

  const filtrados = usuarios.filter((u) => {
    const termo = busca.toLowerCase();
    const bate =
      u.name.toLowerCase().includes(termo) ||
      u.email.toLowerCase().includes(termo) ||
      (u.empresa ?? "").toLowerCase().includes(termo);
    return bate && (filtroRole === "todos" || u.role === filtroRole);
  });

  const totais = {
    total: usuarios.length,
    admins: usuarios.filter((u) => u.role === "admin").length,
    users: usuarios.filter((u) => u.role === "user").length,
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Usuários cadastrados</h1>
          <p style={s.subtitle}>Gerencie acessos e permissões da plataforma</p>
        </div>
        <button onClick={recarregar} style={s.btnRefresh}>
          <RefreshCw size={16} /> Atualizar
        </button>
      </div>

      <div style={s.metrics}>
        <Metric
          icon={<Users size={20} />}
          label="Total"
          value={totais.total}
          color="#1B5FA6"
        />
        <Metric
          icon={<UserCheck size={20} />}
          label="Usuários"
          value={totais.users}
          color="#16a34a"
        />
        <Metric
          icon={<Shield size={20} />}
          label="Admins"
          value={totais.admins}
          color="#9333ea"
        />
      </div>

      <div style={s.filtros}>
        <div style={s.searchWrap}>
          <Search size={15} style={{ color: "#9ca3af", flexShrink: 0 }} />
          <input
            style={s.search}
            placeholder="Buscar por nome, e-mail ou empresa..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div style={s.selectWrap}>
          <select
            style={s.select}
            value={filtroRole}
            onChange={(e) => setFiltroRole(e.target.value)}
          >
            <option value="todos">Todos os perfis</option>
            <option value="user">Usuário</option>
            <option value="admin">Admin</option>
          </select>
          <ChevronDown
            size={14}
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#6b7280",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>

      <div style={s.tableWrap}>
        {loading ? (
          <div style={s.empty}>Carregando...</div>
        ) : filtrados.length === 0 ? (
          <div style={s.empty}>Nenhum usuário encontrado.</div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Usuário</th>
                <th style={s.th}>Empresa</th>
                <th style={s.th}>Obras</th>
                <th style={s.th}>Cadastro</th>
                <th style={s.th}>Perfil</th>
                <th style={{ ...s.th, textAlign: "right" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((u) => (
                <tr key={u.id} style={s.tr}>
                  <td style={s.td}>
                    <div style={s.userCell}>
                      <div style={avatar(u.role)}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={s.userName}>{u.name}</div>
                        <div style={s.userEmail}>
                          <Mail size={11} style={{ marginRight: 3 }} />
                          {u.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={s.td}>
                    <div style={s.empresa}>
                      {u.empresa ? (
                        <>
                          <Building2 size={13} style={{ color: "#9ca3af" }} />
                          {u.empresa}
                        </>
                      ) : (
                        <span style={{ color: "#d1d5db" }}>—</span>
                      )}
                    </div>
                  </td>
                  <td style={s.td}>
                    <span style={s.obras}>{u._count.obras}</span>
                  </td>
                  <td style={s.td}>
                    <span style={s.data}>
                      {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                  </td>
                  <td style={s.td}>
                    <span style={badge(u.role)}>
                      {u.role === "admin" ? "👑 Admin" : "👤 Usuário"}
                    </span>
                  </td>
                  <td style={{ ...s.td, textAlign: "right" }}>
                    <div style={s.acoes}>
                      {u.role !== "admin" ? (
                        <button
                          onClick={() => alterarRole(u.id, "admin")}
                          disabled={acao === u.id}
                          style={{ ...s.btnAcao, color: "#9333ea" }}
                          title="Tornar admin"
                        >
                          <Shield size={14} />
                        </button>
                      ) : (
                        <button
                          onClick={() => alterarRole(u.id, "user")}
                          disabled={acao === u.id}
                          style={{ ...s.btnAcao, color: "#f59e0b" }}
                          title="Remover admin"
                        >
                          <ShieldOff size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => excluir(u.id, u.name)}
                        disabled={acao === u.id}
                        style={{ ...s.btnAcao, color: "#dc2626" }}
                        title="Excluir"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p style={s.footer}>
        Mostrando {filtrados.length} de {totais.total} usuários
      </p>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div style={s.metric}>
      <div style={{ ...s.metricIcon, background: color + "18", color }}>
        {icon}
      </div>
      <div>
        <div style={s.metricValue}>{value}</div>
        <div style={s.metricLabel}>{label}</div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { padding: "24px", maxWidth: 1100, margin: "0 auto" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: "var(--text-primary)",
    marginBottom: 4,
  },
  subtitle: { fontSize: 14, color: "var(--text-secondary)" },
  btnRefresh: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 16px",
    background: "var(--bg-secondary)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    fontSize: 13,
    color: "var(--text-primary)",
    cursor: "pointer",
  },
  metrics: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
    marginBottom: 24,
  },
  metric: {
    background: "var(--card-bg)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: "16px 20px",
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  metricIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 700,
    color: "var(--text-primary)",
    lineHeight: 1,
  },
  metricLabel: { fontSize: 13, color: "var(--text-secondary)", marginTop: 2 },
  filtros: { display: "flex", gap: 12, marginBottom: 16 },
  searchWrap: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "var(--card-bg)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "0 14px",
  },
  search: {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: 14,
    color: "var(--text-primary)",
    padding: "10px 0",
  },
  selectWrap: { position: "relative", display: "flex", alignItems: "center" },
  select: {
    appearance: "none",
    background: "var(--card-bg)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "10px 32px 10px 14px",
    fontSize: 14,
    color: "var(--text-primary)",
    cursor: "pointer",
    outline: "none",
  },
  tableWrap: {
    background: "var(--card-bg)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    overflow: "hidden",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: "12px 16px",
    textAlign: "left",
    fontSize: 12,
    fontWeight: 600,
    color: "var(--text-secondary)",
    background: "var(--bg-secondary)",
    borderBottom: "1px solid var(--border)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  tr: { borderBottom: "1px solid var(--border)" },
  td: {
    padding: "14px 16px",
    fontSize: 14,
    color: "var(--text-primary)",
    verticalAlign: "middle",
  },
  userCell: { display: "flex", alignItems: "center", gap: 12 },
  userName: { fontWeight: 600, fontSize: 14, color: "var(--text-primary)" },
  userEmail: {
    display: "flex",
    alignItems: "center",
    fontSize: 12,
    color: "var(--text-secondary)",
    marginTop: 2,
  },
  empresa: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    fontSize: 13,
    color: "var(--text-secondary)",
  },
  obras: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 28,
    background: "var(--bg-secondary)",
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
  },
  data: { fontSize: 13, color: "var(--text-secondary)" },
  acoes: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
  },
  btnAcao: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 8,
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
  },
  empty: {
    padding: "48px",
    textAlign: "center",
    color: "var(--text-secondary)",
    fontSize: 14,
  },
  footer: {
    marginTop: 12,
    fontSize: 12,
    color: "var(--text-secondary)",
    textAlign: "right",
  },
};

function avatar(role: string): React.CSSProperties {
  return {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: role === "admin" ? "#9333ea22" : "#1B5FA618",
    color: role === "admin" ? "#9333ea" : "#1B5FA6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 15,
    fontWeight: 700,
    flexShrink: 0,
  };
}

function badge(role: string): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    background: role === "admin" ? "#9333ea18" : "#16a34a18",
    color: role === "admin" ? "#9333ea" : "#16a34a",
  };
}
