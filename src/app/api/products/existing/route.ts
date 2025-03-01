import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { calculateTimeInDays } from '../../../../lib/utils';

const prisma = new PrismaClient();

type ComparedProduct = {
  id: number;
  code: string;
  productName: string;
  duration: number;
};

export async function GET() {
  try {
    // Fetch active products from the database
    const activeProducts = await prisma.product.findMany({
      where: { active: true }
    });

    // Prepare the response array (calculating the duration)
    const existingResponse: ComparedProduct[] = activeProducts.map(prod => ({
      id: prod.id,
      code: prod.code,
      productName: prod.productName,
      duration: calculateTimeInDays(prod.entryDate, prod.active)
    }));

    return NextResponse.json({
      success: true,
      existingProducts: existingResponse
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error fetching existing products' },
      { status: 500 }
    );
  }
}
