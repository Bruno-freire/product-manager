import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { calculateTimeInDays } from '../../../lib/utils';

const prisma = new PrismaClient();

type ComparedProduct = {
  id: number;
  code: string;
  productName: string;
  duration: number;
};

export async function POST(request: Request) {
  try {
    const { productList } = await request.json();

    if (!productList) {
      return NextResponse.json(
        { success: false, error: 'Product list is empty' },
        { status: 400 }
      );
    }

    // Regex para capturar o código e o nome do produto.
    // Espera o formato: "Número. <código> <nome do produto>-"
    const regex = /(\d+)\s([^\-]+)-.*/g;
    const results = [...productList.matchAll(regex)];

    // Mapeia os resultados para extrair o código e o nome do produto
    const newProductList = results.map(result => ({
      code: result[1].trim(),
      productName: result[2].trim()
    }));

    // Busca os produtos ativos no banco de dados
    const activeProducts = await prisma.product.findMany({
      where: { active: true }
    });
    const activeCodes = activeProducts.map(p => p.code);
    const newCodes = newProductList.map(p => p.code);

    // Define produtos novos, removidos e existentes
    const newProducts = newProductList.filter(p => !activeCodes.includes(p.code));
    const removedProducts = activeProducts.filter(p => !newCodes.includes(p.code));
    const existingProducts = activeProducts.filter(p => newCodes.includes(p.code));

    // Utiliza Promise.all para upsertar os produtos novos em paralelo
    const upsertPromises = newProducts.map(prod =>
      prisma.product.upsert({
        where: { code: prod.code },
        update: { active: true, entryDate: new Date() },
        create: {
          code: prod.code,
          productName: prod.productName,
          entryDate: new Date(),
          active: true
        }
      })
    );
    const createdProducts = await Promise.all(upsertPromises);

    // Desativa os produtos removidos com uma única operação
    if (removedProducts.length > 0) {
      await prisma.product.updateMany({
        where: { id: { in: removedProducts.map(p => p.id) } },
        data: { active: false }
      });
    }

    const sortedNewProducts = createdProducts.sort((a, b) => 
      new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
    );
    
    // Ordena os produtos existentes pelo entryDate (do mais recente para o mais antigo)
    const sortedExistingProducts = existingProducts.sort((a, b) => 
      new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
    );
    
    // Ordena os produtos removidos pelo entryDate (do mais recente para o mais antigo)
    const sortedRemovedProducts = removedProducts.sort((a, b) => 
      new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
    );
    
    // Prepara as respostas para os produtos criados, existentes e removidos
    const newResponse: ComparedProduct[] = sortedNewProducts.map(prod => ({
      id: prod.id,
      code: prod.code,
      productName: prod.productName,
      duration: calculateTimeInDays(prod.entryDate, prod.active)
    }));
    
    const existingResponse: ComparedProduct[] = sortedExistingProducts.map(prod => ({
      id: prod.id,
      code: prod.code,
      productName: prod.productName,
      duration: calculateTimeInDays(prod.entryDate, prod.active)
    }));
    
    const removedResponse: ComparedProduct[] = sortedRemovedProducts.map(prod => ({
      id: prod.id,
      code: prod.code,
      productName: prod.productName,
      duration: 0
    }));
    
    // Cria um snapshot da lista atual de produtos
    const snapshot = await prisma.list.create({
      data: {
        listProducts: {
          create: [
            ...sortedNewProducts.map(prod => ({
              product: { connect: { id: prod.id } }
            })),
            ...sortedExistingProducts.map(prod => ({
              product: { connect: { id: prod.id } }
            }))
          ]
        }
      },
      include: { listProducts: { include: { product: true } } }
    });
    
    return NextResponse.json({
      success: true,
      newProducts: newResponse,
      existingProducts: existingResponse,
      removedProducts: removedResponse,
      snapshotId: snapshot.id
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error processing the product list' },
      { status: 500 }
    );
  }
}
