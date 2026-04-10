import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nama, kelas, jilid, halaman, hafalan, status, kategori } = body;

    const santri = await prisma.santri.update({
      where: { id },
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
      { success: false, message: "Gagal memperbarui data santri." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Remove from halqoh associations first (cascade might handle, but explicit is safer)
    await prisma.halqohSantri.deleteMany({ where: { santriId: id } });
    await prisma.santri.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus santri." },
      { status: 500 }
    );
  }
}
