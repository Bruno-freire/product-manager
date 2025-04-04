import { NextResponse } from "next/server";
import { processingListProduct } from "@/lib/processingListProduct";

export async function POST(request: Request) {
  try {
    const { productList } = await request.json();

    if (!productList) {
      return NextResponse.json(
        { success: false, error: "Product list is empty" },
        { status: 400 }
      );
    }

    const { maintainedProducts, newProducts, removedProducts } = await processingListProduct(productList);

    return NextResponse.json({
      success: true,
      newProducts,
      existingProducts: maintainedProducts,
      removedProducts: removedProducts,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error processing the product list",
      },
      { status: 500 }
    );
  }
}
