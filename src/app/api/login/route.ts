import { prisma } from "@/lib/backend/prisma";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { SignJWT } from "jose";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

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

    if (!process.env.JWT_SECRET) {
      console.error("🚨 JWT_SECRET não definido");
      return NextResponse.json(
        { error: "Configuração de segurança ausente" },
        { status: 500 },
      );
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    const token = await new SignJWT({
      id: user.id,
      store: user.store,
      name: user.name,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1d")
      .sign(secret);

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, store: user.store, name: user.name },
    });

    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24,
      sameSite: "lax",
      secure: true,
    });

    return response; // IMPORTANTE: retornar response, não token
  } catch (error: any) {
    console.error("🔥 Erro inesperado no login:", error.message);
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 },
    );
  }
}
