"use client";

import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Building2, ClipboardList, Users,
  Truck, Wallet, Package, HardHat, Zap, BookOpen,
} from "lucide-react";

const pages: Record<string, { title: string; icon: React.ElementType; sub?: string }> = {
  "/dashboard":    { title: "Dashboard",          icon: LayoutDashboard, sub: "Visão geral" },
  "/obras":        { title: "Obras",              icon: Building2,       sub: "Gestão de obras" },
  "/orcamentos":   { title: "Orçamentos",         icon: ClipboardList,   sub: "Pipeline comercial" },
  "/clientes":     { title: "Clientes",           icon: Users,           sub: "CRM" },
  "/fornecedores": { title: "Fornecedores",       icon: Truck,           sub: "Cadastro" },
  "/financeiro":   { title: "Financeiro",         icon: Wallet,          sub: "Lançamentos" },
  "/materiais":    { title: "Materiais",          icon: Package,         sub: "Controle de insumos" },
  "/diaristas":    { title: "Diaristas",          icon: HardHat,         sub: "Mão de obra" },
  "/gastos":       { title: "Gastos Esporádicos", icon: Zap,             sub: "Imprevistos" },
  "/rdo":          { title: "Diário de Obra",     icon: BookOpen,        sub: "Registro diário" },
};

export default function Header() {
  const pathname = usePathname();
  const base     = "/" + pathname.split("/")[1];
  const page     = pages[base];
  const Icon     = page?.icon || LayoutDashboard;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "10px",
      padding: "0 8px", height: "100%",
    }}>
      {/* Ícone — só no desktop */}
      <div className="hide-mobile" style={{
        width: 32, height: 32, borderRadius: "var(--radius-sm)",
        background: "var(--primary-light)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon size={16} color="var(--primary)" />
      </div>

      {/* Título + subtítulo */}
      <div>
        <h1 style={{
          fontSize: "15px", fontWeight: 600,
          color: "var(--text-primary)", letterSpacing: "-0.2px",
          lineHeight: 1.2,
        }}>
          {page?.title || "Engetech"}
        </h1>
        {page?.sub && (
          <p className="hide-mobile" style={{
            fontSize: "11px", color: "var(--text-muted)", marginTop: "1px",
          }}>
            {page.sub}
          </p>
        )}
      </div>
    </div>
  );
}
