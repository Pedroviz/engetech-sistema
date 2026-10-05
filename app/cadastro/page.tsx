"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  HardHat,
} from "lucide-react";

export default function CadastroPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nome: "",
    empresa: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  function validarStep1() {
    if (!form.nome.trim()) return "Informe seu nome completo";
    if (!form.empresa.trim()) return "Informe o nome da empresa";
    return null;
  }

  function validarStep2() {
    if (!form.email.trim() || !form.email.includes("@"))
      return "E-mail inválido";
    if (form.senha.length < 6) return "A senha deve ter ao menos 6 caracteres";
    if (form.senha !== form.confirmarSenha) return "As senhas não coincidem";
    return null;
  }

  function avancar() {
    const err = validarStep1();
    if (err) {
      setError(err);
      return;
    }
    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validarStep2();
    if (err) {
      setError(err);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome,
          empresa: form.empresa,
          email: form.email,
          senha: form.senha,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao criar conta");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.root}>
      <aside style={styles.aside}>
        <div style={styles.asideLogo}>
          <HardHat size={36} color="white" />
          <span style={styles.asideBrand}>Engetech</span>
        </div>

        <div style={styles.asideContent}>
          <h1 style={styles.asideTitle}>Gerencie suas obras com clareza</h1>
          <p style={styles.asideSubtitle}>
            Controle orçamentos, equipes, RDOs e o portal do cliente — tudo em
            um só lugar.
          </p>

          <ul style={styles.beneficios}>
            {[
              "Diário de obra digital (RDO)",
              "Portal do cliente sem login",
              "Controle financeiro por obra",
              "Acesso via celular ou desktop",
            ].map((item) => (
              <li key={item} style={styles.beneficioItem}>
                <CheckCircle2 size={16} color="rgba(255,255,255,0.7)" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <p style={styles.asideFooter}>Engetech Soluções © 2025</p>
      </aside>

      <main style={styles.main}>
        <div style={styles.formBox}>
          <div style={styles.steps}>
            <div style={stepDot(step >= 1)}>1</div>
            <div style={stepLine(step >= 2)} />
            <div style={stepDot(step >= 2)}>2</div>
          </div>

          <h2 style={styles.title}>
            {step === 1 ? "Sobre você e sua empresa" : "Acesso à plataforma"}
          </h2>
          <p style={styles.subtitle}>
            {step === 1
              ? "Vamos começar com algumas informações básicas"
              : "Defina seu e-mail e senha de acesso"}
          </p>

          <form
            onSubmit={
              step === 1
                ? (e) => {
                    e.preventDefault();
                    avancar();
                  }
                : handleSubmit
            }
          >
            {step === 1 && (
              <>
                <Field
                  icon={<User size={16} />}
                  label="Nome completo"
                  name="nome"
                  placeholder="Pedro Alves"
                  value={form.nome}
                  onChange={handleChange}
                  autoFocus
                />
                <Field
                  icon={<Building2 size={16} />}
                  label="Nome da empresa"
                  name="empresa"
                  placeholder="Engetech Soluções LTDA"
                  value={form.empresa}
                  onChange={handleChange}
                />
              </>
            )}

            {step === 2 && (
              <>
                <Field
                  icon={<Mail size={16} />}
                  label="E-mail"
                  name="email"
                  type="email"
                  placeholder="pedro@engetech.com.br"
                  value={form.email}
                  onChange={handleChange}
                  autoFocus
                />
                <Field
                  icon={<Lock size={16} />}
                  label="Senha"
                  name="senha"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={form.senha}
                  onChange={handleChange}
                  suffix={
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      style={styles.eyeBtn}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />
                <Field
                  icon={<Lock size={16} />}
                  label="Confirmar senha"
                  name="confirmarSenha"
                  type="password"
                  placeholder="Repita a senha"
                  value={form.confirmarSenha}
                  onChange={handleChange}
                />
              </>
            )}

            {error && <p style={styles.error}>{error}</p>}

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.btn,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                "Criando conta..."
              ) : (
                <>
                  {step === 1 ? "Continuar" : "Criar minha conta"}
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                style={styles.btnBack}
              >
                ← Voltar
              </button>
            )}
          </form>

          <p style={styles.loginLink}>
            Já tem uma conta?{" "}
            <Link href="/login" style={styles.link}>
              Fazer login
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

function Field({
  icon,
  label,
  suffix,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  icon: React.ReactNode;
  label: string;
  suffix?: React.ReactNode;
}) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      <div style={styles.inputWrap}>
        <span style={styles.inputIcon}>{icon}</span>
        <input style={styles.input} {...props} />
        {suffix}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  aside: {
    width: 420,
    background: "linear-gradient(160deg, #1B5FA6 0%, #0e3d72 100%)",
    padding: "40px 48px",
    display: "flex",
    flexDirection: "column",
    color: "white",
    flexShrink: 0,
  },
  asideLogo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 64,
  },
  asideBrand: { fontSize: 22, fontWeight: 700, letterSpacing: "-0.3px" },
  asideContent: { flex: 1 },
  asideTitle: {
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 1.25,
    marginBottom: 16,
    letterSpacing: "-0.5px",
  },
  asideSubtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.75)",
    lineHeight: 1.6,
    marginBottom: 40,
  },
  beneficios: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  beneficioItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
  },
  asideFooter: { fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 40 },
  main: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8f9fa",
    padding: "32px 24px",
  },
  formBox: {
    background: "white",
    borderRadius: 16,
    padding: "40px 44px",
    width: "100%",
    maxWidth: 440,
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  },
  steps: { display: "flex", alignItems: "center", marginBottom: 32, gap: 0 },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: "#0f1923",
    marginBottom: 6,
    letterSpacing: "-0.3px",
  },
  subtitle: { fontSize: 14, color: "#6b7280", marginBottom: 28 },
  field: { marginBottom: 20 },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 6,
  },
  inputWrap: {
    display: "flex",
    alignItems: "center",
    border: "1.5px solid #e5e7eb",
    borderRadius: 10,
    overflow: "hidden",
    background: "#fafafa",
  },
  inputIcon: {
    padding: "0 12px",
    color: "#9ca3af",
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
  },
  input: {
    flex: 1,
    border: "none",
    outline: "none",
    padding: "11px 12px 11px 0",
    fontSize: 14,
    color: "#111827",
    background: "transparent",
    width: "100%",
  },
  eyeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "0 12px",
    color: "#9ca3af",
    display: "flex",
    alignItems: "center",
  },
  error: {
    fontSize: 13,
    color: "#dc2626",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: 8,
    padding: "10px 14px",
    marginBottom: 16,
  },
  btn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    padding: "13px",
    background: "#1B5FA6",
    color: "white",
    border: "none",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 600,
    marginTop: 8,
  },
  btnBack: {
    display: "block",
    width: "100%",
    textAlign: "center",
    marginTop: 12,
    background: "none",
    border: "none",
    color: "#6b7280",
    fontSize: 14,
    cursor: "pointer",
    padding: "8px",
  },
  loginLink: {
    textAlign: "center",
    fontSize: 14,
    color: "#6b7280",
    marginTop: 24,
  },
  link: { color: "#1B5FA6", fontWeight: 600, textDecoration: "none" },
};

function stepDot(active: boolean): React.CSSProperties {
  return {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: active ? "#1B5FA6" : "#e5e7eb",
    color: active ? "white" : "#9ca3af",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 700,
    flexShrink: 0,
    transition: "all 0.2s",
  };
}

function stepLine(active: boolean): React.CSSProperties {
  return {
    flex: 1,
    height: 2,
    background: active ? "#1B5FA6" : "#e5e7eb",
    transition: "background 0.3s",
  };
}
