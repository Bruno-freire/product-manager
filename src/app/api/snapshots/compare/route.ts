// app/api/snapshots/compare/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/backend/prisma";
import { compareListsOfProducts } from "@/lib/backend/comparedLists";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { leftId, rightId } = body;

    if (!leftId || !rightId) {
      return NextResponse.json({ success: false, error: "leftId and rightId are required" }, { status: 400 });
    }

    const [leftSnap, rightSnap] = await Promise.all([
      prisma.list.findUnique({ where: { id: leftId } }),
      prisma.list.findUnique({ where: { id: rightId } }),
    ]);

    if (!leftSnap || !rightSnap) {
      return NextResponse.json({ success: false, error: "One or both snapshots not found" }, { status: 404 });
    }

    // left -> right: new = in right but not in left; removed = in left not in right
    const comparison = compareListsOfProducts(leftSnap.products as any[], rightSnap.products as any[], false);

    return NextResponse.json({
      success: true,
      left: { id: leftSnap.id, createdAt: leftSnap.createdAt },
      right: { id: rightSnap.id, createdAt: rightSnap.createdAt },
      newProducts: comparison.newProducts,
      existingProducts: comparison.maintainedProducts,
      removedProducts: comparison.removedProducts,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Server error" }, { status: 500 });
  }
}
