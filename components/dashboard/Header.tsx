"use client";

import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/obras": "Obras",
  "/orcamentos": "Orçamentos",
  "/clientes": "Clientes",
  "/fornecedores": "Fornecedores",
  "/financeiro": "Financeiro",
  "/materiais": "Materiais",
  "/diaristas": "Diaristas",
  "/gastos": "Gastos Esporádicos",
};

export default function Header() {
  const pathname = usePathname();
  const base = "/" + pathname.split("/")[1];
  const title = titles[base] || "Engetech";

  return (
    <header
      style={{
        height: "56px",
        background: "var(--bg-primary)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 10,
        transition: "background 0.2s, border-color 0.2s",
      }}
    >
      <h1
        style={{
          fontSize: "16px",
          fontWeight: 600,
          color: "var(--text-primary)",
        }}
      >
        {title}
      </h1>
    </header>
  );
}
