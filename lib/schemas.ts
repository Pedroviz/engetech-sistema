import { z } from "zod";

export const obraSchema = z.object({
  centroCusto: z.string().min(1, "Centro de custo obrigatório"),
  clienteId: z.string().min(1, "Cliente obrigatório"),
  tipo: z.enum(["residencial", "comercial", "industrial"]),
  status: z.enum(["andamento", "execucao", "finalizada", "pausada"]),
  inicio: z.string().min(1),
  previsaoFim: z.string().min(1),
  contrato: z.number().positive(),
  orcamentoMat: z.number().nonnegative(),
  orcamentoMO: z.number().nonnegative(),
});

export const clienteSchema = z.object({
  nome: z.string().min(1, "Nome obrigatório"),
  segmento: z.enum(["residencial", "comercial", "industrial"]),
  classificacao: z.enum(["novo", "recorrente", "fidelizado"]),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  clienteDesde: z.string().optional(),
  observacoes: z.string().optional(),
});

export const fornecedorSchema = z.object({
  razaoSocial: z.string().min(1),
  cnpj: z.string().min(14),
  categoria: z.enum(["loja", "distribuidor", "representante"]),
  pedidoMinimo: z.number().nonnegative().default(0),
  telefone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  vendedor: z.string().optional(),
  condicaoPagto: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  materiais: z.string().optional(),
});

export const orcamentoSchema = z.object({
  numero: z.string().min(1),
  clienteId: z.string().min(1),
  valor: z.number().positive(),
  status: z.enum(["enviado", "negociacao", "aprovado", "recusado", "expirado"]),
  linkArquivo: z.string().optional(),
  observacoes: z.string().optional(),
});

export const gastoSchema = z.object({
  descricao: z.string().min(1),
  justificativa: z.string().min(1),
  obraId: z.string().min(1),
  valor: z.number().positive(),
  data: z.string().optional(),
});

export const lancamentoSchema = z.object({
  descricao: z.string().min(1),
  obraId: z.string().min(1),
  tipo: z.enum(["entrada", "saida"]),
  categoria: z.enum([
    "recebimento",
    "material",
    "mao_obra",
    "esporadico",
    "outro",
  ]),
  valor: z.number().positive(),
  data: z.string().optional(),
});
