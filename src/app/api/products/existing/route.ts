// /api/products/existing/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { processingListProduct } from "@/lib/backend/processingListProduct";

export async function GET() {
  try {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = JSON.parse(token); // { id, name, store }

    if (!user.store) {
      throw new Error("Store obrigatória.");
    }

    const { maintainedProducts, newProducts, removedProducts } =
      await processingListProduct(user.store);

    return NextResponse.json({
      success: true,
      existingProducts: maintainedProducts,
      newProducts,
      removedProducts,
    });
  } catch (error: any) {
    console.error("Erro ao processar comparação de listas:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erro ao comparar listas de produtos",
      },
      { status: 500 }
    );
  }
}
