import { NextResponse } from "next/server";
import { prisma } from "@/lib/backend/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
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

    const { id } = await context.params;

    const snapshot = await prisma.list.findFirst({
      where: {
        id: Number(id),
        store,
      },
    });

    if (!snapshot) {
      return NextResponse.json(
        { success: false, error: "Snapshot not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      snapshot: {
        id: snapshot.id,
        createdAt: snapshot.createdAt,
        products: snapshot.products,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
