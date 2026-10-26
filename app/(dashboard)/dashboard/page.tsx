// app/(dashboard)/dashboard/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAcessos, getDashboardData } from "@/lib/dashboard/queries";
import DashboardClient from "./DashboardClient";

// Dados por usuário: não cachear entre requisições
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("engetech-token")?.value;
  const payload = token ? verifyToken(token) : null;

  // Token ausente ou inválido: manda para o login em vez de renderizar vazio
  if (!payload?.userId) redirect("/login");

  // Mesmo critério do withAuth: userId é o tenantId
  const tenantId = payload.userId;
  const souAdmin = payload.role === "admin";

  const [dados, usuario, acessos] = await Promise.all([
    getDashboardData(tenantId),
    prisma.user.findUnique({ where: { id: tenantId }, select: { name: true } }),
    souAdmin ? getAcessos() : Promise.resolve(null),
  ]);

  return (
    <DashboardClient
      dados={dados}
      nomeUsuario={usuario?.name ?? "Usuário"}
      acessos={acessos}
      meuId={payload.userId}
    />
  );
}
