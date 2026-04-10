import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getSession, createSession } from "@/lib/auth";

export async function PUT(req: Request) {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { newUsername, newPassword } = await req.json();
    const cleanUsername = newUsername?.toLowerCase().trim();

    // Pastikan username baru tidak diambil oleh orang lain
    if (cleanUsername && cleanUsername !== session.username) {
      const existing = await prisma.user.findUnique({ where: { username: cleanUsername } });
      if (existing) {
        return NextResponse.json({ success: false, message: "Username sudah digunakan oleh akun lain." }, { status: 400 });
      }
    }

    // Persiapkan pembaruan (hanya jika diisi)
    const updateData: any = {};
    if (cleanUsername) updateData.username = cleanUsername;
    if (newPassword && newPassword.length >= 6) {
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, message: "Tidak ada data yang diubah." }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.id },
      data: updateData
    });

    // Perbarui sesi dengan username yang baru
    await createSession({
      id: updatedUser.id,
      username: updatedUser.username,
      role: updatedUser.role
    });

    return NextResponse.json({ success: true, message: "Profil berhasil diperbarui", user: { username: updatedUser.username } });

  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan pada sistem." }, { status: 500 });
  }
}
