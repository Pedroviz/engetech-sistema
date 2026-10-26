"use client";
// app/(dashboard)/dashboard/DashboardClient.tsx
// UI do dashboard. Recebe os dados já prontos do servidor (page.tsx).

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import styles from "./dashboard.module.css";
import {
  ORCAMENTO_COR,
  ORCAMENTO_LABEL,
  STATUS_COR,
  STATUS_LABEL,
  STATUS_OBRA,
  STATUS_TINT,
  type StatusObra,
  type StatusOrcamento,
} from "@/lib/dashboard/status";
import type { AcessosData, DashboardData, ObraResumo, OrcamentoResumo, UsuarioAcesso } from "@/lib/dashboard/queries";

const COR_ORCADO = "#6d98ea";
const COR_REALIZADO = "#e26a6a";
const COR_ENTRADA = "#2fae74";
const COR_SAIDA = "#e26a6a";
const COR_GASTOS = ["#6d98ea", "#2fae74", "#d9a33c"];
const EIXO = { fill: "#8b93a5", fontSize: 12 };
const TOOLTIP_ESTILO = {
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(16,20,28,0.92)",
  color: "#f2f4f8",
};

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

/* ── Animação ──────────────────────────────────────────── */

// Número que sobe de 0 até o valor final. Respeita prefers-reduced-motion.
function useCountUp(alvo: number, dur = 1100) {
  const [valor, setValor] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValor(alvo);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const frame = (t: number) => {
      const k = Math.min(1, (t - t0) / dur);
      setValor(alvo * (1 - Math.pow(1 - k, 4)));
      if (k < 1) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [alvo, dur]);
  return valor;
}

/* ── Componente principal ───────────────────────────────── */

export default function DashboardClient({
  dados,
  nomeUsuario,
  acessos,
  meuId,
}: {
  dados: DashboardData;
  nomeUsuario: string;
  acessos: AcessosData | null;
  meuId: string;
}) {
  const [saudacao, setSaudacao] = useState("");
  useEffect(() => {
    const h = new Date().getHours();
    setSaudacao(h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite");
  }, []);

  const { kpis, obras, serie, gastosPorTipo, statusContagem, pipeline, orcamentosRecentes } = dados;
  const primeiroNome = nomeUsuario.split(" ")[0];

  // Dados dos gráficos
  const barrasObras = obras.map((o) => ({
    nome: o.nome,
    orcado: o.orcado,
    realizado: o.gasto,
  }));
  const fluxo = serie.slice(-6).map((p) => ({ mes: p.rotulo, entradas: p.entradas, saidas: p.saidas }));
  const fluxoVazio = fluxo.every((p) => p.entradas === 0 && p.saidas === 0);
  const donut = [
    { name: "Materiais", value: gastosPorTipo.materiais },
    { name: "Mão de obra", value: gastosPorTipo.maoDeObra },
    { name: "Esporádicos", value: gastosPorTipo.esporadicos },
  ];
  const totalGastos = donut.reduce((a, d) => a + d.value, 0);
  const totalPipeline = pipeline.reduce((a, p) => a + p.quantidade, 0);
  const maxPipeline = Math.max(1, ...pipeline.map((p) => p.quantidade));

  // Contadores animados
  const ativas = useCountUp(kpis.obrasAtivas, 800);
  const receita = useCountUp(kpis.receitaContratada);
  const gasto = useCountUp(kpis.totalGasto, 1300);
  const margem = useCountUp(kpis.margemMedia, 900);

  return (
    <div className={styles.stage}>
      <div className={styles.orbs} aria-hidden="true">
        <i className={styles.orb1} />
        <i className={styles.orb2} />
        <i className={styles.orb3} />
      </div>

      <div className={styles.content}>
        <header className={`${styles.head} ${styles.rise}`} style={{ ["--d" as string]: 0 }}>
          <p className={styles.saudacao}>
            {saudacao ? `${saudacao}, ${primeiroNome}` : `Olá, ${primeiroNome}`}
          </p>
          <h1 className={styles.titulo}>
            Visão geral <strong>das obras</strong>
          </h1>
        </header>

        {/* KPIs */}
        <section className={styles.kpis}>
          <Kpi
            d={1}
            icone={<IconObra />}
            valor={
              <>
                {Math.round(ativas)}
                <span className={styles.kpiSufixo}> ativas</span>
              </>
            }
            label={`De ${kpis.obrasTotal} cadastradas`}
          />
          <Kpi d={2} icone={<IconCarteira />} valor={brl(Math.round(receita))} label="Total contratos" />
          <Kpi d={3} icone={<IconGasto />} valor={brl(Math.round(gasto))} label="Todas as obras" />
          <Kpi
            d={4}
            icone={<IconPorcentagem />}
            valor={`${Math.round(margem)}%`}
            label={`Margem média · Conversão: ${kpis.conversao}%`}
          />
        </section>

        {/* Orçado vs realizado e distribuição de gastos */}
        <section className={styles.grid}>
          <Bloco d={5} titulo="Orçado vs realizado por obra" span={2}>
            {obras.length === 0 ? (
              <Vazio texto="Nenhuma obra cadastrada." />
            ) : (
              <div className={styles.chartBox}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barrasObras} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="rgba(127,127,127,0.18)" strokeDasharray="3 5" />
                    <XAxis
                      dataKey="nome"
                      tickLine={false}
                      axisLine={false}
                      tick={EIXO}
                      tickFormatter={(v: string) => (v.length > 16 ? `${v.slice(0, 15)}…` : v)}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      width={70}
                      tick={EIXO}
                      tickFormatter={(v: number) => `R$ ${Math.round(v / 1000)}k`}
                    />
                    <Tooltip
                      formatter={(v: number, nome: string) => [brl(Math.round(v)), nome]}
                      contentStyle={TOOLTIP_ESTILO}
                      labelStyle={{ color: "#8b93a5" }}
                      cursor={{ fill: "rgba(127,127,127,0.08)" }}
                    />
                    <Legend iconType="square" wrapperStyle={{ fontSize: 13 }} />
                    <Bar dataKey="orcado" name="Orçado" fill={COR_ORCADO} radius={[6, 6, 0, 0]} animationDuration={1200} />
                    <Bar dataKey="realizado" name="Realizado" fill={COR_REALIZADO} radius={[6, 6, 0, 0]} animationDuration={1200} animationBegin={200} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Bloco>

          <Bloco d={6} titulo="Distribuição de gastos" span={1} glow="rgba(127,227,224,0.22)">
            {totalGastos === 0 ? (
              <Vazio texto="Sem gastos registrados." />
            ) : (
              <>
                <div className={styles.donutBox}>
                  <ResponsiveContainer width="100%" height={230}>
                    <PieChart>
                      <Pie
                        data={donut}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={68}
                        outerRadius={96}
                        paddingAngle={3}
                        stroke="none"
                        animationDuration={1200}
                      >
                        {donut.map((_, i) => (
                          <Cell key={i} fill={COR_GASTOS[i]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number, nome: string) => [brl(Math.round(v)), nome]} contentStyle={TOOLTIP_ESTILO} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className={styles.donutCentro}>
                    <span className={styles.donutTotal}>{brl(totalGastos)}</span>
                    <span className={styles.donutRotulo}>total</span>
                  </div>
                </div>
                <ul className={styles.legendaLista}>
                  {donut.map((d, i) => (
                    <li key={d.name}>
                      <span><i className={styles.dot} style={{ background: COR_GASTOS[i] }} />{d.name}</span>
                      <b>{brl(Math.round(d.value))}</b>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Bloco>
        </section>

        {/* Fluxo de caixa e pipeline de orçamentos */}
        <section className={styles.grid}>
          <Bloco d={7} titulo="Fluxo de caixa · últimos 6 meses" span={2}>
            {fluxoVazio ? (
              <Vazio texto="Sem lançamentos nos últimos 6 meses." />
            ) : (
              <>
                <div className={styles.chartBox}>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={fluxo} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke="rgba(127,127,127,0.18)" strokeDasharray="3 5" />
                      <XAxis dataKey="mes" tickLine={false} axisLine={false} tick={EIXO} />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        width={70}
                        tick={EIXO}
                        tickFormatter={(v: number) => `R$ ${Math.round(v / 1000)}k`}
                      />
                      <Tooltip
                        formatter={(v: number, nome: string) => [brl(Math.round(v)), nome]}
                        contentStyle={TOOLTIP_ESTILO}
                        labelStyle={{ color: "#8b93a5" }}
                        cursor={{ fill: "rgba(127,127,127,0.08)" }}
                      />
                      <Legend iconType="square" wrapperStyle={{ fontSize: 13 }} />
                      <Bar dataKey="entradas" name="Entradas" fill={COR_ENTRADA} radius={[6, 6, 0, 0]} animationDuration={1200} />
                      <Bar dataKey="saidas" name="Saídas" fill={COR_SAIDA} radius={[6, 6, 0, 0]} animationDuration={1200} animationBegin={200} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className={styles.rodape}>
                  <span>Caixa do mês (entradas − saídas)</span>
                  <b className={kpis.caixaMes < 0 ? styles.negativo : ""}>{brl(kpis.caixaMes)}</b>
                </div>
              </>
            )}
          </Bloco>

          <Bloco d={8} titulo="Pipeline de orçamentos" span={1} glow="rgba(143,180,255,0.2)">
            {totalPipeline === 0 ? (
              <Vazio texto="Nenhum orçamento cadastrado." />
            ) : (
              <>
                <div className={styles.pipeLista}>
                  {pipeline.map((p) => (
                    <div key={p.status} className={styles.pipeRow}>
                      <span className={styles.pipeNome}>{ORCAMENTO_LABEL[p.status as StatusOrcamento]}</span>
                      <div className={styles.track}>
                        <span
                          className={styles.fill}
                          style={{ width: `${(p.quantidade / maxPipeline) * 100}%`, background: ORCAMENTO_COR[p.status as StatusOrcamento] }}
                        />
                      </div>
                      <span className={styles.num}>{p.quantidade}</span>
                      <span className={styles.pipeValor}>{brl(Math.round(p.valor))}</span>
                    </div>
                  ))}
                </div>
                {orcamentosRecentes.length > 0 && (
                  <div className={styles.recentes}>
                    <span className={styles.recentesTitulo}>Últimos orçamentos</span>
                    {orcamentosRecentes.map((o) => (
                      <OrcamentoLinha key={o.id} orcamento={o} />
                    ))}
                  </div>
                )}
              </>
            )}
          </Bloco>
        </section>

        {/* Situação das obras e pagamentos pendentes */}
        <section className={styles.grid}>
          <Bloco d={9} titulo="Situação das obras" span={1}>
            <div className={styles.statusLista}>
              {STATUS_OBRA.map((s, i) => {
                const n = statusContagem[s] ?? 0;
                const pct = kpis.obrasTotal ? Math.round((n / kpis.obrasTotal) * 100) : 0;
                return (
                  <div key={s} className={styles.srow}>
                    <span>{STATUS_LABEL[s]}</span>
                    <div className={styles.track}>
                      <span
                        className={styles.fill}
                        style={{ width: `${pct}%`, background: STATUS_COR[s], animationDelay: `${0.5 + i * 0.12}s` }}
                      />
                    </div>
                    <span className={styles.num}>{n}</span>
                  </div>
                );
              })}
            </div>
          </Bloco>

          <Bloco d={10} titulo="Pagamentos pendentes" span={1}>
            <div className={styles.pendente}>
              <span className={styles.pendenteValor}>{brl(kpis.pagamentosPendentes)}</span>
              <span className={styles.pendenteLabel}>a pagar em diárias de obra</span>
            </div>
          </Bloco>
        </section>

        {/* Acessos de usuários (só admin) */}
        {acessos && (
          <section>
            <BlocoAcessos acessos={acessos} meuId={meuId} d={11} />
          </section>
        )}

        {/* Obras */}
        <section>
          <div className={`${styles.obrasHead} ${styles.rise}`} style={{ ["--d" as string]: 11 }}>
            <h2 className={styles.obrasTitulo}>Suas obras</h2>
            <span className={styles.meta}>Acumulado</span>
          </div>

          {obras.length === 0 ? (
            <div className={`${styles.glass} ${styles.vazioCard} ${styles.rise}`} style={{ ["--d" as string]: 12 }}>
              <p>Nenhuma obra cadastrada ainda.</p>
              <Link href="/obras" className={styles.vazioLink}>
                Cadastrar a primeira obra
              </Link>
            </div>
          ) : (
            <div className={styles.cards}>
              {obras.map((o, i) => (
                <ObraCard key={o.id} obra={o} d={12 + i} />
              ))}
            </div>
          )}
        </section>

        <p className={`${styles.rodapeExtra} ${styles.rise}`} style={{ ["--d" as string]: 16 }}>
          Gasto realizado = materiais utilizados + pagamentos de diárias + gastos esporádicos.
        </p>
      </div>
    </div>
  );
}

/* ── Subcomponentes ─────────────────────────────────────── */

function Bloco({
  d,
  titulo,
  span,
  glow,
  children,
}: {
  d: number;
  titulo: string;
  span: 1 | 2;
  glow?: string;
  children: ReactNode;
}) {
  return (
    <article
      className={`${styles.glass} ${styles.card} ${styles.rise} ${span === 2 ? styles.spanDois : ""}`}
      style={{ ["--d" as string]: d, ...(glow ? { ["--glow" as string]: glow } : {}) }}
    >
      <div className={styles.cardHead}>
        <h2 className={styles.cardTitulo}>{titulo}</h2>
      </div>
      {children}
    </article>
  );
}

function Vazio({ texto }: { texto: string }) {
  return <p className={styles.vazioInline}>{texto}</p>;
}

function Kpi({
  d,
  icone,
  valor,
  label,
}: {
  d: number;
  icone: ReactNode;
  valor: ReactNode;
  label: string;
}) {
  return (
    <div className={`${styles.glass} ${styles.kpi} ${styles.rise}`} style={{ ["--d" as string]: d }}>
      <div className={styles.kpiIco}>{icone}</div>
      <div className={styles.kpiCorpo}>
        <div className={styles.kpiValor}>{valor}</div>
        <div className={styles.kpiLabel}>{label}</div>
      </div>
    </div>
  );
}

function OrcamentoLinha({ orcamento }: { orcamento: OrcamentoResumo }) {
  const status = orcamento.status as StatusOrcamento;
  return (
    <div className={styles.recenteLinha}>
      <div>
        <b>{orcamento.numero}</b>
        <span className={styles.recenteCliente}> · {orcamento.cliente}</span>
      </div>
      <div className={styles.recenteDireita}>
        <span className={styles.recenteValor}>{brl(orcamento.valor)}</span>
        <span className={styles.tagSuave} style={{ color: ORCAMENTO_COR[status] }}>
          {ORCAMENTO_LABEL[status] ?? orcamento.status}
        </span>
      </div>
    </div>
  );
}

function ObraCard({ obra, d }: { obra: ObraResumo; d: number }) {
  const status = obra.status as StatusObra;
  const tint = STATUS_TINT[status] ?? "#6d98ea";
  const label = STATUS_LABEL[status] ?? obra.status;
  return (
    <Link
      href={`/obras/${obra.id}/cronograma`}
      className={`${styles.glass} ${styles.ocard} ${styles.rise}`}
      style={{ ["--tint" as string]: tint, ["--glow" as string]: tint, ["--d" as string]: d }}
    >
      <div className={styles.ocardTop}>
        <span className={styles.tag}>{label}</span>
      </div>
      <div>
        <h3 className={styles.ocardNome}>{obra.nome}</h3>
        <div className={styles.ocardSub}>
          {obra.cliente}
          {obra.local ? ` · ${obra.local}` : ""}
        </div>
      </div>
      <div className={styles.ocardFoot}>
        <div className={styles.pctLinha}>
          <span>Andamento</span>
          <b>{obra.progresso}%</b>
        </div>
        <div className={styles.trackOnTint}>
          <span
            className={styles.fillOnTint}
            style={{ width: `${obra.progresso}%`, animationDelay: `${0.8 + (d - 12) * 0.1}s` }}
          />
        </div>
        <div className={styles.money}>
          {brl(obra.gasto)}
          <small>de {brl(obra.contrato)} de contrato</small>
        </div>
      </div>
    </Link>
  );
}

/* ── Ícones ─────────────────────────────────────────────── */

const svgProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};
function IconObra() {
  return (<svg {...svgProps}><path d="M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /></svg>);
}
function IconCarteira() {
  return (<svg {...svgProps}><rect x="3" y="6" width="18" height="13" rx="3" /><path d="M3 10h18M16 14.5h2" /></svg>);
}
function IconGasto() {
  return (<svg {...svgProps}><path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14" /></svg>);
}
function IconPorcentagem() {
  return (<svg {...svgProps}><path d="M19 5 5 19" /><circle cx="6.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /></svg>);
}

/* ── Acessos de usuários ───────────────────────────────── */

function BlocoAcessos({ acessos, meuId, d }: { acessos: AcessosData; meuId: string; d: number }) {
  const [recentes, setRecentes] = useState<UsuarioAcesso[]>(acessos.recentes);
  const [contagem, setContagem] = useState({ total: acessos.total, admins: acessos.admins, usuarios: acessos.usuarios });
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function alterarPerfil(u: UsuarioAcesso) {
    const novo = u.role === "admin" ? "user" : "admin";
    setOcupado(u.id);
    setErro(null);
    try {
      const res = await fetch(`/api/admin/usuarios/${u.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: novo }),
      });
      if (!res.ok) throw new Error();
      setRecentes((rs) => rs.map((x) => (x.id === u.id ? { ...x, role: novo } : x)));
      setContagem((c) => ({
        ...c,
        admins: c.admins + (novo === "admin" ? 1 : -1),
        usuarios: c.usuarios + (novo === "admin" ? -1 : 1),
      }));
    } catch {
      setErro("Não foi possível alterar o perfil. Tente de novo.");
    } finally {
      setOcupado(null);
    }
  }

  return (
    <article
      className={`${styles.glass} ${styles.card} ${styles.rise}`}
      style={{ ["--d" as string]: d, ["--glow" as string]: "rgba(214,160,255,0.18)" }}
    >
      <div className={styles.cardHead}>
        <h2 className={styles.cardTitulo}>Acessos de usuários</h2>
        <Link href="/admin/usuarios" className={styles.linkSuave}>
          Gerenciar todos →
        </Link>
      </div>

      <div className={styles.acessoStats}>
        <div>
          <b>{contagem.total}</b>
          <span>Total</span>
        </div>
        <div>
          <b>{contagem.usuarios}</b>
          <span>Usuários</span>
        </div>
        <div>
          <b>{contagem.admins}</b>
          <span>Admins</span>
        </div>
      </div>

      {erro && <p className={styles.erroInline}>{erro}</p>}

      <div className={styles.acessoLista}>
        {recentes.map((u) => {
          const eAdmin = u.role === "admin";
          const eVoce = u.id === meuId;
          return (
            <div key={u.id} className={styles.acessoLinha}>
              <div className={styles.acessoAvatar} data-admin={eAdmin}>
                {u.nome.charAt(0).toUpperCase()}
              </div>
              <div className={styles.acessoTexto}>
                <b>
                  {u.nome}
                  {eVoce && <span className={styles.voce}> (você)</span>}
                </b>
                <span>
                  {u.email}
                  {u.empresa ? ` · ${u.empresa}` : ""}
                </span>
              </div>
              <span className={styles.acessoBadge} data-admin={eAdmin}>
                {eAdmin ? "Admin" : "Usuário"}
              </span>
              <button
                type="button"
                className={styles.acessoBtn}
                onClick={() => alterarPerfil(u)}
                disabled={eVoce || ocupado === u.id}
                title={eVoce ? "Você não pode alterar o próprio acesso" : eAdmin ? "Remover admin" : "Tornar admin"}
              >
                {ocupado === u.id ? "…" : eAdmin ? "Remover admin" : "Tornar admin"}
              </button>
            </div>
          );
        })}
      </div>
    </article>
  );
}
