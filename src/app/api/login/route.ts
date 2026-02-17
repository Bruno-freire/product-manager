// /api/login/route.ts
import { prisma } from "@/lib/backend/prisma";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Credenciais inválidas" },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.json(
      { error: "Usuário não encontrado" },
      { status: 401 },
    );
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
  }

  // Criar cookie com informações mínimas do usuário
  const response = NextResponse.json({
    success: true,
    user: { id: user.id, name: user.name, store: user.store },
  });

  response.cookies.set({
    name: "token",
    value: JSON.stringify({ id: user.id, store: user.store, name: user.name }),
    httpOnly: true, // impede acesso via JS
    path: "/",
    maxAge: 60 * 60 * 24, // 1 dia
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
