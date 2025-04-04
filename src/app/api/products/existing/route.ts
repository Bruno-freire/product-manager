import { NextResponse } from 'next/server';
import { processingListProduct } from '@/lib/processingListProduct';

export async function GET() {
  try {
    // Chamada da função principal que já lida com a lógica de buscar as últimas listas
    const { maintainedProducts, newProducts, removedProducts } = await processingListProduct();
 
    return NextResponse.json({
      success: true,
      existingProducts: maintainedProducts,
      newProducts,
      removedProducts,
    });
  } catch (error: any) {
    console.error('Erro ao processar comparação de listas:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro ao comparar listas de produtos',
      },
      { status: 500 }
    );
  }
}
