import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, verifyPassword, hashPassword } from "@/lib/auth";
import { z } from "zod";

const senhaSchema = z.object({
  senhaAtual: z.string().min(1, "Senha atual obrigatória"),
  novaSenha: z
    .string()
    .min(6, "Nova senha deve ter ao menos 6 caracteres")
    .max(72, "Senha muito longa"),
});

export async function PUT(request: NextRequest) {
  try {
    // Autenticação via cookie
    const token = request.cookies.get("engetech-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    // Validação do body
    const body = await request.json();
    const result = senhaSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 },
      );
    }

    const { senhaAtual, novaSenha } = result.data;

    // Busca usuário com senha (select explícito para incluir password)
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, password: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 },
      );
    }

    // Verifica senha atual
    const senhaValida = await verifyPassword(senhaAtual, user.password);
    if (!senhaValida) {
      return NextResponse.json(
        { error: "Senha atual incorreta" },
        { status: 400 },
      );
    }

    // Impede reutilizar a mesma senha
    const mesmaSenha = await verifyPassword(novaSenha, user.password);
    if (mesmaSenha) {
      return NextResponse.json(
        { error: "A nova senha não pode ser igual à atual" },
        { status: 400 },
      );
    }

    // Salva nova senha com hash
    const hash = await hashPassword(novaSenha);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hash },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[PUT /api/auth/senha]", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
