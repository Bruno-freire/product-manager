import { prisma } from "@/lib/backend/prisma";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { SignJWT } from "jose";

export async function POST(req: Request) {
  console.log("🔐 [LOGIN] Requisição recebida");

  try {
    const body = await req.json();
    const { email, password } = body;

    console.log("📩 Email recebido:", email);

    if (!email || !password) {
      console.log("❌ Email ou senha ausentes");
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 400 },
      );
    }

    console.log("🔎 Buscando usuário no banco...");
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      console.log("❌ Usuário não encontrado:", email);
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 401 },
      );
    }

    console.log("👤 Usuário encontrado:", user.id);

    console.log("🔑 Comparando senha...");
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      console.log("❌ Senha incorreta para usuário:", user.id);
      return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
    }

    console.log("✅ Senha válida");

    if (!process.env.JWT_SECRET) {
      console.error("🚨 JWT_SECRET não definido");
      return NextResponse.json(
        { error: "Configuração de segurança ausente" },
        { status: 500 },
      );
    }

    console.log("🪪 Gerando token JWT...");
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    const token = await new SignJWT({
      id: user.id,
      store: user.store,
      name: user.name,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1d")
      .sign(secret);

    console.log("🎟 Token gerado com sucesso");

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

    console.log("🍪 Cookie definido");
    console.log("🚀 Login concluído com sucesso");

    return response; // IMPORTANTE: retornar response, não token
  } catch (error: any) {
    console.error("🔥 Erro inesperado no login:", error.message);
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 },
    );
  }
}
