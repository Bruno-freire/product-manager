// /api/login/route.ts (server-side)
import { prisma } from "@/lib/backend/prisma";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password)
    return NextResponse.json(
      { error: "Credenciais inválidas" },
      { status: 400 },
    );

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user)
    return NextResponse.json(
      { error: "Usuário não encontrado" },
      { status: 401 },
    );

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch)
    return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });

  return NextResponse.json({
    success: true,
    user: { id: user.id, name: user.name, store: user.store },
  });
}
