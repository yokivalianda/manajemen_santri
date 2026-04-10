import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, message: "Username dan password wajib diisi." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Username sudah digunakan." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Setiap pendaftaran mandiri menjadi akun USER standar.
    const user = await prisma.user.create({
      data: {
        username: username,
        password: hashedPassword,
        role: "USER"
      }
    });

    return NextResponse.json({
      success: true,
      message: "Pendaftaran berhasil, silakan login.",
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan sistem." },
      { status: 500 }
    );
  }
}
