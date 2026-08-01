import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/authMiddleware'
import { fornecedorSchema } from '@/lib/schemas'

export async function GET(request: NextRequest) {
  return withAuth(request, async () => {
    try {
      const fornecedores = await prisma.fornecedor.findMany({
        include: { itens: true },
        orderBy: { createdAt: 'desc' }
      })
      return NextResponse.json(fornecedores)
    } catch (error) {
      return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
  })
}

export async function POST(request: NextRequest) {
  return withAuth(request, async () => {
    try {
      const body = await request.json()
      const result = fornecedorSchema.safeParse({ ...body, pedidoMinimo: Number(body.pedidoMinimo || 0) })

      if (!result.success) {
        return NextResponse.json(
          { error: 'Dados inválidos', detalhes: result.error.issues },
          { status: 400 }
        )
      }

      const fornecedor = await prisma.fornecedor.create({ data: result.data })
      return NextResponse.json(fornecedor, { status: 201 })
    } catch (error) {
      return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
  })
}