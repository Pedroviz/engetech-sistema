import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { hashPassword, generateToken } from "@/lib/auth";
import { z } from "zod";

const prisma = new PrismaClient();

const cadastroSchema = z.object({
  nome: z.string().min(2, "Nome muito curto"),
  empresa: z.string().min(2, "Nome da empresa muito curto"),
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = cadastroSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 },
      );
    }

    const { nome, empresa, email, senha } = result.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Este e-mail já está cadastrado" },
        { status: 409 },
      );
    }

    const hashedPassword = await hashPassword(senha);

    const user = await prisma.user.create({
      data: {
        name: nome,
        email,
        password: hashedPassword,
        empresa,
        role: "user",
      },
    });

    const token = generateToken(user.id, user.email, user.role);

    const response = NextResponse.json({ ok: true });
    response.cookies.set("engetech-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[POST /api/auth/cadastro]", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
