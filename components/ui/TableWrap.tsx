"use client";

import type { ReactNode } from "react";

/**
 * Wrapper responsivo para tabelas.
 * No mobile: scroll horizontal com fade visual nas bordas.
 * No desktop: sem alteração.
 */
export function TableWrap({ children }: { children: ReactNode }) {
  return (
    <div
      className="table-wrap"
      style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" as any }}
    >
      {children}
    </div>
  );
}
