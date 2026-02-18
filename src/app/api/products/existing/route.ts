// /api/products/existing/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { processingListProduct } from "@/lib/backend/processingListProduct";

export async function GET() {
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
        { success: false, error: "Store obrigatória." },
        { status: 400 },
      );
    }

    const { maintainedProducts, newProducts, removedProducts } =
      await processingListProduct(store);

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
        error: "Erro ao comparar listas de produtos",
      },
      { status: 500 },
    );
  }
}
