import { NextResponse } from "next/server";
import { compareDailyProductLists } from "@/lib/backend/dailyProductComparison";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { day1, day2 } = body;

    if (!day1 || !day2) {
      return NextResponse.json(
        { success: false, error: "Datas inválidas ou ausentes." },
        { status: 400 }
      );
    }

    // Chama a função que compara os produtos entre os dois dias
    const comparisonResult = await compareDailyProductLists(day1, day2);
 
    return NextResponse.json({ success: true, ...comparisonResult });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
