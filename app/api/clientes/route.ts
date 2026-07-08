import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Listar todos os clientes
export async function GET() {
  try {
    const clientes = await prisma.cliente.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(clientes);
  } catch {
    return NextResponse.json(
      { error: "Erro interno ao buscar clientes" },
      { status: 500 },
    );
  }
}

// POST: Criar um novo cliente
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const cliente = await prisma.cliente.create({ data });
    return NextResponse.json(cliente, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Erro interno ao criar cliente" },
      { status: 500 },
    );
  }
}

// PUT: Atualizar um cliente existente
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json(
        { error: "ID do cliente é obrigatório" },
        { status: 400 },
      );
    }

    const clienteAtualizado = await prisma.cliente.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(clienteAtualizado);
  } catch {
    return NextResponse.json(
      { error: "Erro interno ao atualizar cliente" },
      { status: 500 },
    );
  }
}

// DELETE: Remover um cliente da base
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID do cliente é obrigatório" },
        { status: 400 },
      );
    }

    await prisma.cliente.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Cliente excluído com sucesso" });
  } catch {
    return NextResponse.json(
      { error: "Erro interno ao excluir cliente" },
      { status: 500 },
    );
  }
}
