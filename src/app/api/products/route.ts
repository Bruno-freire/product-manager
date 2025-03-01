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

    // Regex to capture product code and product name.
    // Expects the format: "Number. <code> <product name>-"
    const regex = /(\d+)\s([^\-]+)-.*/g;

    // Use matchAll to capture all occurrences and convert to an array
    const results = [...productList.matchAll(regex)];

    // Map results to extract code (group 1) and product name (group 2)
    const newProductList = results.map(result => ({
      code: result[1].trim(),
      productName: result[2].trim()
    }));

    // Fetch active products from the database
    const activeProducts = await prisma.product.findMany({
      where: { active: true }
    });

    const activeCodes = activeProducts.map(p => p.code);
    const newCodes = newProductList.map(p => p.code);

    // Determine new, removed, and existing products
    const newProducts = newProductList.filter(p => !activeCodes.includes(p.code));
    const removedProducts = activeProducts.filter(p => !newCodes.includes(p.code));
    const existingProducts = activeProducts.filter(p => newCodes.includes(p.code));

    const createdProducts = [];
    for (const prod of newProducts) {
      // Look for an inactive product with the same code
      const existingProduct = await prisma.product.findFirst({
        where: { code: prod.code, active: false }
      });

      let created;
      if (existingProduct) {
        // If it exists, reactivate the product
        created = await prisma.product.update({
          where: { id: existingProduct.id },
          data: { active: true }
        });
      } else {
        // Otherwise, create a new product
        created = await prisma.product.create({
          data: {
            code: prod.code,
            productName: prod.productName,
            entryDate: new Date(),
            active: true
          }
        });
      }
      createdProducts.push(created);
    }

    // Deactivate removed products
    for (const prod of removedProducts) {
      await prisma.product.update({
        where: { id: prod.id },
        data: { active: false }
      });
    }

    // Prepare responses for new, existing, and removed products
    const newResponse: ComparedProduct[] = createdProducts.map(prod => ({
      id: prod.id,
      code: prod.code,
      productName: prod.productName,
      duration: calculateTimeInDays(prod.entryDate, prod.active)
    }));

    const existingResponse: ComparedProduct[] = existingProducts.map(prod => ({
      id: prod.id,
      code: prod.code,
      productName: prod.productName,
      duration: calculateTimeInDays(prod.entryDate, prod.active)
    }));

    const removedResponse: ComparedProduct[] = removedProducts.map(prod => ({
      id: prod.id,
      code: prod.code,
      productName: prod.productName,
      duration: 0
    }));

    // Create a snapshot of the current product list
    const snapshot = await prisma.list.create({
      data: {
        listProducts: {
          create: [
            ...createdProducts.map(prod => ({
              product: { connect: { id: prod.id } }
            })),
            ...existingProducts.map(prod => ({
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
