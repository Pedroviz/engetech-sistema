import type { CSSProperties } from "react";

export const card: CSSProperties = {
  background: "var(--bg-card)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: "18px 20px",
  marginBottom: "12px",
  boxShadow: "var(--shadow-sm)",
  transition: "box-shadow var(--transition)",
};

export const cardTitle: CSSProperties = {
  fontSize: "11px",
  fontWeight: 600,
  color: "var(--text-secondary)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: "14px",
};

export const metricCard: CSSProperties = {
  background: "var(--bg-card)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: "16px 18px",
  boxShadow: "var(--shadow-sm)",
};

export const table: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "13px",
};

export const th: CSSProperties = {
  textAlign: "left",
  padding: "0 8px 10px 0",
  fontSize: "11px",
  fontWeight: 600,
  color: "var(--text-secondary)",
  borderBottom: "1px solid var(--border)",
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

export const td: CSSProperties = {
  padding: "11px 8px 11px 0",
  borderBottom: "1px solid var(--border)",
  color: "var(--text-primary)",
  verticalAlign: "middle",
};

export const input: CSSProperties = {
  width: "100%",
  border: "1px solid var(--border-input)",
  borderRadius: "var(--radius-sm)",
  padding: "8px 12px",
  fontSize: "13px",
  fontFamily: "inherit",
  background: "var(--bg-input)",
  color: "var(--text-primary)",
  outline: "none",
  transition: "border-color var(--transition), box-shadow var(--transition)",
};

export const label: CSSProperties = {
  fontSize: "12px",
  fontWeight: 500,
  color: "var(--text-secondary)",
  display: "block",
  marginBottom: "6px",
};

export const btnPrimary: CSSProperties = {
  background: "var(--primary)",
  color: "var(--text-on-primary)",
  border: "none",
  borderRadius: "var(--radius-sm)",
  padding: "9px 16px",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  transition: "background var(--transition), transform var(--transition)",
  boxShadow: "0 1px 3px hsl(213, 70%, 39%, 0.3)",
};

export const btnSecondary: CSSProperties = {
  background: "var(--bg-muted)",
  color: "var(--text-secondary)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)",
  padding: "9px 16px",
  fontSize: "13px",
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: "inherit",
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  transition: "background var(--transition)",
};

export const btnDanger: CSSProperties = {
  background: "var(--danger-light)",
  color: "var(--danger-text)",
  border: "none",
  borderRadius: "var(--radius-sm)",
  padding: "4px 10px",
  fontSize: "11px",
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
  display: "inline-flex",
  alignItems: "center",
  gap: "4px",
};

export const btnGhost: CSSProperties = {
  background: "transparent",
  color: "var(--text-secondary)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)",
  padding: "4px 10px",
  fontSize: "11px",
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: "inherit",
  display: "inline-flex",
  alignItems: "center",
  gap: "4px",
  transition: "background var(--transition)",
};

export const alertWarning: CSSProperties = {
  background: "var(--warning-light)",
  border: "1px solid var(--warning)",
  borderRadius: "var(--radius-sm)",
  padding: "10px 14px",
  fontSize: "13px",
  color: "var(--warning-text)",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

export const alertDanger: CSSProperties = {
  background: "var(--danger-light)",
  border: "1px solid var(--danger)",
  borderRadius: "var(--radius-sm)",
  padding: "10px 14px",
  fontSize: "13px",
  color: "var(--danger-text)",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

export const modal: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "hsl(222, 47%, 11%, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 999,
  backdropFilter: "blur(4px)",
};

export const modalBox: CSSProperties = {
  background: "var(--bg-card)",
  borderRadius: "var(--radius-lg)",
  padding: "28px 32px",
  width: "480px",
  maxWidth: "95vw",
  boxShadow: "var(--shadow-lg)",
  border: "1px solid var(--border)",
  animation: "modalIn 200ms ease",
};

export const badge = (bg: string, color: string): CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: "4px",
  padding: "3px 8px",
  borderRadius: "var(--radius-full)",
  fontSize: "11px",
  fontWeight: 600,
  background: bg,
  color,
  whiteSpace: "nowrap" as const,
});

export const divider: CSSProperties = {
  border: "none",
  borderTop: "1px solid var(--border)",
  margin: "14px 0",
};
