"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@engetech.com.br");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const saved = localStorage.getItem("engetech-theme");
    return saved ? saved === "dark" : mq.matches;
  });

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      isDark ? "dark" : "light",
    );
  }, [isDark]);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("engetech-theme", next ? "dark" : "light");
    document.documentElement.setAttribute(
      "data-theme",
      next ? "dark" : "light",
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao fazer login");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Erro de conexão com o servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-secondary)",
        transition: "background 0.2s",
      }}
    >
      {/* Botão de tema */}
      <button
        onClick={toggleTheme}
        style={{
          position: "fixed",
          top: "16px",
          right: "16px",
          background: "var(--bg-primary)",
          border: "1px solid var(--border)",
          borderRadius: "20px",
          padding: "6px 12px",
          cursor: "pointer",
          fontSize: "14px",
          color: "var(--text-secondary)",
          transition: "all 0.2s",
        }}
      >
        {isDark ? "☀️" : "🌙"}
      </button>

      <div
        style={{
          background: "var(--bg-primary)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          padding: "36px",
          width: "340px",
          boxShadow: "var(--shadow)",
          transition: "background 0.2s, border-color 0.2s",
        }}
      >
        <div style={{ marginBottom: "6px" }}>
          <span
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            <span style={{ color: "var(--blue)" }}>Engetech</span> Soluções
          </span>
        </div>
        <p
          style={{
            fontSize: "13px",
            color: "var(--text-muted)",
            marginBottom: "28px",
          }}
        >
          Sistema de gestão de obras — desde 2017
        </p>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: "14px" }}>
            <label
              style={{
                fontSize: "12px",
                color: "var(--text-secondary)",
                display: "block",
                marginBottom: "5px",
              }}
            >
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "9px 12px",
                fontSize: "13px",
                outline: "none",
                fontFamily: "inherit",
                background: "var(--bg-primary)",
                color: "var(--text-primary)",
                transition: "border-color 0.2s, background 0.2s",
              }}
            />
          </div>

          {/* Senha com olho */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                fontSize: "12px",
                color: "var(--text-secondary)",
                display: "block",
                marginBottom: "5px",
              }}
            >
              Senha
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: "100%",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  padding: "9px 40px 9px 12px",
                  fontSize: "13px",
                  outline: "none",
                  fontFamily: "inherit",
                  background: "var(--bg-primary)",
                  color: "var(--text-primary)",
                  transition: "border-color 0.2s, background 0.2s",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "2px",
                  color: "var(--text-muted)",
                  fontSize: "16px",
                  lineHeight: 1,
                  display: "flex",
                  alignItems: "center",
                }}
                title={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? (
                  // Olho fechado
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  // Olho aberto
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div
              style={{
                background: "#FCEBEB",
                border: "1px solid #f5c6c6",
                borderRadius: "8px",
                padding: "9px 12px",
                fontSize: "12px",
                color: "#791F1F",
                marginBottom: "14px",
              }}
            >
              ⚠ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background: loading ? "#93c0e8" : "var(--blue)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "11px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              transition: "background 0.2s",
            }}
          >
            {loading ? "Entrando..." : "Entrar no sistema"}
          </button>
        </form>

        <p
          style={{
            fontSize: "11px",
            color: "var(--text-muted)",
            textAlign: "center",
            marginTop: "16px",
          }}
        >
          Acesso restrito — Engetech Soluções LTDA
        </p>
      </div>
    </div>
  );
}
