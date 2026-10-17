// app/(dashboard)/dashboard/page.tsx
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  // Lê o tenantId do JWT
  const cookieStore = cookies();
  const token = cookieStore.get("engetech-token")?.value ?? "";
  const payload = verifyToken(token);
  const tenantId = payload?.tenantId ?? "";

  // Busca dados reais do DB
  const [obras, usuario] = await Promise.all([
    prisma.obra.findMany({
      where: { tenantId },
      select: {
        id: true,
        nome: true,
        status: true,
        progresso: true,
        valorContrato: true,
        dataInicio: true,
        cliente: { select: { nome: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.usuario.findFirst({
      where: { tenantId },
      select: { nome: true },
    }),
  ]);

  // KPIs
  const obrasAtivas = obras.filter((o) =>
    ["EM_ANDAMENTO", "PLANEJAMENTO"].includes(o.status),
  ).length;

  // Caixa do mês: soma de materiais/transações — ajuste conforme seu schema
  // Por ora deixamos como placeholder até o schema de financeiro estar mapeado
  const caixaMes = null as number | null;

  return (
    <DashboardClient
      obras={obras}
      obrasAtivas={obrasAtivas}
      caixaMes={caixaMes}
      nomeUsuario={usuario?.nome ?? "Usuário"}
    />
  );
}
