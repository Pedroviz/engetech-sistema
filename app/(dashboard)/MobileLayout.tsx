'use client';
// app/(dashboard)/MobileLayout.tsx
// Bottom-nav shell — wraps todas as páginas mobile
// Uso: adicione <MobileLayout> como layout pai no app/(dashboard)/layout.tsx

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './MobileLayout.module.css';

const NAV_ITEMS = [
  {
    href: '/dashboard',
    label: 'Início',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'}
        stroke={active ? 'none' : 'currentColor'} strokeWidth="2" width="22" height="22">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
      </svg>
    ),
  },
  {
    href: '/obras',
    label: 'Obras',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2}
        width="22" height="22">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M3 9h18M9 21V9"/>
      </svg>
    ),
  },
  { href: '/nova-obra', label: '', icon: () => null, isFab: true },
  {
    href: '/financeiro',
    label: 'Financeiro',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2}
        width="22" height="22">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
      </svg>
    ),
  },
  {
    href: '/perfil',
    label: 'Mais',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2}
        width="22" height="22">
        <circle cx="12" cy="7" r="4"/>
        <path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/>
      </svg>
    ),
  },
];

interface MobileLayoutProps {
  children: React.ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  const pathname = usePathname();

  return (
    <div className={styles.shell}>
      <main className={styles.main}>{children}</main>

      <nav className={styles.bottomNav}>
        {NAV_ITEMS.map((item) => {
          if (item.isFab) {
            return (
              <Link key={item.href} href={item.href} className={styles.fabWrap}>
                <span className={styles.fab} aria-label="Nova obra">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2.5" width="22" height="22">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </span>
              </Link>
            );
          }

          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
            >
              {item.icon(active)}
              {item.label && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
