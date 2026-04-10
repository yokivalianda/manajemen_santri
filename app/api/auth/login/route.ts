import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const username = payload.username.toLowerCase().trim();
    const password = payload.password;

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Username tidak ditemukan." },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Password salah." },
        { status: 401 }
      );
    }

    await createSession({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    return NextResponse.json({
      success: true,
      message: "Login berhasil",
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan sistem." },
      { status: 500 }
    );
  }
}
