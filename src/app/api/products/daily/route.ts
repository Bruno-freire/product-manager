import { NextResponse } from "next/server";
import { compareDailyProductLists } from "@/lib/backend/dailyProductComparison";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function POST(request: Request) {
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
        { success: false, error: "Usuário sem store válida" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { day1, day2 } = body;

    if (!day1 || !day2) {
      return NextResponse.json(
        { success: false, error: "Datas inválidas ou ausentes." },
        { status: 400 },
      );
    }

    const comparisonResult = await compareDailyProductLists(
      store,
      day1,
      day2,
    );

    return NextResponse.json({
      success: true,
      ...comparisonResult,
    });
  } catch (error: any) {
    console.error("Erro na comparação diária:", error);

    return NextResponse.json(
      { success: false, error: "Erro interno no servidor" },
      { status: 500 },
    );
  }
}
