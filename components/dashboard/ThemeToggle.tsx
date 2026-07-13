"use client";

import { useTheme } from "@/lib/useTheme";

export default function ThemeToggle() {
  const { isDark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      title={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
      style={{
        background: "transparent",
        border: "1px solid var(--border)",
        borderRadius: "20px",
        padding: "5px 10px",
        cursor: "pointer",
        fontSize: "14px",
        display: "flex",
        alignItems: "center",
        gap: "5px",
        color: "var(--text-secondary)",
        transition: "all 0.2s",
      }}
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}
