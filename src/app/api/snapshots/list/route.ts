// app/api/snapshots/list/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/backend/prisma";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
    const take = 20;
    const skip = (page - 1) * take;

    const [total, items] = await Promise.all([
      prisma.list.count(),
      prisma.list.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take,
        select: { id: true, createdAt: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      page,
      perPage: take,
      total,
      snapshots: items.map((s) => ({
        id: s.id,
        createdAt: s.createdAt,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Server error" }, { status: 500 });
  }
}
