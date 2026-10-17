"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";

type User = {
  name: string;
  email: string;
  role: string;
};

/* ── Ícones do bottom nav ───────────────────────────── */
function IconHome() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}
function IconObras() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <path d="M3 9h18M9 21V9"/>
    </svg>
  );
}
function IconPlus() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}
function IconFinanceiro() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
    </svg>
  );
}
function IconMais() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
    </svg>
  );
}

const NAV_ITEMS = [
  { href: "/dashboard",   label: "Início",      icon: IconHome },
  { href: "/obras",       label: "Obras",       icon: IconObras },
  { href: "/nova-obra",   label: "",            icon: IconPlus, isFab: true },
  { href: "/financeiro",  label: "Financeiro",  icon: IconFinanceiro },
  { href: "/perfil",      label: "Mais",        icon: IconMais },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const saved = localStorage.getItem("engetech-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = saved ? saved === "dark" : prefersDark;
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
        else router.push("/login");
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "var(--bg-secondary)" }}>
        <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>Carregando...</div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        /* ── Responsivo desktop/mobile ── */
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
          .main-content    { margin-left: 0 !important; }
          .sidebar-overlay { display: flex !important; }
          .mobile-header   { display: flex !important; }
          .desktop-header  { display: none !important; }
          .metrics-grid    { grid-template-columns: 1fr 1fr !important; }
          .chart-grid      { grid-template-columns: 1fr !important; }
          .form-grid-2     { grid-template-columns: 1fr !important; }
          .table-scroll    { overflow-x: auto; }
          .actions-col     { min-width: 180px; }
          .pipeline-grid   { grid-template-columns: 1fr !important; overflow-x: auto; }
          .cards-grid      { grid-template-columns: 1fr !important; }
          /* espaço para o bottom nav */
          .main-inner      { padding-bottom: calc(64px + env(safe-area-inset-bottom, 0px)) !important; }
        }
        @media (min-width: 769px) {
          .bottom-nav { display: none !important; }
        }

        /* ── Overlay e header mobile ── */
        .sidebar-overlay {
          display: none;
          position: fixed; inset: 0; z-index: 200;
          background: rgba(0,0,0,0.5);
        }
        .mobile-header {
          display: none;
          height: 56px;
          background: var(--bg-primary);
          border-bottom: 1px solid var(--border);
          align-items: center;
          padding: 0 16px;
          justify-content: space-between;
          position: sticky; top: 0; z-index: 99;
        }
        .hamburger {
          background: none; border: none; cursor: pointer;
          padding: 8px; color: var(--text-primary); font-size: 22px; line-height: 1;
        }

        /* ── Bottom Nav ── */
        .bottom-nav {
          position: fixed; bottom: 0; left: 0; right: 0;
          height: 64px;
          background: var(--card, #fff);
          border-top: 1px solid var(--card-border, #e2e8f0);
          display: flex; align-items: center; justify-content: space-around;
          padding-bottom: env(safe-area-inset-bottom, 0px);
          z-index: 100;
        }
        .nav-item {
          display: flex; flex-direction: column; align-items: center;
          gap: 3px; flex: 1; padding: 8px 0;
          color: var(--fg-3, #94a3b8);
          text-decoration: none; border: none; background: none;
          font-family: var(--font, inherit); cursor: pointer;
          transition: color 0.15s;
        }
        .nav-item span { font-size: 10px; font-weight: 600; }
        .nav-item.active { color: var(--accent, #1a73e8); }
        .nav-fab-wrap {
          flex: 1; display: flex; justify-content: center;
          align-items: center; text-decoration: none;
        }
        .nav-fab {
          display: flex; align-items: center; justify-content: center;
          width: 46px; height: 46px; border-radius: 14px;
          background: var(--accent, #1a73e8); color: #fff;
          box-shadow: 0 4px 12px rgba(26,115,232,0.4);
          transition: transform 0.12s;
          margin-bottom: 2px;
        }
        .nav-fab:active { transform: scale(0.93); }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-secondary)" }}>
        {/* Overlay mobile */}
        {sidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}>
            <div onClick={(e) => e.stopPropagation()}>
              <Sidebar user={user || { name: "", email: "", role: "" }} onClose={() => setSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Sidebar desktop */}
        <div className="sidebar-desktop">
          <Sidebar user={user || { name: "", email: "", role: "" }} />
        </div>

        {/* Conteúdo principal */}
        <div className="main-content" style={{ flex: 1, marginLeft: "220px", display: "flex", flexDirection: "column" }}>
          {/* Header mobile */}
          <div className="mobile-header">
            <button className="hamburger" onClick={() => setSidebarOpen(true)} aria-label="Abrir menu">☰</button>
            <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
              <span style={{ color: "var(--blue)" }}>Engetech</span> Soluções
            </span>
            <div style={{ width: 38 }} />
          </div>

          {/* Header desktop */}
          <div className="desktop-header">
            <Header />
          </div>

          <main className="main-inner" style={{ flex: 1, padding: "16px" }}>{children}</main>
        </div>
      </div>

      {/* ── Bottom Nav (só mobile) ── */}
      <nav className="bottom-nav">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          if (item.isFab) {
            return (
              <Link key={item.href} href={item.href} className="nav-fab-wrap">
                <span className="nav-fab"><item.icon /></span>
              </Link>
            );
          }
          return (
            <Link key={item.href} href={item.href} className={`nav-item${isActive ? " active" : ""}`}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
