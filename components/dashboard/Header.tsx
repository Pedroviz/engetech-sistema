"use client";

import { usePathname } from "next/navigation";
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
} from "lucide-react";

const pages: Record<string, { title: string; icon: React.ElementType }> = {
  "/dashboard": { title: "Dashboard", icon: LayoutDashboard },
  "/obras": { title: "Obras", icon: Building2 },
  "/orcamentos": { title: "Orçamentos", icon: ClipboardList },
  "/clientes": { title: "Clientes", icon: Users },
  "/fornecedores": { title: "Fornecedores", icon: Truck },
  "/financeiro": { title: "Financeiro", icon: Wallet },
  "/materiais": { title: "Materiais", icon: Package },
  "/diaristas": { title: "Diaristas", icon: HardHat },
  "/gastos": { title: "Gastos Esporádicos", icon: Zap },
  "/rdo": { title: "Diário de Obra", icon: BookOpen },
};

export default function Header() {
  const pathname = usePathname();
  const base = "/" + pathname.split("/")[1];
  const page = pages[base];
  const Icon = page?.icon || LayoutDashboard;

  return (
    <header
      style={{
        height: "56px",
        background: "var(--bg-card)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 10,
        boxShadow: "var(--shadow-sm)",
        gap: "10px",
        transition: "background var(--transition-slow)",
      }}
    >
      <Icon size={18} color="var(--primary)" strokeWidth={2} />
      <h1
        style={{
          fontSize: "15px",
          fontWeight: 600,
          color: "var(--text-primary)",
          letterSpacing: "-0.2px",
        }}
      >
        {page?.title || "Engetech"}
      </h1>
    </header>
  );
}
