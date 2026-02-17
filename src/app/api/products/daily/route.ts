import { NextResponse } from "next/server";
import { compareDailyProductLists } from "@/lib/backend/dailyProductComparison";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const user = JSON.parse(token);
    if (!user?.store) {
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

    // Passa a store do usuário
    const comparisonResult = await compareDailyProductLists(
      user.store,
      day1,
      day2,
    );

    return NextResponse.json({ success: true, ...comparisonResult });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
