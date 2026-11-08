"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  PieChart,
  ShieldAlert,
} from "lucide-react";
import * as S from "@/lib/styles";

interface DREData {
  obra: {
    centroCusto: string;
    cliente: string;
    status: string;
  };
  dre: {
    receitaContrato: number;
    orcamento: { material: number; maoDeObra: number; total: number };
    realizado: {
      material: number;
      maoDeObra: number;
      esporadicos: number;
      total: number;
    };
    resultado: { lucroBruto: number; margemPercentual: number };
    detalhes: {
      materiais: Array<{
        id: string;
        nome: string;
        orcado: number;
        utilizado: number;
      }>;
      gastos: Array<{
        id: string;
        descricao: string;
        valor: number;
        data: string;
      }>;
      pagamentos: Array<{
        id: string;
        diarista?: { nome: string };
        total: number;
        status: string;
      }>;
    };
  };
}

function formatMoney(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ObraDREPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [data, setData] = useState<DREData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/obras/${resolvedParams.id}/dre`)
      .then((res) => (res.ok ? res.json() : Promise.reject("Erro ao carregar")))
      .then((json) => setData(json))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [resolvedParams.id]);

  if (loading)
    return (
      <div style={{ color: "var(--text-muted)", padding: "20px" }}>
        A calcular DRE da obra...
      </div>
    );
  if (!data)
    return (
      <div style={{ color: "var(--red)", padding: "20px" }}>
        Não foi possível carregar os dados financeiros.
      </div>
    );

  const { dre, obra } = data;
  const estouroOrcamento = dre.realizado.total > dre.orcamento.total;

  return (
    <div style={{ paddingBottom: "40px" }}>
      {/* Cabeçalho */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
        }}
      >
        <button
          onClick={() => router.push("/obras")}
          style={{
            ...S.btnSecondary,
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <ArrowLeft size={16} /> Voltar para Obras
        </button>
        <div style={{ textAlign: "right" }}>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            DRE Gerencial · {obra.centroCusto}
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            Cliente: {obra.cliente}
          </p>
        </div>
      </div>

      {/* Alerta de Estouro de Orçamento */}
      {estouroOrcamento && (
        <div
          style={{
            background: "#FCEBEB",
            border: "1px solid #F5C6CB",
            color: "#791F1F",
            padding: "12px 16px",
            borderRadius: "10px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "13px",
            fontWeight: 500,
          }}
        >
          <ShieldAlert size={20} />
          Atenção: Os custos realizados ({formatMoney(dre.realizado.total)})
          ultrapassaram o orçamento total previsto (
          {formatMoney(dre.orcamento.total)}).
        </div>
      )}

      {/* Cards de KPIs Principais */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div style={S.card}>
          <span
            style={{
              fontSize: "12px",
              color: "var(--text-secondary)",
              textTransform: "uppercase",
            }}
          >
            Valor do Contrato
          </span>
          <div
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "var(--blue)",
              marginTop: "6px",
            }}
          >
            {formatMoney(dre.receitaContrato)}
          </div>
        </div>

        <div style={S.card}>
          <span
            style={{
              fontSize: "12px",
              color: "var(--text-secondary)",
              textTransform: "uppercase",
            }}
          >
            Custo Total Realizado
          </span>
          <div
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "var(--red)",
              marginTop: "6px",
            }}
          >
            {formatMoney(dre.realizado.total)}
          </div>
        </div>

        <div style={S.card}>
          <span
            style={{
              fontSize: "12px",
              color: "var(--text-secondary)",
              textTransform: "uppercase",
            }}
          >
            Lucro Bruto Estimado
          </span>
          <div
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color:
                dre.resultado.lucroBruto >= 0 ? "var(--green)" : "var(--red)",
              marginTop: "6px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {dre.resultado.lucroBruto >= 0 ? (
              <TrendingUp size={20} />
            ) : (
              <TrendingDown size={20} />
            )}
            {formatMoney(dre.resultado.lucroBruto)}
          </div>
        </div>

        <div style={S.card}>
          <span
            style={{
              fontSize: "12px",
              color: "var(--text-secondary)",
              textTransform: "uppercase",
            }}
          >
            Margem Real
          </span>
          <div
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color:
                dre.resultado.margemPercentual >= 25
                  ? "var(--green)"
                  : "var(--amber)",
              marginTop: "6px",
            }}
          >
            {dre.resultado.margemPercentual}%
          </div>
        </div>
      </div>

      {/* Tabela Comparativa Orçado vs Realizado */}
      <div style={{ ...S.card, marginBottom: "24px" }}>
        <h3
          style={{
            ...S.cardTitle,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <PieChart size={18} /> Demonstração de Resultados (Orçado vs.
          Realizado)
        </h3>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>Categoria</th>
              <th style={S.th}>Orçado</th>
              <th style={S.th}>Realizado</th>
              <th style={S.th}>Desvio / Saldo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ ...S.td, fontWeight: 600 }}>Materiais</td>
              <td style={S.td}>{formatMoney(dre.orcamento.material)}</td>
              <td style={{ ...S.td, color: "var(--red)" }}>
                {formatMoney(dre.realizado.material)}
              </td>
              <td
                style={{
                  ...S.td,
                  fontWeight: 600,
                  color:
                    dre.orcamento.material - dre.realizado.material >= 0
                      ? "var(--green)"
                      : "var(--red)",
                }}
              >
                {formatMoney(dre.orcamento.material - dre.realizado.material)}
              </td>
            </tr>
            <tr>
              <td style={{ ...S.td, fontWeight: 600 }}>
                Mão de Obra (Equipe + Diaristas)
              </td>
              <td style={S.td}>{formatMoney(dre.orcamento.maoDeObra)}</td>
              <td style={{ ...S.td, color: "var(--red)" }}>
                {formatMoney(dre.realizado.maoDeObra)}
              </td>
              <td
                style={{
                  ...S.td,
                  fontWeight: 600,
                  color:
                    dre.orcamento.maoDeObra - dre.realizado.maoDeObra >= 0
                      ? "var(--green)"
                      : "var(--red)",
                }}
              >
                {formatMoney(dre.orcamento.maoDeObra - dre.realizado.maoDeObra)}
              </td>
            </tr>
            <tr>
              <td style={{ ...S.td, fontWeight: 600 }}>
                Gastos Esporádicos / Operacionais
              </td>
              <td style={S.td}>R$ 0,00</td>
              <td style={{ ...S.td, color: "var(--red)" }}>
                {formatMoney(dre.realizado.esporadicos)}
              </td>
              <td style={{ ...S.td, color: "var(--text-muted)" }}>-</td>
            </tr>
            <tr style={{ borderTop: "2px solid var(--border)" }}>
              <td style={{ ...S.td, fontWeight: 700 }}>TOTAL</td>
              <td style={{ ...S.td, fontWeight: 700 }}>
                {formatMoney(dre.orcamento.total)}
              </td>
              <td style={{ ...S.td, fontWeight: 700, color: "var(--red)" }}>
                {formatMoney(dre.realizado.total)}
              </td>
              <td
                style={{
                  ...S.td,
                  fontWeight: 700,
                  color:
                    dre.orcamento.total - dre.realizado.total >= 0
                      ? "var(--green)"
                      : "var(--red)",
                }}
              >
                {formatMoney(dre.orcamento.total - dre.realizado.total)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
