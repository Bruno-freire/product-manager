// src/app/api/products/existentes/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type ProdutoComparado = {
  id: number;
  codigo: string;
  nomeProduto: string;
  tempoDePermanencia: number;
};

export async function GET() {
  try {
    // Buscar produtos ativos no banco
    const produtosAtivos = await prisma.produto.findMany({
      where: { ativo: true }
    });

    // Preparar array de resposta (calculando tempo de permanência)
    const responseExistentes: ProdutoComparado[] = produtosAtivos.map(prod => ({
      id: prod.id,
      codigo: prod.codigo,
      nomeProduto: prod.nomeProduto,
      tempoDePermanencia: calcularTempoEmDias(prod.dataEntrada, prod.ativo)
    }));

    return NextResponse.json({
      success: true,
      produtosExistentes: responseExistentes
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao buscar produtos existentes' },
      { status: 500 }
    );
  }
}

// Função para calcular o tempo de permanência (em dias)
function calcularTempoEmDias(dataEntrada: Date, ativo: boolean): number {
  if (!ativo) return 0;
  const hoje = new Date();
  const diffMs = hoje.getTime() - new Date(dataEntrada).getTime();
  return Math.floor(diffMs / (1000 * 3600 * 24));
}