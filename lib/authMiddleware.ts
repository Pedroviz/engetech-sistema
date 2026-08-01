import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

type Handler = (req: NextRequest, userId: string) => Promise<NextResponse>;

export async function withAuth(
  request: NextRequest,
  handler: Handler,
): Promise<NextResponse> {
  const token = request.cookies.get("engetech-token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const payload = verifyToken(token);

  if (!payload) {
    return NextResponse.json(
      { error: "Token inválido ou expirado" },
      { status: 401 },
    );
  }

  return handler(request, payload.userId);
}
