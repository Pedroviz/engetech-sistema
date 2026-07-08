"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

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
        background: "#fff",
        borderRight: "1px solid #e0e0e0",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
      }}
    >
      <div
        style={{ padding: "20px 18px 16px", borderBottom: "1px solid #e0e0e0" }}
      >
        <div style={{ fontSize: "16px", fontWeight: 700 }}>
          <span style={{ color: "#185FA5" }}>Engetech</span> Soluções
        </div>
        <div style={{ fontSize: "11px", color: "#aaa", marginTop: "3px" }}>
          Gestão de Obras
        </div>
      </div>

      <nav style={{ flex: 1, padding: "10px 8px" }}>
        {menuItems.map((item) => {
          const active = pathname === item.href;
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
                color: active ? "#185FA5" : "#555",
                background: active ? "#EBF4FF" : "transparent",
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

      <div style={{ padding: "14px 16px", borderTop: "1px solid #e0e0e0" }}>
        <div style={{ fontSize: "12px", fontWeight: 600, color: "#333" }}>
          {user.name}
        </div>
        <div style={{ fontSize: "11px", color: "#aaa", marginBottom: "10px" }}>
          {user.email}
        </div>
        <button
          onClick={logout}
          style={{
            width: "100%",
            background: "#f5f5f3",
            border: "1px solid #e0e0e0",
            borderRadius: "7px",
            padding: "7px",
            fontSize: "12px",
            color: "#666",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Sair do sistema
        </button>
      </div>
    </aside>
  );
}
