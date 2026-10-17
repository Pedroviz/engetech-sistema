'use client';
// app/(dashboard)/dashboard/DashboardClient.tsx
// Componente client — toda a UI interativa do dashboard

import Link from 'next/link';
import styles from './dashboard.module.css';

/* ── Tipos ───────────────────────────────────────────── */
interface Obra {
  id: string;
  nome: string;
  status: string;
  progresso: number | null;
  valorContrato: number | null;
  dataInicio: Date | string | null;
  cliente: { nome: string } | null;
}

interface Props {
  obras: Obra[];
  obrasAtivas: number;
  caixaMes: number | null;
  nomeUsuario: string;
}

/* ── Helpers ─────────────────────────────────────────── */
function getHoraSaudacao(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function formatCurrency(valor: number | null): string {
  if (valor == null) return '—';
  if (valor >= 1_000_000) return `R$ ${(valor / 1_000_000).toFixed(1)}M`;
  if (valor >= 1_000) return `R$ ${(valor / 1_000).toFixed(0)}K`;
  return `R$ ${valor.toFixed(0)}`;
}

function getInitials(nome: string): string {
  return nome
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

function getProgressColor(pct: number): string {
  if (pct >= 70) return 'linear-gradient(90deg,#17b26a,#06d6a0)';
  if (pct >= 30) return 'linear-gradient(90deg,#1a73e8,#06d6a0)';
  return 'linear-gradient(90deg,#f59e0b,#ef4444)';
}

const STATUS_LABEL: Record<string, string> = {
  EM_ANDAMENTO: 'Em andamento',
  PLANEJAMENTO: 'Planejamento',
  CONCLUIDO:    'Concluída',
  PAUSADO:      'Pausada',
};

/* ── Componente principal ────────────────────────────── */
export default function DashboardClient({ obras, obrasAtivas, caixaMes, nomeUsuario }: Props) {
  const primeiroNome = nomeUsuario.split(' ')[0];
  const iniciais = getInitials(nomeUsuario);

  // Obras atrasadas: progresso < 30 e em andamento (proxy simples)
  const obrasAtrasadas = obras.filter(
    (o) => o.status === 'EM_ANDAMENTO' && (o.progresso ?? 0) < 30
  ).length;
  const pctNoPrazo =
    obrasAtivas > 0 ? Math.round(((obrasAtivas - obrasAtrasadas) / obrasAtivas) * 100) : 100;

  const nivelAlerta =
    pctNoPrazo < 40 ? 'critico' : pctNoPrazo < 70 ? 'alerta' : 'ok';

  return (
    <div className={styles.page}>
      {/* ── Header navy ────────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerRow}>
          <div>
            <p className={styles.greeting}>{getHoraSaudacao()},</p>
            <h1 className={styles.userName}>{primeiroNome}</h1>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.notifBtn} aria-label="Notificações">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {/* badge de notificações: troque o número pelo dado real */}
              <span className={styles.badge}>3</span>
            </button>
            <div className={styles.avatar} aria-label={nomeUsuario}>
              {iniciais}
            </div>
          </div>
        </div>
      </header>

      {/* ── KPI Strip ──────────────────────────────────── */}
      <div className={styles.kpiStrip}>
        <div className={styles.kpiCell}>
          <span className={styles.kpiValue}>{obrasAtivas}</span>
          <span className={styles.kpiLabel}>Obras ativas</span>
        </div>
        <div className={styles.kpiCell}>
          <span className={`${styles.kpiValue} ${styles.kpiGreen}`}>
            {formatCurrency(caixaMes)}
          </span>
          <span className={styles.kpiLabel}>Caixa do mês</span>
        </div>
        <div className={styles.kpiCell}>
          <span className={`${styles.kpiValue} ${obrasAtrasadas > 0 ? styles.kpiRed : ''}`}>
            {obrasAtrasadas}
          </span>
          <span className={styles.kpiLabel}>Vencendo hoje</span>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────── */}
      <div className={styles.body}>

        {/* Indicadores do dia */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Indicadores do dia</h2>
          </div>
          <div className={styles.metricCard}>
            <div
              className={`${styles.metricIcon} ${
                nivelAlerta === 'critico' ? styles.red :
                nivelAlerta === 'alerta'  ? styles.orange : styles.green
              }`}
            >
              {nivelAlerta === 'ok' ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" width="20" height="20">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none"
                  stroke={nivelAlerta === 'critico' ? 'var(--red)' : 'var(--orange)'}
                  strokeWidth="2" width="20" height="20">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              )}
            </div>
            <div>
              <span className={`${styles.metricPct} ${
                nivelAlerta === 'critico' ? styles.red :
                nivelAlerta === 'alerta'  ? styles.orange : styles.green
              }`}>
                {pctNoPrazo}%
              </span>
              <p className={styles.metricLabel}>
                No prazo ·{' '}
                <strong style={{
                  color: nivelAlerta === 'critico' ? 'var(--red)' :
                         nivelAlerta === 'alerta'  ? 'var(--orange)' : 'var(--green)'
                }}>
                  {nivelAlerta === 'critico' ? 'Crítico' :
                   nivelAlerta === 'alerta'  ? 'Atenção' : 'Normal'}
                </strong>
              </p>
              <p className={styles.metricSub}>
                {obrasAtrasadas} de {obrasAtivas} obras atrasadas
              </p>
            </div>
          </div>
        </section>

        {/* Carrossel de obras */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <div>
              <h2 className={styles.sectionTitle}>Suas obras</h2>
              <small className={styles.sectionSub}>{obrasAtivas} em andamento</small>
            </div>
            <Link href="/obras" className={styles.seeAll}>
              Ver todas
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </Link>
          </div>

          <div className={styles.obrasScroll}>
            {obras.slice(0, 6).map((obra) => {
              const pct = obra.progresso ?? 0;
              const abbr = obra.nome
                .split(' ')
                .slice(0, 2)
                .map((w) => w[0])
                .join('')
                .toUpperCase();

              return (
                <Link key={obra.id} href={`/obras/${obra.id}`} className={styles.obraCard}>
                  <div className={styles.obraCardBg} />
                  <div className={styles.obraCardContent}>
                    <div className={styles.obraCardIcon}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"
                        width="24" height="24">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <path d="M3 9h18M9 21V9"/>
                      </svg>
                    </div>
                    <span className={styles.obraAbbr}>{abbr}</span>
                    <h3 className={styles.obraCardName}>{obra.nome}</h3>
                    <p className={styles.obraCardClient}>{obra.cliente?.nome ?? '—'}</p>
                    <p className={styles.obraPct}>{pct}%</p>
                    <p className={styles.obraValue}>{formatCurrency(obra.valorContrato)}</p>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{
                          width: `${pct}%`,
                          background: getProgressColor(pct),
                        }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}

            {obras.length === 0 && (
              <div className={styles.emptyState}>
                <p>Nenhuma obra cadastrada ainda.</p>
                <Link href="/nova-obra" className={styles.emptyLink}>Criar primeira obra</Link>
              </div>
            )}
          </div>
        </section>

        {/* Atalhos */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Atalhos</h2>
          </div>
          <div className={styles.atalhos}>
            <Link href="/nova-obra" className={styles.atalhoBtn}>
              <span className={styles.atalhoIcon} style={{ background: 'var(--accent-dim)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"
                  width="20" height="20">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </span>
              <span className={styles.atalhoLabel}>Nova obra</span>
            </Link>

            <Link href="/financeiro" className={styles.atalhoBtn}>
              <span className={styles.atalhoIcon} style={{ background: 'var(--green-dim)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2"
                  width="20" height="20">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                </svg>
              </span>
              <span className={styles.atalhoLabel}>Financeiro</span>
            </Link>

            <Link href="/diario" className={styles.atalhoBtn}>
              <span className={styles.atalhoIcon} style={{ background: 'var(--purple-dim)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="2"
                  width="20" height="20">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </span>
              <span className={styles.atalhoLabel}>Diário</span>
            </Link>

            <Link href="/cronograma" className={styles.atalhoBtn}>
              <span className={styles.atalhoIcon} style={{ background: 'var(--orange-dim)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2"
                  width="20" height="20">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </span>
              <span className={styles.atalhoLabel}>Cronograma</span>
            </Link>
          </div>
        </section>

      </div>{/* /body */}
    </div>
  );
}
