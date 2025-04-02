import { NextResponse } from 'next/server';
import { calculateTimeInDays } from '../../../../lib/utils';
import { prisma } from '../../../../lib/prisma';

type ComparedProduct = {
  id: number;
  code: string;
  productName: string;
  duration: number;
};

export async function GET() {
  try {
    // Busca somente os campos necessários dos produtos ativos
    const activeProducts = await prisma.product.findMany({
      where: { active: true },
      select: {
        id: true,
        code: true,
        productName: true,
        address: true,
        amount: true,
        entryDate: true,
        active: true
      }
    });

    // Ordena os produtos pelo entryDate (do mais recente para o mais antigo)
    const sortedActiveProducts = activeProducts.sort((a, b) => 
      new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
    );

    // Prepara o array de resposta, calculando a duração para cada produto
    const existingResponse: ComparedProduct[] = sortedActiveProducts.map(prod => ({
      id: prod.id,
      code: prod.code,
      productName: prod.productName,
      address: prod.address,
      amount: prod.amount,
      duration: calculateTimeInDays(prod.entryDate, prod.active)
    }));

    return NextResponse.json({
      success: true,
      existingProducts: existingResponse
    });
  } catch (error: any) {
    // Log do erro para facilitar a depuração
    console.error('Error fetching existing products:', error);

    return NextResponse.json(
      { success: false, error: error.message || 'Error fetching existing products' },
      { status: 500 }
    );
  }
}