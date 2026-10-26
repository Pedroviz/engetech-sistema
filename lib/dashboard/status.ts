// lib/dashboard/status.ts
// Fonte única dos status de obra. A validação da API (lib/schemas.ts) e o dashboard usam esta lista.

export const STATUS_OBRA = ["andamento", "execucao", "finalizada", "pausada"] as const;
export type StatusObra = (typeof STATUS_OBRA)[number];

// Obras que contam como "ativas" no dashboard
export const STATUS_ATIVAS: readonly StatusObra[] = ["andamento", "execucao"];

export const STATUS_LABEL: Record<StatusObra, string> = {
  andamento: "Em andamento",
  execucao: "Em execução",
  finalizada: "Finalizada",
  pausada: "Pausada",
};

// Cor da barra de situação (um ponto de cor por status)
export const STATUS_COR: Record<StatusObra, string> = {
  andamento: "#6d98ea",
  execucao: "#2fae74",
  pausada: "#d9a33c",
  finalizada: "#8b93a5",
};

// Tom do card da obra (fundo do card)
export const STATUS_TINT: Record<StatusObra, string> = {
  andamento: "#2f5fb8",
  execucao: "#2f8a66",
  pausada: "#a86f2c",
  finalizada: "#6b4fa8",
};

// Pipeline de orçamentos (Orcamento.status), na ordem do funil
export const ORCAMENTO_STATUS = ["enviado", "negociacao", "aprovado", "recusado", "expirado"] as const;
export type StatusOrcamento = (typeof ORCAMENTO_STATUS)[number];

export const ORCAMENTO_LABEL: Record<StatusOrcamento, string> = {
  enviado: "Enviado",
  negociacao: "Em negociação",
  aprovado: "Aprovado",
  recusado: "Recusado",
  expirado: "Expirado",
};

export const ORCAMENTO_COR: Record<StatusOrcamento, string> = {
  enviado: "#6d98ea",
  negociacao: "#d9a33c",
  aprovado: "#2fae74",
  recusado: "#e26a6a",
  expirado: "#8b93a5",
};
