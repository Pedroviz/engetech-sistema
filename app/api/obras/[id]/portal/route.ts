import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import crypto from "crypto";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    // 1. Verificação direta de autenticação
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("engetech-token");

    if (!tokenCookie) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const user = await verifyToken(tokenCookie.value);
    if (!user) {
      return NextResponse.json(
        { error: "Token inválido ou expirado." },
        { status: 401 },
      );
    }

    const tenantId = (user as typeof user & { tenantId?: string }).tenantId;
    if (!tenantId) {
      return NextResponse.json(
        { error: "Token sem identificação de empresa." },
        { status: 401 },
      );
    }

    // 2. Resolução assíncrona dos parâmetros (Next.js 15+)
    const { id } = await context.params;

    // 3. Consulta à base de dados
    const obra = await prisma.obra.findFirst({
      where: {
        id,
        tenantId,
      },
    });

    if (!obra) {
      return NextResponse.json(
        { error: "Obra não encontrada." },
        { status: 404 },
      );
    }

    // 4. Geração ou reutilização do token do portal
    let token = obra.portalToken;

    if (!token) {
      token = crypto.randomBytes(16).toString("hex");

      await prisma.obra.update({
        where: { id: obra.id },
        data: {
          portalToken: token,
        },
      });
    }

    // 5. Construção da URL de partilha
    const host = request.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const portalUrl = `${protocol}://${host}/portal/${token}`;

    return NextResponse.json({
      token,
      url: portalUrl,
    });
  } catch (error) {
    console.error("Erro ao gerar token do portal:", error);
    return NextResponse.json(
      { error: "Erro interno ao gerar link de acesso." },
      { status: 500 },
    );
  }
}
