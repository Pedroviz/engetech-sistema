"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Building2, BookOpen,
  Wallet, MoreHorizontal, ClipboardList,
  Users, Truck, Package, HardHat, Zap,
} from "lucide-react";
import { useState } from "react";

// ── 4 atalhos principais + drawer "Mais" ──────────────────────────────────
const mainItems = [
  { href: "/dashboard",  label: "Início",     icon: LayoutDashboard },
  { href: "/obras",      label: "Obras",      icon: Building2 },
  { href: "/financeiro", label: "Financeiro", icon: Wallet },
  { href: "/rdo",        label: "Diário",     icon: BookOpen },
];

const moreItems = [
  { href: "/orcamentos",   label: "Orçamentos",   icon: ClipboardList },
  { href: "/clientes",     label: "Clientes",     icon: Users },
  { href: "/fornecedores", label: "Fornecedores", icon: Truck },
  { href: "/materiais",    label: "Materiais",    icon: Package },
  { href: "/diaristas",    label: "Diaristas",    icon: HardHat },
  { href: "/gastos",       label: "Gastos",       icon: Zap },
];

export default function BottomNav() {
  const pathname   = usePathname();
  const [open, setOpen] = useState(false);

  const isMoreActive = moreItems.some(
    i => pathname === i.href || pathname.startsWith(i.href + "/")
  );

  return (
    <>
      <style>{`
        @keyframes slideUp   { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeInOv  { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      {/* ── Drawer "Mais" ── */}
      {open && (
        <>
          {/* Overlay */}
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 98,
              background: "rgba(0,0,0,0.4)",
              animation: "fadeInOv 200ms ease",
            }}
          />
          {/* Sheet */}
          <div style={{
            position: "fixed",
            bottom: "calc(64px + env(safe-area-inset-bottom, 0px))",
            left: 0, right: 0, zIndex: 99,
            background: "var(--bg-card)",
            borderTop: "1px solid var(--border)",
            borderRadius: "20px 20px 0 0",
            padding: "20px 16px 12px",
            boxShadow: "0 -8px 32px rgba(0,0,0,0.15)",
            animation: "slideUp 220ms cubic-bezier(.4,0,.2,1)",
          }}>
            {/* Handle */}
            <div style={{
              width: 36, height: 4, borderRadius: 2,
              background: "var(--border-strong)",
              margin: "-10px auto 16px",
            }} />

            <p style={{
              fontSize: "11px", fontWeight: 600,
              color: "var(--text-muted)", textTransform: "uppercase",
              letterSpacing: "0.06em", marginBottom: "14px",
            }}>
              Mais módulos
            </p>

            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px",
            }}>
              {moreItems.map(item => {
                const Icon   = item.icon;
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    style={{
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center",
                      gap: "6px", padding: "14px 8px",
                      borderRadius: "var(--radius)",
                      background: active ? "var(--primary-light)" : "var(--bg-muted)",
                      color: active ? "var(--primary)" : "var(--text-secondary)",
                      textDecoration: "none",
                      fontSize: "11px", fontWeight: active ? 600 : 500,
                      border: active ? "1.5px solid var(--primary)" : "1px solid transparent",
                      transition: "all var(--transition)",
                    }}
                  >
                    <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ── Barra de navegação inferior ── */}
      {mainItems.map(item => {
        const Icon   = item.icon;
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: "3px", padding: "8px 4px",
              color: active ? "var(--primary)" : "var(--text-muted)",
              textDecoration: "none", position: "relative",
              transition: "color var(--transition)",
            }}
          >
            {/* Pill ativo atrás do ícone */}
            {active && (
              <div style={{
                position: "absolute",
                top: "6px",
                width: "40px", height: "28px",
                background: "var(--primary-light)",
                borderRadius: "14px",
                zIndex: 0,
              }} />
            )}
            <Icon
              size={22}
              strokeWidth={active ? 2.5 : 1.8}
              style={{ position: "relative", zIndex: 1 }}
            />
            <span style={{
              fontSize: "10px",
              fontWeight: active ? 600 : 400,
              letterSpacing: active ? "0.01em" : 0,
            }}>
              {item.label}
            </span>
          </Link>
        );
      })}

      {/* Botão "Mais" */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: "3px", padding: "8px 4px",
          background: "none", border: "none", cursor: "pointer",
          color: isMoreActive || open ? "var(--primary)" : "var(--text-muted)",
          fontFamily: "inherit", position: "relative",
          transition: "color var(--transition)",
        }}
      >
        {(isMoreActive || open) && (
          <div style={{
            position: "absolute", top: "6px",
            width: "40px", height: "28px",
            background: "var(--primary-light)", borderRadius: "14px",
          }} />
        )}
        <MoreHorizontal
          size={22}
          strokeWidth={isMoreActive || open ? 2.5 : 1.8}
          style={{ position: "relative", zIndex: 1 }}
        />
        <span style={{
          fontSize: "10px",
          fontWeight: isMoreActive || open ? 600 : 400,
        }}>
          Mais
        </span>
      </button>
    </>
  );
}
