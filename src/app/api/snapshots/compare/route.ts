import { NextResponse } from "next/server";
import { prisma } from "@/lib/backend/prisma";
import { compareListsOfProducts } from "@/lib/backend/comparedLists";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function POST(request: Request) {
  try {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const store = payload.store as string;

    if (!store) {
      return NextResponse.json(
        { success: false, error: "Store obrigatória" },
        { status: 400 }
      );
    }

    const { leftId, rightId } = await request.json();

    if (!leftId || !rightId) {
      return NextResponse.json(
        { success: false, error: "leftId and rightId are required" },
        { status: 400 }
      );
    }

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
        { status: 404 }
      );
    }

    const comparison = compareListsOfProducts(
      leftSnap.products as any[],
      rightSnap.products as any[],
      false
    );

    return NextResponse.json({
      success: true,
      left: { id: leftSnap.id, createdAt: leftSnap.createdAt },
      right: { id: rightSnap.id, createdAt: rightSnap.createdAt },
      newProducts: comparison.newProducts,
      existingProducts: comparison.maintainedProducts,
      removedProducts: comparison.removedProducts,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
