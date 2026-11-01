"use client";

import { useState, useEffect } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type Campo = "senhaAtual" | "novaSenha" | "confirmar";

export default function PerfilPage() {
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState({
    senhaAtual: "",
    novaSenha: "",
    confirmar: "",
  });
  const [visivel, setVisivel] = useState<Record<Campo, boolean>>({
    senhaAtual: false,
    novaSenha: false,
    confirmar: false,
  });
  const [status, setStatus] = useState<
    { tipo: "sucesso" | "erro"; msg: string } | null
  >(null);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d.user) setUser(d.user); });
  }, []);

  function toggleVisivel(campo: Campo) {
    setVisivel((v) => ({ ...v, [campo]: !v[campo] }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);

    if (form.novaSenha !== form.confirmar) {
      setStatus({ tipo: "erro", msg: "Nova senha e confirmação não coincidem." });
      return;
    }
    if (form.novaSenha.length < 6) {
      setStatus({ tipo: "erro", msg: "Nova senha deve ter ao menos 6 caracteres." });
      return;
    }

    setCarregando(true);
    try {
      const res = await fetch("/api/auth/senha", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senhaAtual: form.senhaAtual,
          novaSenha: form.novaSenha,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ tipo: "erro", msg: data.error ?? "Erro ao alterar senha." });
      } else {
        setStatus({ tipo: "sucesso", msg: "Senha alterada com sucesso!" });
        setForm({ senhaAtual: "", novaSenha: "", confirmar: "" });
      }
    } catch {
      setStatus({ tipo: "erro", msg: "Erro de conexão. Tente novamente." });
    } finally {
      setCarregando(false);
    }
  }

  const forca = (() => {
    const s = form.novaSenha;
    if (!s) return null;
    let pts = 0;
    if (s.length >= 8) pts++;
    if (s.length >= 12) pts++;
    if (/[A-Z]/.test(s)) pts++;
    if (/[0-9]/.test(s)) pts++;
    if (/[^A-Za-z0-9]/.test(s)) pts++;
    if (pts <= 1) return { label: "Fraca", cor: "#ef4444", pct: 25 };
    if (pts <= 2) return { label: "Razoável", cor: "#f97316", pct: 50 };
    if (pts <= 3) return { label: "Boa", cor: "#eab308", pct: 75 };
    return { label: "Forte", cor: "#17b26a", pct: 100 };
  })();

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "24px 16px" }}>

      {/* ── Cabeçalho ── */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--fg-1)", marginBottom: 4 }}>
          Meu Perfil
        </h1>
        <p style={{ fontSize: 13, color: "var(--fg-3)" }}>
          Gerencie suas informações e segurança da conta
        </p>
      </div>

      {/* ── Card de dados ── */}
      <div style={{
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        borderRadius: 16,
        padding: "20px",
        marginBottom: 16,
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: "50%",
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, fontWeight: 800, color: "#fff",
          flexShrink: 0,
        }}>
          {user?.name?.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase() ?? "?"}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--fg-1)", marginBottom: 2 }}>
            {user?.name ?? "—"}
          </div>
          <div style={{ fontSize: 12, color: "var(--fg-3)", marginBottom: 6 }}>
            {user?.email ?? "—"}
          </div>
          <span style={{
            fontSize: 10, fontWeight: 700,
            color: "#6366f1",
            background: "rgba(99,102,241,0.12)",
            padding: "2px 10px", borderRadius: 20,
          }}>
            {user?.role === "admin" ? "Administrador" : "Usuário"}
          </span>
        </div>
      </div>

      {/* ── Card alterar senha ── */}
      <div style={{
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        borderRadius: 16,
        padding: "20px",
      }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--fg-1)", marginBottom: 4 }}>
          Alterar senha
        </h2>
        <p style={{ fontSize: 12, color: "var(--fg-3)", marginBottom: 20 }}>
          Use uma senha forte com letras, números e símbolos.
        </p>

        {/* Feedback */}
        {status && (
          <div style={{
            padding: "10px 14px",
            borderRadius: 10,
            marginBottom: 16,
            fontSize: 13,
            fontWeight: 500,
            background: status.tipo === "sucesso"
              ? "rgba(23,178,106,0.12)"
              : "rgba(239,68,68,0.10)",
            color: status.tipo === "sucesso" ? "#17b26a" : "#ef4444",
            border: `1px solid ${status.tipo === "sucesso" ? "rgba(23,178,106,0.25)" : "rgba(239,68,68,0.2)"}`,
          }}>
            {status.tipo === "sucesso" ? "✓ " : "✕ "}{status.msg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Senha atual */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--fg-2)", display: "block", marginBottom: 6 }}>
              Senha atual
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={visivel.senhaAtual ? "text" : "password"}
                value={form.senhaAtual}
                onChange={(e) => setForm((f) => ({ ...f, senhaAtual: e.target.value }))}
                placeholder="••••••••"
                required
                style={{
                  width: "100%", height: 40,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--card-border)",
                  borderRadius: 10,
                  padding: "0 40px 0 12px",
                  fontSize: 14, color: "var(--fg-1)",
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />
              <button
                type="button"
                onClick={() => toggleVisivel("senhaAtual")}
                style={{
                  position: "absolute", right: 10, top: "50%",
                  transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--fg-3)", fontSize: 16, padding: 4,
                }}
              >
                {visivel.senhaAtual ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Nova senha */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--fg-2)", display: "block", marginBottom: 6 }}>
              Nova senha
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={visivel.novaSenha ? "text" : "password"}
                value={form.novaSenha}
                onChange={(e) => setForm((f) => ({ ...f, novaSenha: e.target.value }))}
                placeholder="Mínimo 6 caracteres"
                required
                style={{
                  width: "100%", height: 40,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--card-border)",
                  borderRadius: 10,
                  padding: "0 40px 0 12px",
                  fontSize: 14, color: "var(--fg-1)",
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />
              <button
                type="button"
                onClick={() => toggleVisivel("novaSenha")}
                style={{
                  position: "absolute", right: 10, top: "50%",
                  transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--fg-3)", fontSize: 16, padding: 4,
                }}
              >
                {visivel.novaSenha ? "🙈" : "👁️"}
              </button>
            </div>
            {/* Barra de força */}
            {forca && (
              <div style={{ marginTop: 8 }}>
                <div style={{
                  height: 4, borderRadius: 2,
                  background: "var(--card-border)",
                  overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%",
                    width: `${forca.pct}%`,
                    background: forca.cor,
                    borderRadius: 2,
                    transition: "width 0.3s, background 0.3s",
                  }} />
                </div>
                <div style={{ fontSize: 11, color: forca.cor, marginTop: 4, fontWeight: 600 }}>
                  {forca.label}
                </div>
              </div>
            )}
          </div>

          {/* Confirmar nova senha */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--fg-2)", display: "block", marginBottom: 6 }}>
              Confirmar nova senha
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={visivel.confirmar ? "text" : "password"}
                value={form.confirmar}
                onChange={(e) => setForm((f) => ({ ...f, confirmar: e.target.value }))}
                placeholder="Repita a nova senha"
                required
                style={{
                  width: "100%", height: 40,
                  background: "rgba(255,255,255,0.05)",
                  border: `1px solid ${
                    form.confirmar && form.confirmar !== form.novaSenha
                      ? "#ef4444"
                      : form.confirmar && form.confirmar === form.novaSenha
                      ? "#17b26a"
                      : "var(--card-border)"
                  }`,
                  borderRadius: 10,
                  padding: "0 40px 0 12px",
                  fontSize: 14, color: "var(--fg-1)",
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />
              <button
                type="button"
                onClick={() => toggleVisivel("confirmar")}
                style={{
                  position: "absolute", right: 10, top: "50%",
                  transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--fg-3)", fontSize: 16, padding: 4,
                }}
              >
                {visivel.confirmar ? "🙈" : "👁️"}
              </button>
            </div>
            {form.confirmar && form.confirmar !== form.novaSenha && (
              <div style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>
                As senhas não coincidem
              </div>
            )}
          </div>

          {/* Botão */}
          <button
            type="submit"
            disabled={carregando || !form.senhaAtual || !form.novaSenha || !form.confirmar}
            style={{
              height: 44, borderRadius: 12,
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              color: "#fff", border: "none",
              fontSize: 14, fontWeight: 700,
              cursor: carregando ? "not-allowed" : "pointer",
              opacity: (!form.senhaAtual || !form.novaSenha || !form.confirmar) ? 0.5 : 1,
              transition: "opacity 0.15s",
              fontFamily: "inherit",
              marginTop: 4,
            }}
          >
            {carregando ? "Salvando…" : "Salvar nova senha"}
          </button>
        </form>
      </div>
    </div>
  );
}
