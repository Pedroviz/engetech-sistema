"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";

type User = {
  name: string;
  email: string;
  role: string;
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("engetech-theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const dark = saved ? saved === "dark" : prefersDark;
    document.documentElement.setAttribute(
      "data-theme",
      dark ? "dark" : "light",
    );

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
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-secondary)",
        }}
      >
        <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>
          Carregando...
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
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
        }
        .sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          z-index: 200;
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
          position: sticky;
          top: 0;
          z-index: 99;
        }
        .hamburger {
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          color: var(--text-primary);
          font-size: 22px;
          line-height: 1;
        }
      `}</style>

      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          background: "var(--bg-secondary)",
        }}
      >
        {/* Overlay mobile */}
        {sidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <Sidebar
                user={user || { name: "", email: "", role: "" }}
                onClose={() => setSidebarOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Sidebar desktop */}
        <div className="sidebar-desktop">
          <Sidebar user={user || { name: "", email: "", role: "" }} />
        </div>

        {/* Conteúdo principal */}
        <div
          className="main-content"
          style={{
            flex: 1,
            marginLeft: "220px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header mobile */}
          <div className="mobile-header">
            <button
              className="hamburger"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menu"
            >
              ☰
            </button>
            <span
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              <span style={{ color: "var(--blue)" }}>Engetech</span> Soluções
            </span>
            <div style={{ width: 38 }} />
          </div>

          {/* Header desktop */}
          <div className="desktop-header">
            <Header />
          </div>

          <main style={{ flex: 1, padding: "16px" }}>{children}</main>
        </div>
      </div>
    </>
  );
}
