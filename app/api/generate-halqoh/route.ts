import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const CAPACITY = Math.max(1, Number(body.kapasitas) || 10);

    // 1. Fetch all santri
    const allSantri = await prisma.santri.findMany();

    // 2. Calculate sorting_score for each santri
    const scored = allSantri.map((s) => ({
      ...s,
      sorting_score: s.jilid * 1000 + s.halaman,
    }));

    // 3. Sort ascending by sorting_score, use kelas as tie-breaker
    scored.sort((a, b) => {
      if (a.sorting_score !== b.sorting_score) {
        return a.sorting_score - b.sorting_score;
      }
      return a.kelas.localeCompare(b.kelas);
    });

    // 4. Chunk into groups of CAPACITY
    const chunks: typeof scored[] = [];
    for (let i = 0; i < scored.length; i += CAPACITY) {
      chunks.push(scored.slice(i, i + CAPACITY));
    }

    // 5. Clear previous Halqoh data and save new groups
    await prisma.halqohSantri.deleteMany();
    await prisma.halqoh.deleteMany();

    const createdHalqohs = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const halqoh = await prisma.halqoh.create({
        data: {
          nama_kelompok: `Kelompok ${i + 1}`,
          kapasitas: CAPACITY,
          santris: {
            create: chunk.map((s) => ({
              santriId: s.id,
            })),
          },
        },
        include: {
          santris: {
            include: {
              santri: true,
            },
          },
        },
      });
      createdHalqohs.push(halqoh);
    }

    // Format response
    const result = createdHalqohs.map((h) => ({
      id: h.id,
      nama_kelompok: h.nama_kelompok,
      kapasitas: h.kapasitas,
      santris: h.santris.map((hs) => ({
        id: hs.santri.id,
        nama: hs.santri.nama,
        kelas: hs.santri.kelas,
        jilid: hs.santri.jilid,
        halaman: hs.santri.halaman,
        hafalan: hs.santri.hafalan,
        status: hs.santri.status,
        sorting_score: hs.santri.jilid * 1000 + hs.santri.halaman,
      })),
    }));

    return NextResponse.json({ success: true, halqohs: result });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat generate halqoh." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const halqohs = await prisma.halqoh.findMany({
      include: {
        santris: {
          include: {
            santri: true,
          },
        },
      },
    });

    const result = halqohs.map((h) => ({
      id: h.id,
      nama_kelompok: h.nama_kelompok,
      kapasitas: h.kapasitas,
      santris: h.santris.map((hs) => ({
        id: hs.santri.id,
        nama: hs.santri.nama,
        kelas: hs.santri.kelas,
        jilid: hs.santri.jilid,
        halaman: hs.santri.halaman,
        hafalan: hs.santri.hafalan,
        status: hs.santri.status,
        sorting_score: hs.santri.jilid * 1000 + hs.santri.halaman,
      })),
    }));

    return NextResponse.json({ success: true, halqohs: result });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat fetch halqoh." },
      { status: 500 }
    );
  }
}
