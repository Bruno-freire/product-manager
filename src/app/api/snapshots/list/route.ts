// app/api/snapshots/list/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/backend/prisma";

export async function GET(request: Request) {
  try {
    // Recupera o token do cookie
    const token = request.headers
      .get("cookie")
      ?.split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

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
    if (!store) {
      return NextResponse.json(
        { success: false, error: "Store obrigatória" },
        { status: 400 },
      );
    }

    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
    const take = 20;
    const skip = (page - 1) * take;

    // Contagem e busca filtrada pela loja
    const [total, items] = await Promise.all([
      prisma.list.count({ where: { store } }),
      prisma.list.findMany({
        where: { store },
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
    return NextResponse.json(
      { success: false, error: err.message || "Server error" },
      { status: 500 },
    );
  }
}
