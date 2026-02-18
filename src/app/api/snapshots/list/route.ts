// app/api/snapshots/list/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/backend/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function GET(request: Request) {
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
        { success: false, error: "Store obrigatória" },
        { status: 400 },
      );
    }

    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
    const take = 20;
    const skip = (page - 1) * take;

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
      snapshots: items,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}
