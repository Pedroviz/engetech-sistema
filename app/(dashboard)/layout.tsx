"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ClipboardList, Users, Truck, Package, HardHat, Zap, BookOpen } from "lucide-react";
import Link from "next/link";

type User = {
  name: string;
  email: string;
  role: string;
};

/* ── Ícones SVG inline ──────────────────────────────── */
function IcoDashboard() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}
function IcoObras() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 21V9" />
    </svg>
  );
}
function IcoFinanceiro() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  );
}
function IcoLogout() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
function IcoBell() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );
}
function IcoSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function IcoHome() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
function IcoPlus() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function IcoMais() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
    </svg>
  );
}

/* ── Nav desktop ────────────────────────────────────── */
const DESKTOP_NAV = [
  { href: "/dashboard",    label: "Dashboard",      icon: IcoDashboard },
  { href: "/obras",        label: "Obras",          icon: IcoObras },
  { href: "/orcamentos",   label: "Orçamentos",     icon: ClipboardList },
  { href: "/clientes",     label: "Clientes",       icon: Users },
  { href: "/fornecedores", label: "Fornecedores",   icon: Truck },
  { href: "/financeiro",   label: "Financeiro",     icon: IcoFinanceiro },
  { href: "/materiais",    label: "Materiais",      icon: Package },
  { href: "/diaristas",    label: "Diaristas",      icon: HardHat },
  { href: "/gastos",       label: "Gastos",         icon: Zap },
  { href: "/rdo",          label: "Diário de Obra", icon: BookOpen },
  { href: "/admin/usuarios", label: "Usuários",      icon: Users, adminOnly: true },
];

/* ── Nav mobile (bottom) ─────────────────────────────── */
const MOBILE_NAV = [
  { href: "/dashboard",  label: "Início",     icon: IcoHome },
  { href: "/obras",      label: "Obras",      icon: IcoObras },
  { href: "/obras",      label: "",           icon: IcoPlus, isFab: true },
  { href: "/financeiro", label: "Financeiro", icon: IcoFinanceiro },
  { href: "#menu",       label: "Mais",       icon: IcoMais, isMenu: true },
];

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase() || "?";
}

/* ── Menu do avatar (nome, papel, tema e sair) ─────── */
function UserMenu({
  user,
  initials,
  tema,
  onToggleTema,
  onLogout,
}: {
  user: User | null;
  initials: string;
  tema: "light" | "dark";
  onToggleTema: () => void;
  onLogout: () => void;
}) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    function fechar(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setAberto(false);
    }
    function tecla(e: KeyboardEvent) {
      if (e.key === "Escape") setAberto(false);
    }
    document.addEventListener("mousedown", fechar);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("mousedown", fechar);
      document.removeEventListener("keydown", tecla);
    };
  }, [aberto]);

  return (
    <div className="eng-user-wrap" ref={ref}>
      <button
        type="button"
        className="eng-avatar-topbar"
        title={user?.name}
        aria-haspopup="menu"
        aria-expanded={aberto}
        onClick={() => setAberto((v) => !v)}
      >
        {initials}
      </button>
      {aberto && (
        <div className="eng-user-menu" role="menu">
          <div className="eng-user-head">
            <strong>{user?.name ?? "Usuário"}</strong>
            <span>{user?.email ?? ""}</span>
            <em className="eng-user-role">
              {user?.role === "admin" ? "Administrador" : "Usuário"}
            </em>
          </div>
          <button
            type="button"
            role="menuitem"
            className="eng-user-item"
            onClick={() => { setAberto(false); onToggleTema(); }}
          >
            {tema === "dark" ? "Tema claro" : "Tema escuro"}
          </button>
          <button
            type="button"
            role="menuitem"
            className="eng-user-item danger"
            onClick={() => { setAberto(false); onLogout(); }}
          >
            Sair
          </button>
        </div>
      )}
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tooltip, setTooltip] = useState<string | null>(null);
  const [tema, setTema] = useState<"light" | "dark">("light");
  const router = useRouter();
  const pathname = usePathname();
  const navVisivel = DESKTOP_NAV.filter((i) => !i.adminOnly || user?.role === "admin");

  useEffect(() => {
    const saved = localStorage.getItem("engetech-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = saved ? saved === "dark" : prefersDark;
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    setTema(dark ? "dark" : "light");

    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d.user) setUser(d.user); else router.push("/login"); })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Mesmo sem resposta do servidor, limpa o cookie local e sai
    }
    document.cookie = "engetech-token=; Max-Age=0; path=/";
    router.push("/login");
  }

  function toggleTema() {
    const proximo = tema === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", proximo);
    try {
      localStorage.setItem("engetech-theme", proximo);
    } catch {
      // Navegador sem localStorage: o tema vale só nesta página
    }
    setTema(proximo);
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "#0d0d1a" }}>
        <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)" }}>Carregando…</div>
      </div>
    );
  }

  const initials = getInitials(user?.name ?? "");
  const today = new Date().toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });

  return (
    <>
      <style precedence="default" href="dashboard-shell-styles">{`
        /* ══════════════════════════════════════════════════
           TOKENS — light (padrão) e dark (glassy)
        ══════════════════════════════════════════════════ */
        :root {
          --page-bg:       #f1f5f9;
          --sidebar-bg:    #1e293b;
          --sidebar-text:  rgba(255,255,255,0.55);
          --sidebar-active:#6366f1;
          --topbar-bg:     #ffffff;
          --topbar-border: #e2e8f0;
          --card-bg:       #ffffff;
          --card-border:   #e2e8f0;
          --fg-1:          #0f172a;
          --fg-2:          #475569;
          --fg-3:          #94a3b8;
          --accent:        #6366f1;
          --green:         #17b26a;
          --red:           #ef4444;
          --orange:        #f97316;
        }
        @media (prefers-color-scheme: dark) {
          :root:not([data-theme="light"]) {
            --page-bg:       #0d0d1a;
            --sidebar-bg:    #10101e;
            --sidebar-text:  rgba(255,255,255,0.40);
            --sidebar-active:#6366f1;
            --topbar-bg:     rgba(255,255,255,0.03);
            --topbar-border: rgba(255,255,255,0.07);
            --card-bg:       rgba(255,255,255,0.06);
            --card-border:   rgba(255,255,255,0.10);
            --fg-1:          #ffffff;
            --fg-2:          rgba(255,255,255,0.65);
            --fg-3:          rgba(255,255,255,0.35);
            --accent:        #6366f1;
            color-scheme: dark;
          }
        }
        :root[data-theme="dark"] {
          --page-bg:       #0d0d1a;
          --sidebar-bg:    #10101e;
          --sidebar-text:  rgba(255,255,255,0.40);
          --sidebar-active:#6366f1;
          --topbar-bg:     rgba(255,255,255,0.03);
          --topbar-border: rgba(255,255,255,0.07);
          --card-bg:       rgba(255,255,255,0.06);
          --card-border:   rgba(255,255,255,0.10);
          --fg-1:          #ffffff;
          --fg-2:          rgba(255,255,255,0.65);
          --fg-3:          rgba(255,255,255,0.35);
          --accent:        #6366f1;
          color-scheme: dark;
        }

        /* ══ Reset base ══════════════════════════════════ */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--page-bg); color: var(--fg-1); font-family: -apple-system, "Inter", sans-serif; }

        /* ══ Shell desktop ═══════════════════════════════ */
        .eng-shell { display: flex; min-height: 100vh; background: var(--page-bg); }

        /* ── Sidebar desktop ──────────────────────────── */
        .eng-sidebar {
          width: 60px;
          background: var(--sidebar-bg);
          border-right: 1px solid rgba(255,255,255,0.06);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 12px 0 16px;
          position: fixed;
          top: 0; left: 0; bottom: 0;
          z-index: 200;
          gap: 4px;
        }
        .eng-logo {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg,#6366f1,#8b5cf6);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 800; color: #fff;
          margin-bottom: 16px; flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(99,102,241,0.4);
        }
        .eng-nav-item {
          position: relative;
          width: 44px; height: 44px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          color: var(--sidebar-text);
          cursor: pointer; border: none;
          background: transparent;
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
          flex-shrink: 0;
        }
        .eng-nav-item:hover { background: rgba(255,255,255,0.08); color: #fff; }
        .eng-nav-item.active {
          background: rgba(99,102,241,0.18);
          color: #6366f1;
          border-left: 2px solid #6366f1;
          border-radius: 0 12px 12px 0;
          width: 46px;
          margin-left: -2px;
        }
        .eng-nav-tooltip {
          position: absolute; left: 58px; top: 50%; transform: translateY(-50%);
          background: rgba(15,15,30,0.95); color: #fff;
          font-size: 11px; font-weight: 600; white-space: nowrap;
          padding: 5px 10px; border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.1);
          pointer-events: none; z-index: 999;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        }
        .eng-sidebar-spacer { flex: 1; }
        .eng-logout-btn {
          width: 40px; height: 40px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.35); cursor: pointer;
          border: none; background: transparent;
          transition: background 0.15s, color 0.15s;
        }
        .eng-logout-btn:hover { background: rgba(239,68,68,0.15); color: #ef4444; }

        /* ── Main area desktop ────────────────────────── */
        .eng-main {
          flex: 1;
          margin-left: 60px;
          display: flex; flex-direction: column;
          min-height: 100vh;
        }

        /* ── Topbar desktop ──────────────────────────── */
        .eng-topbar {
          height: 52px;
          background: var(--topbar-bg);
          border-bottom: 1px solid var(--topbar-border);
          backdrop-filter: blur(12px);
          display: flex; align-items: center; gap: 12px;
          padding: 0 20px;
          position: sticky; top: 0; z-index: 99;
        }
        .eng-search-wrap { position: relative; flex: 1; max-width: 280px; }
        .eng-search-wrap svg {
          position: absolute; left: 11px; top: 50%; transform: translateY(-50%);
          color: var(--fg-3); pointer-events: none;
        }
        .eng-search-wrap input {
          width: 100%; height: 34px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 20px; padding: 0 14px 0 34px;
          font-size: 12px; color: var(--fg-1); outline: none;
        }
        .eng-search-wrap input::placeholder { color: var(--fg-3); }
        .eng-date-chip {
          font-size: 11px; color: var(--fg-2); font-weight: 500;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          padding: 4px 12px; border-radius: 20px; white-space: nowrap;
        }
        .eng-topbar-spacer { flex: 1; }
        .eng-icon-btn {
          width: 34px; height: 34px; border-radius: 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          color: var(--fg-2); cursor: pointer;
          transition: background 0.15s;
        }
        .eng-icon-btn:hover { background: rgba(255,255,255,0.10); color: var(--fg-1); }
        .eng-avatar-topbar {
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg,#6366f1,#8b5cf6);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; color: #fff;
          cursor: pointer; flex-shrink: 0;
          border: 2px solid rgba(99,102,241,0.5);
          padding: 0; font-family: inherit;
        }

        /* ── Menu do avatar ───────────────────────────── */
        .eng-user-wrap { position: relative; flex-shrink: 0; }
        .eng-user-menu {
          position: absolute; top: calc(100% + 8px); right: 0;
          width: 230px; padding: 6px; z-index: 500;
          background: #ffffff;
          border: 1px solid var(--card-border, #e2e8f0);
          border-radius: 12px;
          box-shadow: 0 16px 40px rgba(0,0,0,0.18);
          transform-origin: top right;
          animation: engMenuIn 0.14s ease-out;
        }
        :root[data-theme="dark"] .eng-user-menu {
          background: #1a1a2e;
          border-color: rgba(255,255,255,0.10);
        }
        @media (prefers-color-scheme: dark) {
          :root:not([data-theme="light"]) .eng-user-menu {
            background: #1a1a2e;
            border-color: rgba(255,255,255,0.10);
          }
        }
        @keyframes engMenuIn {
          from { opacity: 0; transform: translateY(-4px) scale(0.98); }
          to   { opacity: 1; transform: none; }
        }
        .eng-user-head {
          display: flex; flex-direction: column; gap: 2px;
          padding: 10px; margin-bottom: 6px;
          border-bottom: 1px solid var(--card-border, #e2e8f0);
        }
        .eng-user-head strong {
          font-size: 13px; font-weight: 700; color: var(--fg-1);
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .eng-user-head span {
          font-size: 11px; color: var(--fg-3);
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .eng-user-role {
          font-style: normal; align-self: flex-start; margin-top: 4px;
          font-size: 10px; font-weight: 700; color: var(--accent, #6366f1);
          background: rgba(99,102,241,0.12);
          padding: 2px 8px; border-radius: 20px;
        }
        .eng-user-item {
          width: 100%; display: block; padding: 8px 10px;
          border: none; background: none; border-radius: 8px;
          font-family: inherit; font-size: 13px; font-weight: 500;
          color: var(--fg-2); text-align: left; cursor: pointer;
        }
        .eng-user-item:hover { background: rgba(127,127,127,0.12); color: var(--fg-1); }
        .eng-user-item.danger:hover { background: rgba(239,68,68,0.12); color: #ef4444; }

        /* ── Conteúdo ────────────────────────────────── */
        .eng-content { flex: 1; padding: 24px; }

        /* ══ Mobile overlay ══════════════════════════════ */
        .eng-mobile-overlay {
          display: none;
          position: fixed; inset: 0; z-index: 300;
          background: rgba(0,0,0,0.6);
        }
        .eng-mobile-header {
          display: none;
          height: 56px;
          background: var(--card-bg, #fff);
          border-bottom: 1px solid var(--card-border, #e2e8f0);
          align-items: center; padding: 0 16px;
          justify-content: space-between;
          position: sticky; top: 0; z-index: 99;
        }
        .eng-hamburger {
          background: none; border: none; cursor: pointer;
          padding: 8px; color: var(--fg-1); font-size: 22px; line-height: 1;
        }

        /* ── Bottom Nav mobile ─────────────────────── */
        .eng-bottom-nav {
          position: fixed; bottom: 0; left: 0; right: 0; height: 64px;
          background: var(--card-bg, #fff);
          border-top: 1px solid var(--card-border, #e2e8f0);
          display: flex; align-items: center; justify-content: space-around;
          padding-bottom: env(safe-area-inset-bottom, 0px); z-index: 100;
        }
        .eng-nav-item-m {
          display: flex; flex-direction: column; align-items: center;
          gap: 3px; flex: 1; padding: 8px 0;
          color: var(--fg-3, #94a3b8); text-decoration: none;
          border: none; background: none; cursor: pointer;
          font-family: inherit; transition: color 0.15s;
        }
        .eng-nav-item-m span { font-size: 10px; font-weight: 600; }
        .eng-nav-item-m.active { color: var(--accent, #6366f1); }
        .eng-fab-wrap { flex: 1; display: flex; justify-content: center; align-items: center; text-decoration: none; }
        .eng-fab {
          display: flex; align-items: center; justify-content: center;
          width: 46px; height: 46px; border-radius: 14px;
          background: var(--accent, #6366f1); color: #fff;
          box-shadow: 0 4px 12px rgba(99,102,241,0.4);
          transition: transform 0.12s; margin-bottom: 2px;
        }
        .eng-fab:active { transform: scale(0.93); }

        /* ══ Responsivo ══════════════════════════════════ */
        @media (max-width: 768px) {
          .eng-sidebar       { display: none !important; }
          .eng-topbar        { display: none !important; }
          .eng-main          { margin-left: 0 !important; }
          .eng-mobile-header { display: flex !important; }
          .eng-content       { padding: 0 !important; padding-bottom: calc(64px + env(safe-area-inset-bottom,0px)) !important; }
        }
        @media (min-width: 769px) {
          .eng-bottom-nav    { display: none !important; }
          .eng-mobile-header { display: none !important; }
        }
        @media (prefers-color-scheme: dark) {
          :root:not([data-theme="light"]) .glass-card {
            backdrop-filter: blur(12px) saturate(180%);
          }
        }
        :root[data-theme="dark"] .glass-card {
          backdrop-filter: blur(12px) saturate(180%);
        }

        /* ── Mobile sidebar overlay ─────────────────── */
        .eng-mob-sidebar {
          position: fixed; top: 0; left: 0; bottom: 0;
          width: 240px; background: var(--sidebar-bg);
          border-right: 1px solid rgba(255,255,255,0.08);
          z-index: 400; padding: 20px 0;
          display: flex; flex-direction: column; gap: 4px;
        }
        .eng-mob-nav-item {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 20px; color: var(--sidebar-text);
          text-decoration: none; font-size: 14px; font-weight: 500;
          transition: background 0.15s, color 0.15s;
        }
        .eng-mob-nav-item:hover { background: rgba(255,255,255,0.06); color: #fff; }
        .eng-mob-nav-item.active { background: rgba(99,102,241,0.15); color: #6366f1; }
        .eng-mob-logo {
          display: flex; align-items: center; gap: 10px;
          padding: 0 20px 20px; border-bottom: 1px solid rgba(255,255,255,0.07);
          margin-bottom: 8px;
        }
        .eng-mob-logo-icon {
          width: 32px; height: 32px; border-radius: 8px;
          background: linear-gradient(135deg,#6366f1,#8b5cf6);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 800; color: #fff;
        }
        .eng-mob-logo-text { font-size: 14px; font-weight: 700; color: #fff; }
        .eng-mob-logo-text span { color: #6366f1; }
      `}</style>

      {/* ════ SHELL ════════════════════════════════════ */}
      <div className="eng-shell">

        {/* ── Sidebar desktop ──────────────────────── */}
        <aside className="eng-sidebar">
          <div className="eng-logo">M</div>

          {navVisivel.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`eng-nav-item${isActive ? " active" : ""}`}
                onMouseEnter={() => setTooltip(item.label)}
                onMouseLeave={() => setTooltip(null)}
                title={item.label}
              >
                <item.icon />
                {tooltip === item.label && (
                  <span className="eng-nav-tooltip">{item.label}</span>
                )}
              </Link>
            );
          })}

          <div className="eng-sidebar-spacer" />

          <button className="eng-logout-btn" onClick={handleLogout} title="Sair">
            <IcoLogout />
          </button>
        </aside>

        {/* ── Main ─────────────────────────────────── */}
        <div className="eng-main">

          {/* Topbar desktop */}
          <header className="eng-topbar">
            <div className="eng-search-wrap">
              <IcoSearch />
              <input type="search" placeholder="Buscar obras, clientes…" />
            </div>
            <span className="eng-date-chip">{today}</span>
            <div className="eng-topbar-spacer" />
            <button className="eng-icon-btn" aria-label="Notificações">
              <IcoBell />
            </button>
            <UserMenu
              user={user}
              initials={initials}
              tema={tema}
              onToggleTema={toggleTema}
              onLogout={handleLogout}
            />
          </header>

          {/* Header mobile */}
          <div className="eng-mobile-header">
            {sidebarOpen && (
              <div className="eng-mobile-overlay" onClick={() => setSidebarOpen(false)}>
                <nav className="eng-mob-sidebar" onClick={(e) => e.stopPropagation()}>
                  <div className="eng-mob-logo">
                    <div className="eng-mob-logo-icon">M</div>
                    <div className="eng-mob-logo-text"><span>Mão</span> na Obra</div>
                  </div>
                  {navVisivel.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`eng-mob-nav-item${isActive ? " active" : ""}`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            )}
            <button className="eng-hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
            <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--fg-1)" }}>
              <span style={{ color: "#6366f1" }}>Mão</span> na Obra
            </span>
            <UserMenu
              user={user}
              initials={initials}
              tema={tema}
              onToggleTema={toggleTema}
              onLogout={handleLogout}
            />
          </div>

          {/* Conteúdo da página */}
          <main className="eng-content">{children}</main>
        </div>
      </div>

      {/* ── Bottom Nav mobile ──────────────────────── */}
      <nav className="eng-bottom-nav">
        {MOBILE_NAV.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          if (item.isMenu) {
            return (
              <button
                key={item.href}
                type="button"
                className="eng-nav-item-m"
                onClick={() => setSidebarOpen(true)}
              >
                <item.icon />
                <span>{item.label}</span>
              </button>
            );
          }
          if (item.isFab) {
            return (
              <Link key="fab" href={item.href} className="eng-fab-wrap">
                <span className="eng-fab"><item.icon /></span>
              </Link>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`eng-nav-item-m${isActive ? " active" : ""}`}
            >
              <item.icon />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
