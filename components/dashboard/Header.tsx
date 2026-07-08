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
  const title = titles[pathname] || "Engetech";

  return (
    <header
      style={{
        height: "56px",
        background: "#fff",
        borderBottom: "1px solid #e0e0e0",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <h1
        style={{
          fontSize: "16px",
          fontWeight: 600,
          color: "#1a1a1a",
        }}
      >
        {title}
      </h1>
    </header>
  );
}
