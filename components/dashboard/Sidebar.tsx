"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/obras", label: "Obras", icon: "🏗️" },
  { href: "/orcamentos", label: "Orçamentos", icon: "📋" },
  { href: "/clientes", label: "Clientes", icon: "👥" },
  { href: "/fornecedores", label: "Fornecedores", icon: "🏪" },
  { href: "/financeiro", label: "Financeiro", icon: "💰" },
  { href: "/materiais", label: "Materiais", icon: "🧱" },
  { href: "/diaristas", label: "Diaristas", icon: "👷" },
  { href: "/gastos", label: "Gastos", icon: "⚡" },
];

interface SidebarProps {
  user: { name: string; email: string; role: string };
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <aside
      style={{
        width: "220px",
        minHeight: "100vh",
        background: "var(--bg-primary)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 100,
        transition: "background 0.2s, border-color 0.2s",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "20px 18px 16px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            fontSize: "16px",
            fontWeight: 700,
            color: "var(--text-primary)",
          }}
        >
          <span style={{ color: "var(--blue)" }}>Engetech</span> Soluções
        </div>
        <div
          style={{
            fontSize: "11px",
            color: "var(--text-muted)",
            marginTop: "3px",
          }}
        >
          Gestão de Obras
        </div>
      </div>

      {/* Menu */}
      <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto" }}>
        {menuItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "9px 10px",
                borderRadius: "8px",
                marginBottom: "2px",
                fontSize: "13px",
                fontWeight: active ? 600 : 400,
                color: active ? "var(--blue)" : "var(--text-secondary)",
                background: active
                  ? document.documentElement.getAttribute("data-theme") ===
                    "dark"
                    ? "rgba(74,159,212,0.15)"
                    : "#EBF4FF"
                  : "transparent",
                textDecoration: "none",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: "16px" }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Rodapé */}
      <div
        style={{ padding: "14px 16px", borderTop: "1px solid var(--border)" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--text-primary)",
              }}
            >
              {user.name}
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              {user.email}
            </div>
          </div>
          <ThemeToggle />
        </div>
        <button
          onClick={logout}
          style={{
            width: "100%",
            background: "var(--bg-tertiary)",
            border: "1px solid var(--border)",
            borderRadius: "7px",
            padding: "7px",
            fontSize: "12px",
            color: "var(--text-secondary)",
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all 0.2s",
          }}
        >
          Sair do sistema
        </button>
      </div>
    </aside>
  );
}
