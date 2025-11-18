// app/api/snapshots/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/backend/prisma";

export async function GET(request: Request, { params }: { params: { id: number | string } }) {
  try {
    const { id } = params;
    const snapshot = await prisma.list.findUnique({
      where: { id: Number(id) },
    });

    if (!snapshot) {
      return NextResponse.json({ success: false, error: "Snapshot not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      snapshot: {
        id: snapshot.id,
        createdAt: snapshot.createdAt,
        products: snapshot.products,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Server error" }, { status: 500 });
  }
}
