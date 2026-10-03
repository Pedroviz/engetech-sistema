"use client";

import { useBreakpoint } from "@/lib/useBreakpoint";
import type { CSSProperties, ReactNode } from "react";

interface GridProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5;
  tabletCols?: 1 | 2 | 3;
  mobileCols?: 1 | 2;
  gap?: number;
  style?: CSSProperties;
}

/**
 * Grid responsivo — adapta colunas por breakpoint automaticamente.
 * Substitui gridTemplateColumns hardcoded em todas as páginas.
 * 
 * Exemplos:
 *   <Grid cols={4} mobileCols={2}>  ← 4 desktop, 2 mobile
 *   <Grid cols={2}>                 ← 2 desktop, 1 mobile (padrão)
 *   <Grid cols={3} tabletCols={2}>  ← 3 desktop, 2 tablet, 1 mobile
 */
export function Grid({
  children, cols = 2, tabletCols, mobileCols = 1, gap = 12, style,
}: GridProps) {
  const { isMobile, isTablet, mounted } = useBreakpoint();

  const activeCols = !mounted
    ? cols
    : isMobile
      ? mobileCols
      : isTablet
        ? (tabletCols ?? (cols <= 2 ? cols : 2))
        : cols;

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${activeCols}, 1fr)`,
      gap: `${gap}px`,
      ...style,
    }}>
      {children}
    </div>
  );
}
