import { NextResponse } from "next/server";
import { prisma } from "@/lib/backend/prisma";
import { compareListsOfProducts } from "@/lib/backend/comparedLists";

export async function POST(request: Request) {
  try {
    const token = request.headers
      .get("cookie")
      ?.split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];
    if (!token)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );

    let user;
    try {
      user = JSON.parse(decodeURIComponent(token));
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 },
      );
    }

    const store = user.store;
    if (!store)
      return NextResponse.json(
        { success: false, error: "Store obrigatória" },
        { status: 400 },
      );

    const body = await request.json();
    const { leftId, rightId } = body;
    if (!leftId || !rightId)
      return NextResponse.json(
        { success: false, error: "leftId and rightId are required" },
        { status: 400 },
      );

    // Buscar snapshots filtrando pela loja
    const [leftSnap, rightSnap] = await Promise.all([
      prisma.list.findFirst({ where: { id: leftId, store } }),
      prisma.list.findFirst({ where: { id: rightId, store } }),
    ]);

    if (!leftSnap || !rightSnap) {
      return NextResponse.json(
        {
          success: false,
          error: "One or both snapshots not found for your store",
        },
        { status: 404 },
      );
    }

    const comparison = compareListsOfProducts(
      leftSnap.products as any[],
      rightSnap.products as any[],
      false,
    );

    return NextResponse.json({
      success: true,
      left: { id: leftSnap.id, createdAt: leftSnap.createdAt },
      right: { id: rightSnap.id, createdAt: rightSnap.createdAt },
      newProducts: comparison.newProducts,
      existingProducts: comparison.maintainedProducts,
      removedProducts: comparison.removedProducts,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Server error" },
      { status: 500 },
    );
  }
}
