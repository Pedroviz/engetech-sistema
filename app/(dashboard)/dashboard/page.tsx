// app/(dashboard)/dashboard/page.tsx
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("engetech-token")?.value ?? "";
  const payload = verifyToken(token);

  // Seu JWT retorna { userId, email, role } — usamos userId como tenantId
  const tenantId =
    (payload as { tenantId?: string; userId?: string } | null)?.tenantId ??
    (payload as { userId?: string } | null)?.userId ??
    "";

  // Busca obras e usuário em paralelo
  const [obras, usuario] = await Promise.all([
    prisma.obra.findMany({
      where: { tenantId },
      select: {
        id: true,
        centroCusto: true, // nome da obra no seu schema
        status: true,
        contrato: true, // valorContrato → contrato
        inicio: true, // dataInicio → inicio
        cliente: { select: { nome: true } },
        etapas: {
          select: { percentual: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    // Model é User, campo name (não nome)
    prisma.user.findFirst({
      where: { id: tenantId },
      select: { name: true },
    }),
  ]);

  // Calcula progresso médio a partir das etapas (não existe campo progresso)
  const obrasComProgresso = obras.map((o) => {
    const pct =
      o.etapas.length > 0
        ? Math.round(
            o.etapas.reduce(
              (acc: number, e: { percentual: number }) => acc + e.percentual,
              0,
            ) / o.etapas.length,
          )
        : 0;
    return {
      id: o.id,
      nome: o.centroCusto, // usa centroCusto como nome da obra
      status: o.status,
      progresso: pct,
      valorContrato: o.contrato,
      dataInicio: o.inicio,
      cliente: o.cliente,
    };
  });

  // KPIs
  const obrasAtivas = obrasComProgresso.filter((o) =>
    ["EM_ANDAMENTO", "PLANEJAMENTO"].includes(o.status),
  ).length;

  const caixaMes = null as number | null;

  return (
    <DashboardClient
      obras={obrasComProgresso}
      obrasAtivas={obrasAtivas}
      caixaMes={caixaMes}
      nomeUsuario={usuario?.name ?? "Usuário"}
    />
  );
}
