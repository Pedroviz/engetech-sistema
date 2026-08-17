"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  ClipboardList,
  Users,
  Truck,
  Wallet,
  Package,
  HardHat,
  Zap,
  BookOpen,
  LogOut,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/lib/useTheme";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/obras", label: "Obras", icon: Building2 },
  { href: "/orcamentos", label: "Orçamentos", icon: ClipboardList },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/fornecedores", label: "Fornecedores", icon: Truck },
  { href: "/financeiro", label: "Financeiro", icon: Wallet },
  { href: "/materiais", label: "Materiais", icon: Package },
  { href: "/diaristas", label: "Diaristas", icon: HardHat },
  { href: "/gastos", label: "Gastos", icon: Zap },
  { href: "/rdo", label: "Diário de Obra", icon: BookOpen },
];

interface SidebarProps {
  user: { name: string; email: string; role: string };
  onClose?: () => void;
}

export default function Sidebar({ user, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isDark, toggle } = useTheme();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <aside
      style={{
        width: "220px",
        minHeight: "100vh",
        background: "var(--bg-sidebar)",
        boxShadow: "var(--shadow-sidebar)",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 200,
        transition: "background var(--transition-slow)",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "20px 16px 16px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "15px",
              fontWeight: 700,
              letterSpacing: "-0.3px",
            }}
          >
            <span style={{ color: "var(--primary)" }}>Engetech</span>
            <span style={{ color: "var(--text-primary)" }}> Soluções</span>
          </div>
          <div
            style={{
              fontSize: "10px",
              color: "var(--text-muted)",
              marginTop: "2px",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Gestão de Obras
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              padding: "4px",
              borderRadius: "var(--radius-sm)",
              display: "flex",
            }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Menu */}
      <nav style={{ flex: 1, padding: "8px", overflowY: "auto" }}>
        {menuItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
                padding: "8px 10px",
                borderRadius: "var(--radius-sm)",
                marginBottom: "1px",
                fontSize: "13px",
                fontWeight: active ? 600 : 400,
                color: active ? "var(--primary)" : "var(--text-secondary)",
                background: active ? "var(--primary-light)" : "transparent",
                textDecoration: "none",
                transition: "all var(--transition)",
              }}
            >
              <Icon size={16} strokeWidth={active ? 2.5 : 2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Rodapé */}
      <div style={{ padding: "12px", borderTop: "1px solid var(--border)" }}>
        {/* Avatar + nome */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "10px",
            padding: "4px",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "var(--radius-full)",
              background: "var(--primary-light)",
              color: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--text-primary)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.name}
            </div>
            <div
              style={{
                fontSize: "10px",
                color: "var(--text-muted)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.email}
            </div>
          </div>
        </div>

        {/* Botões */}
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            onClick={toggle}
            title={isDark ? "Tema claro" : "Tema escuro"}
            style={{
              flex: 1,
              background: "var(--bg-muted)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "7px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-secondary)",
              transition: "background var(--transition)",
            }}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button
            onClick={logout}
            style={{
              flex: 3,
              background: "var(--bg-muted)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "7px",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: "12px",
              fontWeight: 500,
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              transition: "background var(--transition)",
            }}
          >
            <LogOut size={14} />
            Sair
          </button>
        </div>
      </div>
    </aside>
  );
}
