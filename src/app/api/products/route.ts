import { NextResponse } from "next/server";
import { processingListProduct } from "@/lib/backend/processingListProduct";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const user = JSON.parse(token);
    const { productList } = await request.json();

    if (!productList) {
      return NextResponse.json(
        { success: false, error: "Product list is empty" },
        { status: 400 },
      );
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuário não autenticado" },
        { status: 401 },
      );
    }

    const { maintainedProducts, newProducts, removedProducts } =
      await processingListProduct(user.store, productList);

    if (
      !maintainedProducts.length &&
      !newProducts.length &&
      !removedProducts.length
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Nenhum produto encontrado ou formato inválido",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      newProducts,
      existingProducts: maintainedProducts,
      removedProducts,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error processing the product list",
      },
      { status: 500 },
    );
  }
}
