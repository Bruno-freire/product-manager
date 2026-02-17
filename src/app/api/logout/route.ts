// /api/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: "token",
    value: "",
    path: "/",
    maxAge: 0, // expira imediatamente
  });
  return response;
}
