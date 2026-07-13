// Estilos compartilhados que respeitam o tema claro/escuro
export const card: React.CSSProperties = {
  background: "var(--bg-primary)",
  border: "1px solid var(--border)",
  borderRadius: "10px",
  padding: "18px 20px",
  marginBottom: "12px",
};

export const cardTitle: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 600,
  color: "var(--text-secondary)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: "14px",
};

export const metricCard: React.CSSProperties = {
  background: "var(--bg-primary)",
  border: "1px solid var(--border)",
  borderRadius: "10px",
  padding: "16px 18px",
};

export const table: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "13px",
};

export const th: React.CSSProperties = {
  textAlign: "left",
  padding: "0 8px 10px 0",
  fontSize: "11px",
  fontWeight: 600,
  color: "var(--text-secondary)",
  borderBottom: "1px solid var(--border)",
};

export const td: React.CSSProperties = {
  padding: "10px 8px 10px 0",
  borderBottom: "1px solid var(--border)",
  color: "var(--text-primary)",
  verticalAlign: "middle",
};

export const input: React.CSSProperties = {
  width: "100%",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  padding: "8px 10px",
  fontSize: "13px",
  fontFamily: "inherit",
  background: "var(--bg-primary)",
  color: "var(--text-primary)",
  outline: "none",
};

export const label: React.CSSProperties = {
  fontSize: "12px",
  color: "var(--text-secondary)",
  display: "block",
  marginBottom: "5px",
};

export const btnPrimary: React.CSSProperties = {
  background: "var(--blue)",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  padding: "9px 16px",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
};

export const btnSecondary: React.CSSProperties = {
  background: "var(--bg-tertiary)",
  color: "var(--text-secondary)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  padding: "9px 16px",
  fontSize: "13px",
  cursor: "pointer",
  fontFamily: "inherit",
};

export const btnDanger: React.CSSProperties = {
  background: "#FCEBEB",
  color: "#791F1F",
  border: "none",
  borderRadius: "6px",
  padding: "4px 9px",
  fontSize: "11px",
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
};

export const alertWarning: React.CSSProperties = {
  background: "var(--bg-tertiary)",
  border: "1px solid var(--amber)",
  borderRadius: "8px",
  padding: "9px 12px",
  fontSize: "12px",
  color: "var(--amber)",
  marginBottom: "12px",
  display: "flex",
  alignItems: "center",
  gap: "7px",
};

export const modal: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 999,
};

export const modalBox: React.CSSProperties = {
  background: "var(--bg-primary)",
  borderRadius: "12px",
  padding: "28px 32px",
  width: "480px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
  border: "1px solid var(--border)",
};
