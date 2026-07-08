"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@engetech.com.br");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    } catch (err) {
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
        background: "#f5f5f3",
      }}
    >
      <div
        style={{
          background: "#fff",
          border: "1px solid #e0e0e0",
          borderRadius: "12px",
          padding: "36px",
          width: "340px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ marginBottom: "6px" }}>
          <span style={{ fontSize: "22px", fontWeight: 700 }}>
            <span style={{ color: "#185FA5" }}>Engetech</span> Soluções
          </span>
        </div>
        <p style={{ fontSize: "13px", color: "#888", marginBottom: "28px" }}>
          Sistema de gestão de obras — desde 2017
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "14px" }}>
            <label
              style={{
                fontSize: "12px",
                color: "#666",
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
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                padding: "9px 12px",
                fontSize: "13px",
                outline: "none",
                fontFamily: "inherit",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                fontSize: "12px",
                color: "#666",
                display: "block",
                marginBottom: "5px",
              }}
            >
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: "100%",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                padding: "9px 12px",
                fontSize: "13px",
                outline: "none",
                fontFamily: "inherit",
              }}
            />
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
              background: loading ? "#93c0e8" : "#185FA5",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "11px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
          >
            {loading ? "Entrando..." : "Entrar no sistema"}
          </button>
        </form>

        <p
          style={{
            fontSize: "11px",
            color: "#aaa",
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
