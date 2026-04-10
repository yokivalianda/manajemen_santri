import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const santris = await prisma.santri.findMany({
      orderBy: { nama: "asc" },
    });
    return NextResponse.json({ success: true, santris });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data santri." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nama, kelas, jilid, halaman, hafalan, status, kategori } = body;
    if (!nama || !kelas || !jilid || !halaman || !hafalan || !status || !kategori) {
      return NextResponse.json(
        { success: false, message: "Data tidak lengkap." },
        { status: 400 }
      );
    }
    const santri = await prisma.santri.create({
      data: {
        nama: String(nama).trim(),
        kelas: String(kelas).trim(),
        jilid: Number(jilid),
        halaman: Number(halaman),
        hafalan: String(hafalan).trim(),
        status: String(status).trim(),
        kategori: String(kategori).trim(),
      },
    });
    return NextResponse.json({ success: true, santri });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Gagal menambah santri." },
      { status: 500 }
    );
  }
}
