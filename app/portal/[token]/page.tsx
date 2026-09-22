"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  HardHat,
  CheckCircle2,
  Clock,
  CircleDashed,
  AlertTriangle,
  CalendarDays,
  MapPin,
} from "lucide-react";

interface Subtarefa {
  nome: string;
  status: string;
  percentual: number;
}
interface Etapa {
  nome: string;
  status: string;
  percentual: number;
  inicioPlano: string;
  fimPlano: string;
  subtarefas: Subtarefa[];
}
interface Atividade {
  descricao: string;
  percentual: number;
  status: string;
}
interface DiarioItem {
  data: string;
  clima: string;
  resumo?: string;
  atividades: Atividade[];
}
interface Portal {
  titulo: string;
  cliente: string;
  tipo: string;
  status: string;
  endereco?: string;
  inicio: string;
  previsaoFim: string;
  etapas: Etapa[];
  diario: DiarioItem[];
}

const STATUS_CFG: Record<
  string,
  { label: string; cor: string; bg: string; Icon: React.ElementType }
> = {
  concluido: {
    label: "Concluído",
    cor: "#1D9E75",
    bg: "#EAF3DE",
    Icon: CheckCircle2,
  },
  andamento: {
    label: "Em andamento",
    cor: "#185FA5",
    bg: "#E6F1FB",
    Icon: Clock,
  },
  atraso: {
    label: "Atrasado",
    cor: "#E24B4A",
    bg: "#FCEBEB",
    Icon: AlertTriangle,
  },
  pendente: {
    label: "A iniciar",
    cor: "#888",
    bg: "#F1EFE8",
    Icon: CircleDashed,
  },
};

const CLIMAS: Record<string, string> = {
  ensolarado: "☀️ Ensolarado",
  parcialmente_nublado: "⛅ Parc. nublado",
  nublado: "☁️ Nublado",
  chuvoso: "🌧️ Chuvoso",
  tempestade: "⛈️ Tempestade",
};

export default function PortalPage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<Portal | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);
  const [agora, setAgora] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/portal/${token}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((portal) => {
        setData(portal);
        setAgora(Date.now());
      })
      .catch(() => setErro(true))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <Centro texto="Carregando sua obra..." />;
  if (erro || !data) return <Centro texto="Link inválido ou expirado." />;

  const progressoGeral = data.etapas.length
    ? Math.round(
        data.etapas.reduce((a, e) => a + e.percentual, 0) / data.etapas.length,
      )
    : 0;

  const concluidas = data.etapas.filter((e) => e.status === "concluido").length;
  const diasRestantes =
    agora !== null
      ? Math.ceil((new Date(data.previsaoFim).getTime() - agora) / 86400000)
      : 0;

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f3" }}>
      {/* Cabeçalho */}
      <header
        style={{
          background: "#185FA5",
          color: "#fff",
          padding: "28px 20px 32px",
        }}
      >
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "18px",
              opacity: 0.9,
            }}
          >
            <HardHat size={18} />
            <span style={{ fontSize: "14px", fontWeight: 600 }}>
              Engetech Soluções
            </span>
          </div>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 700,
              marginBottom: "6px",
              lineHeight: 1.3,
            }}
          >
            {data.titulo}
          </h1>
          <p style={{ fontSize: "14px", opacity: 0.85 }}>{data.cliente}</p>
          {data.endereco && (
            <p
              style={{
                fontSize: "13px",
                opacity: 0.75,
                marginTop: "6px",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <MapPin size={13} /> {data.endereco}
            </p>
          )}
        </div>
      </header>

      <main
        style={{ maxWidth: "760px", margin: "0 auto", padding: "0 20px 40px" }}
      >
        {/* Card de progresso */}
        <div style={{ ...card, marginTop: "-20px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: "10px",
            }}
          >
            <span style={{ fontSize: "13px", color: "#666", fontWeight: 500 }}>
              Progresso da obra
            </span>
            <span
              style={{ fontSize: "26px", fontWeight: 700, color: "#185FA5" }}
            >
              {progressoGeral}%
            </span>
          </div>
          <div
            style={{
              background: "#e8e8e6",
              borderRadius: "99px",
              height: "10px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progressoGeral}%`,
                height: "100%",
                background: "linear-gradient(90deg, #185FA5, #378ADD)",
                borderRadius: "99px",
                transition: "width 600ms ease",
              }}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "12px",
              marginTop: "18px",
            }}
          >
            <Mini
              label="Etapas prontas"
              valor={`${concluidas}/${data.etapas.length}`}
            />
            <Mini
              label="Previsão"
              valor={new Date(data.previsaoFim).toLocaleDateString("pt-BR")}
            />
            <Mini
              label={diasRestantes >= 0 ? "Dias restantes" : "Dias de atraso"}
              valor={String(Math.abs(diasRestantes))}
              cor={diasRestantes >= 0 ? "#1D9E75" : "#E24B4A"}
            />
          </div>
        </div>

        {/* Etapas */}
        <h2 style={titulo}>Etapas da obra</h2>
        {data.etapas.length === 0 ? (
          <div
            style={{
              ...card,
              color: "#999",
              fontSize: "14px",
              textAlign: "center",
              padding: "28px",
            }}
          >
            O cronograma será publicado em breve.
          </div>
        ) : (
          data.etapas.map((etapa, i) => {
            const cfg = STATUS_CFG[etapa.status] || STATUS_CFG.pendente;
            const { Icon } = cfg;
            return (
              <div key={i} style={card}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: etapa.percentual > 0 ? "12px" : 0,
                  }}
                >
                  <Icon size={20} color={cfg.cor} style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "15px",
                        fontWeight: 600,
                        color: "#1a1a1a",
                      }}
                    >
                      {etapa.nome}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#888",
                        marginTop: "2px",
                      }}
                    >
                      {new Date(etapa.inicioPlano).toLocaleDateString("pt-BR")}{" "}
                      → {new Date(etapa.fimPlano).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                  <span
                    style={{
                      background: cfg.bg,
                      color: cfg.cor,
                      padding: "3px 10px",
                      borderRadius: "99px",
                      fontSize: "11px",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {cfg.label}
                  </span>
                </div>

                {etapa.percentual > 0 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        background: "#f0f0ee",
                        borderRadius: "99px",
                        height: "6px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${etapa.percentual}%`,
                          height: "100%",
                          background: cfg.cor,
                          borderRadius: "99px",
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: cfg.cor,
                        width: "34px",
                        textAlign: "right",
                      }}
                    >
                      {etapa.percentual}%
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Últimas atualizações */}
        {data.diario.length > 0 && (
          <>
            <h2 style={titulo}>Últimas atualizações</h2>
            {data.diario.map((d, i) => (
              <div key={i} style={card}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "10px",
                  }}
                >
                  <CalendarDays size={16} color="#888" />
                  <span style={{ fontSize: "13px", fontWeight: 600 }}>
                    {new Date(d.data).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                    })}
                  </span>
                  <span style={{ fontSize: "12px", color: "#888" }}>
                    {CLIMAS[d.clima] || d.clima}
                  </span>
                </div>
                {d.atividades.map((a, j) => (
                  <div
                    key={j}
                    style={{
                      fontSize: "13px",
                      color: "#444",
                      padding: "4px 0 4px 26px",
                    }}
                  >
                    • {a.descricao}{" "}
                    {a.percentual > 0 && (
                      <span style={{ color: "#888" }}>({a.percentual}%)</span>
                    )}
                  </div>
                ))}
                {d.resumo && (
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#666",
                      marginTop: "10px",
                      paddingTop: "10px",
                      borderTop: "1px solid #f0f0ee",
                      lineHeight: 1.6,
                    }}
                  >
                    {d.resumo}
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        <p
          style={{
            textAlign: "center",
            fontSize: "12px",
            color: "#aaa",
            marginTop: "28px",
          }}
        >
          Engetech Soluções LTDA · Atualizado automaticamente
        </p>
      </main>
    </div>
  );
}

const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e8e8e6",
  borderRadius: "12px",
  padding: "18px 20px",
  marginBottom: "10px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
};

const titulo: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 600,
  color: "#888",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  margin: "26px 0 12px",
};

function Mini({
  label,
  valor,
  cor,
}: {
  label: string;
  valor: string;
  cor?: string;
}) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "10px 6px",
        background: "#f8f8f6",
        borderRadius: "8px",
      }}
    >
      <div
        style={{
          fontSize: "10px",
          color: "#888",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          marginBottom: "4px",
        }}
      >
        {label}
      </div>
      <div
        style={{ fontSize: "15px", fontWeight: 700, color: cor || "#1a1a1a" }}
      >
        {valor}
      </div>
    </div>
  );
}

function Centro({ texto }: { texto: string }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f5f3",
        color: "#888",
        fontSize: "14px",
      }}
    >
      {texto}
    </div>
  );
}
