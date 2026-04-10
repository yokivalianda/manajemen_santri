import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ImportRecord = {
  nama: string;
  kelas: string;
  jilid: number;
  halaman: number;
  hafalan: string;
  status: string;
  kategori: string;
};

export async function POST(request: Request) {
  try {
    const { records } = await request.json();

    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { success: false, message: "Data tidak valid atau kosong." },
        { status: 400 }
      );
    }

    // Validate each record
    const validRecords: ImportRecord[] = records.filter(
      (r) =>
        r.nama &&
        typeof r.nama === "string" &&
        r.nama.trim().length > 0 &&
        Number(r.jilid) > 0 &&
        Number(r.halaman) > 0
    );

    if (validRecords.length === 0) {
      return NextResponse.json(
        { success: false, message: "Tidak ada data valid dalam file CSV." },
        { status: 400 }
      );
    }

    // Bulk insert
    await prisma.santri.createMany({
      data: validRecords.map((r) => ({
        nama: r.nama.trim(),
        kelas: r.kelas?.trim() || "SD",
        jilid: Number(r.jilid),
        halaman: Number(r.halaman),
        hafalan: r.hafalan?.trim() || "-",
        status: r.status?.trim() || "Sedang Belajar",
        kategori: r.kategori?.trim() || "sedang",
      })),
    });

    // Return updated list
    const santris = await prisma.santri.findMany({ orderBy: { nama: "asc" } });
    return NextResponse.json({ success: true, santris, imported: validRecords.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Gagal import data santri." },
      { status: 500 }
    );
  }
}
