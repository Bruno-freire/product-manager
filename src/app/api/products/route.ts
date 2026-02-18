import { NextResponse } from "next/server";
import { processingListProduct } from "@/lib/backend/processingListProduct";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 },
      );
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    const store = payload.store as string;

    if (!store) {
      return NextResponse.json(
        { success: false, error: "Usuário não autenticado" },
        { status: 401 },
      );
    }

    const { productList } = await request.json();

    if (!productList) {
      return NextResponse.json(
        { success: false, error: "Product list is empty" },
        { status: 400 },
      );
    }

    const { maintainedProducts, newProducts, removedProducts } =
      await processingListProduct(store, productList);

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
    console.error("Erro ao processar lista de produtos:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Error processing the product list",
      },
      { status: 500 },
    );
  }
}
